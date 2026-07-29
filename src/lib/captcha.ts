/**
 * 极简算术验证码（防刷，需求·非功能需求「简单验证码」）。
 * - 服务端随机出一道 1~10 的加减法，把「题目参数 + 答案 + 过期时间」用 AUTH_SECRET 签名成 token 下发。
 * - 客户端展示题目，用户填写答案并连同 token 回传；服务端验签 + 比对答案。
 * - 零额外依赖（复用 jose / AUTH_SECRET）。token 有效期 5 分钟，过期或答案错误均视为失败。
 * - 说明：本验证码为「轻量人防刷」，非强图形验证码；v1 够用，多实例/Serverless 场景可换更强方案。
 */
import { SignJWT, jwtVerify } from "jose";
import { jwtSecret } from "./session";

const CAPTCHA_TTL_SECONDS = 5 * 60; // 5 分钟

type CaptchaOp = "+" | "-";

function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * (maxExclusive + 1));
}

export type CaptchaChallenge = {
  question: string;
  token: string;
};

/** 下发一道新的验证码挑战（题目 + 签名 token）。 */
export async function issueCaptcha(): Promise<CaptchaChallenge> {
  const a = randInt(9) + 1; // 1..10
  const b = randInt(9) + 1; // 1..10
  const op: CaptchaOp = Math.random() < 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;

  const token = await new SignJWT({ a, b, op, ans: answer })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + CAPTCHA_TTL_SECONDS)
    .sign(jwtSecret);

  const symbol = op === "+" ? "+" : "−";
  return { question: `${a} ${symbol} ${b} = ?`, token };
}

/**
 * 校验验证码。任何异常（缺参、签名错、过期、答案不匹配、非数字）均返回 false。
 * 注意：token 在有效期内可重复使用（v1 简单实现，不做单次消费）。
 */
export async function verifyCaptcha(
  token: unknown,
  answer: unknown,
): Promise<boolean> {
  if (typeof token !== "string" || typeof answer !== "string") return false;
  const trimmed = answer.trim();
  if (token.length === 0 || trimmed.length === 0) return false;
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    const expected = Number(payload.ans);
    const given = Number(trimmed);
    if (!Number.isFinite(expected) || !Number.isFinite(given)) return false;
    return expected === given;
  } catch {
    return false;
  }
}
