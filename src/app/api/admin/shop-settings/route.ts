import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { shopSettings } from "@/db/schema";
import { shopSettingsUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// 受 middleware 保护：仅管理员
export async function GET() {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);
  return NextResponse.json({ shop: row ?? null });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = shopSettingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);

  let row;
  if (existing) {
    [row] = await db
      .update(shopSettings)
      .set(parsed.data)
      .where(eq(shopSettings.id, 1))
      .returning();
  } else {
    [row] = await db
      .insert(shopSettings)
      .values({ id: 1, ...parsed.data })
      .returning();
  }
  return NextResponse.json({ ok: true, shop: row });
}
