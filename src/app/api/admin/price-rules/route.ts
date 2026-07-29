import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { priceRules } from "@/db/schema";
import { priceRuleInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function GET() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(priceRules)
    .orderBy(desc(priceRules.id));
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = priceRuleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const db = await getDb();
  const [row] = await db
    .insert(priceRules)
    .values(parsed.data)
    .returning();
  return NextResponse.json({ ok: true, item: row }, { status: 201 });
}
