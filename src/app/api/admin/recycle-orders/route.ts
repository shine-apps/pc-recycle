import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { recycleOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const db = await getDb();
  const rows = await db
    .select()
    .from(recycleOrders)
    .where(status ? eq(recycleOrders.status, status as never) : undefined)
    .orderBy(desc(recycleOrders.createdAt));
  return NextResponse.json({ items: rows });
}
