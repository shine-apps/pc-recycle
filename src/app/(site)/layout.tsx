import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-screen-sm flex-col bg-background md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <header className="sticky top-0 z-20 shadow-sm">
        <div className="bg-gradient-to-r from-primary to-blue-500 px-4 py-3 text-primary-foreground">
          <div className="mx-auto flex max-w-screen-xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-base font-bold backdrop-blur">
                桐
              </span>
              <span className="text-base font-bold tracking-wide">
                桐乡阳光回收
              </span>
            </Link>
            <span className="hidden text-xs text-white/80 sm:block">
              二手电脑 · 回收 · 出售
            </span>
          </div>
        </div>
        <SiteNav />
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        二手电脑回收 · 出售 · 老板直连
      </footer>
    </div>
  );
}
