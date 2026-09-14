import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products, categories, brands } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import ShareButton from "@/components/share/ShareButton";

export const dynamic = "force-dynamic";

/** 挑选微信分享缩略图：跳过 data:URL，优先 JPG/PNG（微信不支持 WebP/GIF） */
function pickShareImage(images: string[]): string | undefined {
  const publicImages = images.filter((u) => !u.startsWith("data:"));
  return (
    publicImages.find((u) => /\.(jpe?g|png)(\?.*)?$/i.test(u)) ??
    publicImages[0]
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  const [p] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  if (!p) return { title: "商品未找到 · 桐乡阳光回收" };
  const description = `${p.title}，${p.condition}，售价 ¥${p.price}。本地二手电脑回收出售，老板直连，线下交易更放心。`;
  const shareImage = pickShareImage(((p.images ?? []) as string[]));
  return {
    title: `${p.title} · 桐乡阳光回收`,
    description,
    alternates: { canonical: `/products/${p.id}` },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: "桐乡阳光回收",
      title: `${p.title} ¥${p.price} · 桐乡阳光回收`,
      description,
      images: [{ url: shareImage ?? "/share-logo.png" }],
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const [p] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  if (!p) notFound();

  const [cat] = p.categoryId
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, p.categoryId))
        .limit(1)
    : [undefined];
  const [br] = p.brandId
    ? await db
        .select()
        .from(brands)
        .where(eq(brands.id, p.brandId))
        .limit(1)
    : [undefined];

  const sold = p.status === "sold";
  const images = (p.images ?? []) as string[];
  const FALLBACK_IMAGE = "/product-placeholder.svg";
  const displayImages = images.length > 0 ? images : [FALLBACK_IMAGE];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: `${p.title}，${p.condition}，售价 ¥${p.price}。`,
    image: displayImages,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "CNY",
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  return (
    <section className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/products" className="text-sm text-gray-500">
        ← 返回列表
      </Link>

      <div className="grid grid-cols-1 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImages[0]}
          alt={p.title}
          className="w-full rounded-xl border border-gray-200 object-cover"
        />
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayImages.slice(1).map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={u}
                alt=""
                className="h-16 w-full rounded-lg border border-gray-200 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-xl font-semibold">{p.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {br && <span>{br.name}</span>}
          {cat && <span>· {cat.name}</span>}
          <span>· {p.condition}</span>
          {sold ? (
            <Badge variant="warning">已售</Badge>
          ) : p.status === "off" ? (
            <Badge variant="muted">已下架</Badge>
          ) : (
            <Badge variant="success">在售</Badge>
          )}
        </div>
        <div className="mt-3 text-2xl font-bold text-primary">¥{p.price}</div>
      </div>

      {p.config && Object.keys(p.config).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-gray-600">配置</div>
          <dl className="space-y-1 text-sm">
            {Object.entries(p.config).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-gray-500">{k}</dt>
                <dd className="font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {p.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700">
          {p.description}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href="/contact#buy"
          className={buttonVariants({
            size: "lg",
            className: `flex-1 ${sold ? "bg-muted-foreground/40" : ""}`,
          })}
        >
          {sold ? "已售出 · 联系看其他机型" : "联系购买"}
        </Link>
        <ShareButton
          variant="button"
          title={`${p.title} ¥${p.price} · 桐乡阳光回收`}
          text={`${p.title}，${p.condition}，售价 ¥${p.price}。本地二手电脑，老板直连，线下当面验机。`}
        />
      </div>
      <p className="text-center text-xs text-gray-400">
        线下交易，支持当面验机
      </p>
    </section>
  );
}
