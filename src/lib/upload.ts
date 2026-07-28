import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/**
 * 将 base64 图片 dataURL 落盘到 public/uploads，返回可公开访问的 URL。
 * dataURL 形如 data:image/jpeg;base64,xxxx。
 */
export async function saveDataUrl(dataUrl: string): Promise<string> {
  const match =
    /^data:(image\/(png|jpe?g|webp|gif));base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error("图片格式不支持");
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  const buf = Buffer.from(match[3], "base64");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${nanoid()}.${ext}`;
  await writeFile(join(UPLOAD_DIR, filename), buf);
  return `/uploads/${filename}`;
}
