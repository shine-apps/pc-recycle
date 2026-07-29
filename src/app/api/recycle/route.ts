import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { recycleOrders, priceRules } from "@/db/schema";
import { recycleOrderInputSchema } from "@/lib/validators";
import {
  estimatePrice,
  type PriceRule as Rule,
} from "@/lib/estimate";
import { isRateLimited } from "@/lib/rateLimit";
import { verifyCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`recycle:${ip}`, 5, 60_000)) {
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
  const parsed = recycleOrderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "请填写必填项" }, { status: 400 });
  }

  const db = await getDb();
  const rules = (await db.select().from(priceRules)) as unknown as Rule[];
  const est = estimatePrice(
    {
      deviceType: parsed.data.deviceType,
      brand: parsed.data.brand,
      model: parsed.data.model,
      condition: parsed.data.condition,
      config: parsed.data.config,
    },
    rules,
  );

  const [row] = await db
    .insert(recycleOrders)
    .values({
      deviceType: parsed.data.deviceType,
      brand: parsed.data.brand ?? null,
      model: parsed.data.model ?? null,
      config: parsed.data.config ?? null,
      condition: parsed.data.condition,
      buyYear: parsed.data.buyYear ?? null,
      images: parsed.data.images,
      expectPrice: parsed.data.expectPrice ?? null,
      contactPhone: parsed.data.contactPhone,
      contactWechat: parsed.data.contactWechat ?? null,
      status: "pending",
      estRange: est.mode === "auto" ? est.range : null,
      estMode: est.mode,
    })
    .returning();

  return NextResponse.json({ ok: true, estimate: est, orderId: row.id });
}
