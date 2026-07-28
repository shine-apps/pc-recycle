/**
 * 前端图片压缩（步骤 4 / 8）。
 * 用 canvas 将图片缩放到最大边 maxSize，导出为 JPEG dataURL，显著减小上传体积。
 * 仅在浏览器环境调用（被客户端组件 import）。
 */
export async function compressImage(
  file: File,
  maxSize = 1280,
  quality = 0.7,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("无法创建画布上下文");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas.toDataURL("image/jpeg", quality);
}
