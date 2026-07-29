"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/products", label: "在售" },
  { href: "/recycle", label: "估价回收" },
  { href: "/contact", label: "联系" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-background/80 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-screen-xl items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
        <Link
          href="/admin"
          className="ml-auto whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
        >
          后台
        </Link>
      </div>
    </nav>
  );
}
