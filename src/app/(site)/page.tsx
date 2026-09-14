import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import ShareFallbackImage from "@/components/share/ShareFallbackImage";

export const metadata: Metadata = {
  title: "桐乡阳光回收 · 二手电脑回收出售，老板直连",
  description:
    "笔记本、台式机、配件全收；明码标价的二手好物在线挑选，在线估价秒出区间，老板直连，线下当面验机交易更放心。",
  alternates: { canonical: "/" },
};

const NAV = [
  { href: "/products", label: "逛逛在售", desc: "明码标价的二手好物" },
  { href: "/recycle", label: "在线估价回收", desc: "填信息秒出估价区间" },
  { href: "/contact", label: "联系老板", desc: "电话/微信直连" },
  { href: "/admin", label: "后台管理", desc: "老板专用入口" },
];

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">二手电脑回收 · 出售</h1>
        <p className="mt-2 text-sm text-blue-100">
          笔记本、台式机、配件全收；明码标价，老板直连，线下交易更放心。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="block">
            <Card className="h-full transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-4">
                <div className="text-base font-semibold text-foreground">
                  {n.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{n.desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        全栈已贯通：Next.js + Drizzle + PostgreSQL/PGlite。商品、估价、联系购买均已可用。
      </p>

      <ShareFallbackImage />
    </section>
  );
}
