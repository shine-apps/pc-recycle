import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { issueCaptcha, verifyCaptcha } from "./captcha";
import { isRateLimited } from "./rateLimit";
import { jwtSecret } from "./session";

function answerOf(question: string): number {
  const m = question.match(/(\d+)\s*([+−])\s*(\d+)/);
  if (!m) throw new Error("无法解析题目: " + question);
  const a = Number(m[1]);
  const b = Number(m[3]);
  return m[2] === "+" ? a + b : a - b;
}

describe("captcha", () => {
  it("下发挑战且正确答案可通过校验", async () => {
    const c = await issueCaptcha();
    expect(c.token).toBeTruthy();
    expect(c.question).toMatch(/= \?$/);
    expect(await verifyCaptcha(c.token, String(answerOf(c.question)))).toBe(true);
  });

  it("答案错误时校验失败", async () => {
    const c = await issueCaptcha();
    const wrong = String(answerOf(c.question) + 1);
    expect(await verifyCaptcha(c.token, wrong)).toBe(false);
  });

  it("非法/空 token 或空答案直接失败", async () => {
    expect(await verifyCaptcha("not-a-real-token", "1")).toBe(false);
    expect(await verifyCaptcha(undefined, "")).toBe(false);
    expect(await verifyCaptcha("", "   ")).toBe(false);
  });

  it("过期 token 校验失败", async () => {
    const expired = await new SignJWT({ ans: 5 })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(jwtSecret);
    expect(await verifyCaptcha(expired, "5")).toBe(false);
  });
});

describe("rateLimit（内存单例）", () => {
  it("达到阈值后返回限流", () => {
    const key = "unit-test:" + Math.random().toString(36).slice(2);
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
  });
});
