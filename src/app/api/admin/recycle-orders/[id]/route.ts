import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { recycleOrders } from "@/db/schema";
import { recycleOrderUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = recycleOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = await getDb();
  const [existing] = await db
    .select()
    .from(recycleOrders)
    .where(eq(recycleOrders.id, orderId))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "回收单不存在" }, { status: 404 });
  }

  const [row] = await db
    .update(recycleOrders)
    .set(parsed.data)
    .where(eq(recycleOrders.id, orderId))
    .returning();
  return NextResponse.json({ ok: true, item: row });
}
