import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { shopSettings } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import MessageForm from "./MessageForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "联系老板 · 桐乡阳光回收",
  description: "电话直拨、微信二维码，当面验机交易更放心。",
};

export default async function ContactPage() {
  const db = await getDb();
  const [shop] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);

  const phone = shop?.phone || "";
  const rows: { label: string; value?: string }[] = [
    { label: "地址", value: shop?.address ?? undefined },
    { label: "营业时间", value: shop?.hours ?? undefined },
    { label: "回收范围", value: shop?.recycleScope ?? undefined },
    { label: "简介", value: shop?.intro ?? undefined },
  ];

  return (
    <section id="buy" className="space-y-4">
      <h1 className="text-lg font-semibold">联系老板</h1>
      {shop?.announcement && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {shop.announcement}
        </div>
      )}

      {phone ? (
        <a
          href={`tel:${phone}`}
          className="block rounded-xl bg-primary py-3 text-center text-base font-semibold text-primary-foreground shadow-sm"
        >
          拨打 {phone}
        </a>
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          尚未配置电话，请在后台「店铺设置」中补充。
        </div>
      )}

      {shop?.wechatQr ? (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 text-sm text-muted-foreground">微信二维码（长按识别）</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shop.wechatQr}
              alt="微信二维码"
              className="mx-auto h-40 w-40 object-contain"
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-2 p-4">
          {rows
            .filter((r) => r.value)
            .map((r) => (
              <div
                key={r.label}
                className="flex justify-between border-b border-border py-1.5 text-sm last:border-0"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-right font-medium">{r.value}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      <MessageForm />
    </section>
  );
}
