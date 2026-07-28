import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories } from "@/db/schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sort: z.number().int().default(0),
});

// 受 middleware 保护：仅管理员
export async function GET() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sort));
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  const db = await getDb();
  const [row] = await db
    .insert(categories)
    .values(parsed.data)
    .returning();
  return NextResponse.json({ ok: true, item: row }, { status: 201 });
}
