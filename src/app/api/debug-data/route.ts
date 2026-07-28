import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { priceRules, products, categories } from "@/db/schema";
import { count } from "drizzle-orm";
import { estimatePrice, type PriceRule } from "@/lib/estimate";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const pr = (await db.select().from(priceRules)) as unknown as PriceRule[];
  const pc = await db.select({ c: count() }).from(products);
  const cc = await db.select({ c: count() }).from(categories);
  const est = estimatePrice(
    { deviceType: "笔记本", brand: "苹果", model: "MacBook Pro 13", condition: "95新", config: { cpu: "M1" } },
    pr,
  );
  return NextResponse.json({
    priceRulesCount: pr.length,
    priceRules: pr,
    productsCount: pc[0]?.c,
    categoriesCount: cc[0]?.c,
    estimate: est,
  });
}
