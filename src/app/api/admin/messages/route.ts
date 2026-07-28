import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function GET() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt));
  return NextResponse.json({ items: rows });
}
