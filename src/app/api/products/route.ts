import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, like } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

// 公开：在售列表（支持分类/品牌/关键词/排序过滤）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const q = searchParams.get("q")?.trim();
  const sort = searchParams.get("sort") ?? "new";
  const statusParam = searchParams.get("status");
  const status: "onsale" | "off" | "sold" =
    statusParam === "off" ? "off" : statusParam === "sold" ? "sold" : "onsale";

  const db = await getDb();
  const conditions = [eq(products.status, status)];
  if (categoryId) conditions.push(eq(products.categoryId, Number(categoryId)));
  if (brandId) conditions.push(eq(products.brandId, Number(brandId)));
  if (q) conditions.push(like(products.title, `%${q}%`));

  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
        ? desc(products.price)
        : desc(products.createdAt);

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBy);

  return NextResponse.json({ items: rows });
}
