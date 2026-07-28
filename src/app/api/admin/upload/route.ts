import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveDataUrl } from "@/lib/upload";

export const dynamic = "force-dynamic";

const schema = z.object({
  dataUrl: z.string().startsWith("data:image/"),
});

// 受 middleware 保护：仅管理员可上传。
export async function POST(req: NextRequest) {
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
