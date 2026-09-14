"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  /** 分享卡片标题，默认取 document.title */
  title?: string;
  /** 分享描述文案 */
  text?: string;
  /** 分享链接，默认取当前页面地址 */
  url?: string;
  /** fab：全站右下角悬浮按钮；button：行内按钮（如商品详情页） */
  variant?: "fab" | "button";
  /** 行内按钮文字 */
  label?: string;
  className?: string;
};

function isWeChat() {
  return /micromessenger/i.test(navigator.userAgent);
}

/** 复制链接：优先 Clipboard API，降级 execCommand（兼容非 HTTPS / 旧浏览器） */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

/** 微信内引导浮层：H5 无法直接唤起分享面板，只能引导用户点右上角「···」 */
function ShareGuideOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="微信分享引导"
    >
      {/* 右上角 ··· 高亮与指引箭头 */}
      <div className="pointer-events-none absolute right-2 top-1 flex flex-col items-center">
        <div className="rounded-lg border-2 border-white px-2.5 py-0.5 text-xl font-bold leading-8 tracking-[0.2em] text-white">
          ···
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-1 h-12 w-12 text-yellow-300"
        >
          <path d="M19 5v7" />
          <path d="M19 5l-4 4" />
          <path d="M19 5l4 4" />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-32 px-8 text-center text-white">
        <p className="text-lg font-semibold">点击右上角「···」图标</p>
        <p className="mt-3 text-sm leading-6 text-white/85">
          选择「发送给朋友」
          <br />
          或「分享到朋友圈」
        </p>
        <p className="mt-10 text-xs text-white/55">点击任意处关闭</p>
      </div>
    </div>
  );
}

export default function ShareButton({
  title,
  text,
  url,
  variant = "fab",
  label = "分享",
  className,
}: ShareButtonProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  async function handleClick() {
    const shareUrl = url ?? window.location.href;
    const shareTitle = title ?? document.title;
    const shareText = text ?? shareTitle;

    // 微信（含企业微信）内：无法 JS 唤起分享面板，引导用户走右上角菜单
    if (isWeChat()) {
      setShowGuide(true);
      return;
    }

    // 普通浏览器：优先系统分享面板（手机浏览器可直接转到微信等）
    if (typeof navigator.share === "function") {
      const data = { title: shareTitle, text: shareText, url: shareUrl };
      try {
        if (typeof navigator.canShare !== "function" || navigator.canShare(data)) {
          await navigator.share(data);
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // 其他错误继续降级到复制链接
      }
    }

    const ok = await copyText(shareUrl);
    showToast(ok ? "链接已复制，快去微信分享给好友吧" : "复制失败，请手动复制地址栏链接");
  }

  return (
    <>
      {variant === "fab" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label="分享本页到微信"
          className={cn(
            "fixed bottom-5 right-4 z-40 inline-flex h-12 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:bg-primary/90 active:scale-95",
            className,
          )}
        >
          <ShareIcon className="h-5 w-5" />
          分享
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "shrink-0",
            className,
          )}
        >
          <ShareIcon className="h-4 w-4" />
          {label}
        </button>
      )}

      {showGuide && <ShareGuideOverlay onClose={() => setShowGuide(false)} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground/90 px-4 py-2 text-sm text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
