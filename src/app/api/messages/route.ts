import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";
import { messageInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 公开：访客提交留言/咨询
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
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
