// 轻量 cn：合并 className（支持字符串与 {class: boolean} 对象）。
// 不依赖 clsx / tailwind-merge，避免在受限沙箱中 pnpm add 被安全删除拦截。
type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (typeof i === "string" || typeof i === "number") {
      out.push(String(i));
    } else if (typeof i === "object") {
      for (const [k, v] of Object.entries(i)) if (v) out.push(k);
    }
  }
  return out.join(" ");
}
