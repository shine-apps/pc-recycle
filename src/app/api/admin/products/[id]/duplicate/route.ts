import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员。
// 克隆商品为「下架」草稿，便于快速录入相似机型；复制除 id/createdAt/status 外的全部字段。
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const [src] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  if (!src) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }
  const [row] = await db
    .insert(products)
    .values({
      categoryId: src.categoryId,
      brandId: src.brandId,
      title: `${src.title} 副本`,
      condition: src.condition,
      price: src.price,
      config: src.config,
      images: src.images,
      status: "off",
      description: src.description,
    })
    .returning();
  return NextResponse.json({ ok: true, item: row }, { status: 201 });
}
