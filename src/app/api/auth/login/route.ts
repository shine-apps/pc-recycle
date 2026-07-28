import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { sessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  const token = await login(parsed.data.username, parsed.data.password);
  if (!token) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Set-Cookie": sessionCookie(token) } },
  );
}
