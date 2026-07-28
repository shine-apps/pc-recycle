"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "概览" },
  { href: "/admin/products", label: "商品" },
  { href: "/admin/categories", label: "分类/品牌" },
  { href: "/admin/recycle-orders", label: "回收单", badge: "pendingOrders" },
  { href: "/admin/messages", label: "留言", badge: "unreadMessages" },
  { href: "/admin/settings", label: "设置" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState({ pendingOrders: 0, unreadMessages: 0 });

  // 仅后台：新单/未读角标（决策为「仅后台，不做推送」）
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const [o, m] = await Promise.all([
          fetch("/api/admin/recycle-orders?status=pending").then((r) => r.json()),
          fetch("/api/admin/messages").then((r) => r.json()),
        ]);
        if (!active) return;
        const pendingOrders = (o.items ?? []).length;
        const unreadMessages = (m.items ?? []).filter((x: any) => !x.handled).length;
        setCounts({ pendingOrders, unreadMessages });
      } catch {
        /* 忽略轮询异常 */
      }
    }
    poll();
    const t = setInterval(poll, 30000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  // 登录页不套用后台外壳
  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <span className="font-semibold text-foreground">翔云后台</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            返回网站
          </Link>
          <button onClick={logout} className="text-muted-foreground hover:text-foreground">
            退出
          </button>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 text-sm">
        {NAV.map((n) => {
          const count = n.badge ? counts[n.badge as keyof typeof counts] : 0;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                pathname === n.href
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {n.label}
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <main className="mx-auto max-w-screen-md p-4">{children}</main>
    </div>
  );
}
