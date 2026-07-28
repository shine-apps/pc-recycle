import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { priceRules } from "@/db/schema";
import { priceRuleInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
    .update(priceRules)
    .set(parsed.data)
    .where(eq(priceRules.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "规则不存在" }, { status: 404 });
  return NextResponse.json({ ok: true, item: row });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const [row] = await db
    .delete(priceRules)
    .where(eq(priceRules.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "规则不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
