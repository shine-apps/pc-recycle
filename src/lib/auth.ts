import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { signSession } from "./session";

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function login(
  username: string,
  password: string,
): Promise<string | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.admin)
    .where(eq(schema.admin.username, username))
    .limit(1);

  if (!row) return null;
  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return null;

  return signSession({ sub: String(row.id), role: "admin" });
}
