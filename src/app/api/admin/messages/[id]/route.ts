import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";
import { messageUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const msgId = Number(id);
  if (!Number.isInteger(msgId)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const parsed = messageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const db = await getDb();
  const [row] = await db
    .update(messages)
    .set({ handled: parsed.data.handled })
    .where(eq(messages.id, msgId))
    .returning();
  if (!row) {
    return NextResponse.json({ error: "留言不存在" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: row });
}
