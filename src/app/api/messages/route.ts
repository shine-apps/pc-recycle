import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";
import { messageInputSchema } from "@/lib/validators";
import { isRateLimited } from "@/lib/rateLimit";
import { verifyCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

// 公开：访客提交留言/咨询（带 IP 限流 + 简单验证码防刷）
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`msg:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "提交过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!(await verifyCaptcha(body?.captchaToken, body?.captchaAnswer))) {
    return NextResponse.json(
      { error: "验证码错误或已失效，请重试" },
      { status: 400 },
    );
  }
  const parsed = messageInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const db = await getDb();
  const [row] = await db
    .insert(messages)
    .values({
      productId: parsed.data.productId,
      content: parsed.data.content,
      contact: parsed.data.contact,
    })
    .returning();
  return NextResponse.json({ ok: true, item: row }, { status: 201 });
}
