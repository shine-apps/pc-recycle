import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const CARDS = [
  {
    href: "/admin/products",
    title: "商品管理",
    desc: "上架 / 下架 / 编辑 / 删除，多图上传",
  },
  {
    href: "/admin/categories",
    title: "分类与品牌",
    desc: "维护分类、品牌，前台筛选器自动同步",
  },
  {
    href: "/admin/recycle-orders",
    title: "回收单",
    desc: "查看估价、报价、转在售",
  },
  {
    href: "/admin/messages",
    title: "留言 / 咨询",
    desc: "查看并标记已处理",
  },
  {
    href: "/admin/settings",
    title: "店铺设置",
    desc: "电话 / 微信 / 地址 / 公告",
  },
];

export default function AdminHome() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">后台概览</h1>
      <p className="text-sm text-muted-foreground">
        全栈已贯通：商品上架后可前台展示并联系购买；回收估价表单已接入估价引擎。
      </p>
      <div className="grid gap-3">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className={buttonVariants({ variant: "outline", className: "h-auto justify-between px-4 py-3 text-left" })}>
            <span>
              <span className="block font-semibold">{c.title}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {c.desc}
              </span>
            </span>
            <span className="text-primary">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
