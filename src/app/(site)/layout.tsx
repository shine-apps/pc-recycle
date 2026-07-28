import Link from "next/link";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-screen-sm flex-col md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <header className="sticky top-0 z-10 border-b border-border bg-primary px-4 py-3 text-primary-foreground shadow-sm">
        <Link href="/" className="text-base font-bold">
          翔云电脑回收
        </Link>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-2 py-2 text-sm">
        <Link
          href="/products"
          className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          在售
        </Link>
        <Link
          href="/recycle"
          className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          估价回收
        </Link>
        <Link
          href="/contact"
          className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          联系
        </Link>
        <Link
          href="/admin"
          className="ml-auto whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-primary hover:bg-accent"
        >
          后台
        </Link>
      </nav>
      <main className="flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
        二手电脑回收 · 出售 · 老板直连
      </footer>
    </div>
  );
}
