import type { Metadata, Viewport } from "next";
import "./globals.css";

// 生产环境通过 NEXT_PUBLIC_SITE_URL（构建时注入）声明站点对外地址，
// 用于把 /share-logo.png 等相对路径补全为微信抓取所需的绝对 URL。
// 用 || 而非 ??：CI 未配置该变量时是空字符串，new URL("") 会抛 Invalid URL。
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "桐乡阳光回收 · 二手电脑出售",
  description: "本地二手电脑与配件回收、出售，老板直连，线下交易更放心。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "桐乡阳光回收",
    title: "桐乡阳光回收 · 二手电脑回收出售",
    description: "本地二手电脑与配件回收、出售，老板直连，线下交易更放心。",
    images: [{ url: "/share-logo.png", width: 500, height: 500 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
