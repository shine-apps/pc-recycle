import { NextResponse } from "next/server";
import { issueCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

// 公开：返回一道验证码挑战（题目 + 签名 token），供回收/留言表单防刷使用。
export async function GET() {
  const challenge = await issueCaptcha();
  return NextResponse.json(challenge);
}
