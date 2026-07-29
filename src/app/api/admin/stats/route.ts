import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { recycleOrders, messages } from "@/db/schema";

export const dynamic = "force-dynamic";

/** 后台导航角标：仅返回计数，不拉全量数据 */
export async function GET() {
  const db = await getDb();

  const [pending, unread] = await Promise.all([
    db
      .select({ value: count() })
      .from(recycleOrders)
      .where(eq(recycleOrders.status, "pending" as never)),
    db
      .select({ value: count() })
      .from(messages)
      .where(eq(messages.handled, false)),
  ]);

  return NextResponse.json({
    pendingOrders: pending[0]?.value ?? 0,
    unreadMessages: unread[0]?.value ?? 0,
  });
}
