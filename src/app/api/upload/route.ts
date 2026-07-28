import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveDataUrl } from "@/lib/upload";
import { isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  dataUrl: z.string().startsWith("data:image/"),
});

// 公开上传（回收表单用），带 IP 限流以防滥用。
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`upload:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "上传过于频繁" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  try {
    const url = await saveDataUrl(parsed.data.dataUrl);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 400 },
    );
  }
}
