import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories, brands } from "@/db/schema";

export const dynamic = "force-dynamic";

// 公开：分类 + 品牌，供前台筛选器使用
export async function GET() {
  const db = await getDb();
  const [cats, brs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(brands).orderBy(asc(brands.sort)),
  ]);
  return NextResponse.json({ categories: cats, brands: brs });
}
