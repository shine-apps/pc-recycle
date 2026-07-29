import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { products } from "@/db/schema";

const BASE = process.env.SITE_URL ?? "https://example.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.status, "onsale"));

  const productUrls = rows.map((r: { id: number }) => ({
    url: `${BASE}/products/${r.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/recycle`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
    ...productUrls,
  ];
}
