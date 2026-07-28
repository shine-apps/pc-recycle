import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { recycleOrders, products, brands, categories } from "@/db/schema";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
// 将回收单转为在售商品：生成一条 products 记录，并将回收单状态置为 deal。
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const db = await getDb();
  const [order] = await db
    .select()
    .from(recycleOrders)
    .where(eq(recycleOrders.id, orderId))
    .limit(1);
  if (!order) {
    return NextResponse.json({ error: "回收单不存在" }, { status: 404 });
  }

  // 尝试把订单里的品牌/分类字符串匹配到已有品牌/分类，方便前台归类
  let brandId: number | null = null;
  let categoryId: number | null = null;
  if (order.brand) {
    const [b] = await db
      .select()
      .from(brands)
      .where(sql`lower(${brands.name}) = lower(${order.brand})`)
      .limit(1);
    brandId = b?.id ?? null;
  }
  const [c] = await db
    .select()
    .from(categories)
    .where(sql`lower(${categories.name}) = lower(${order.deviceType})`)
    .limit(1);
  categoryId = c?.id ?? null;

  const price =
    order.finalPrice ?? order.estRange?.max ?? 0;
  const title = `${order.brand ?? order.deviceType} ${order.model ?? ""}`.trim();
  const estText = order.estRange
    ? `回收估价区间 ¥${order.estRange.min} - ¥${order.estRange.max}。`
    : "";
  const description = [estText, order.note].filter(Boolean).join("\n") || undefined;

  const [product] = await db
    .insert(products)
    .values({
      categoryId,
      brandId,
      title,
      condition: order.condition,
      price,
      config: order.config,
      images: order.images,
      status: "onsale",
      description,
    })
    .returning();

  const [updated] = await db
    .update(recycleOrders)
    .set({ status: "deal" })
    .where(eq(recycleOrders.id, orderId))
    .returning();

  return NextResponse.json({ ok: true, product, order: updated }, { status: 201 });
}
