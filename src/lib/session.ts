import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "pc_admin_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-please-change",
);

/** 共享的 JWT 签名密钥（HMAC），供 session 与 captcha 等模块复用同一 AUTH_SECRET。 */
export const jwtSecret = secret;

export interface SessionPayload {
  sub: string;
  role: string;
}

export async function signSession(payload: {
  sub: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      role: String(payload.role ?? "admin"),
    };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${
    60 * 60 * 24 * 7
  }`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return match.slice(COOKIE_NAME.length + 1);
}

export async function getSession(req: Request): Promise<SessionPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifySession(token);
}
