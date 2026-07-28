import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { shopSettings } from "@/db/schema";

export const dynamic = "force-dynamic";

// 公开：店铺设置（电话 / 微信二维码 / 地址等）
export async function GET() {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);
  return NextResponse.json({ shop: row ?? null });
}
