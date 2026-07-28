"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Category = { id: number; name: string; slug: string; sort: number };
type Brand = { id: number; name: string; sort: number };
type Product = {
  id: number;
  title: string;
  condition: string;
  price: number;
  images: string[];
  status: "onsale" | "off" | "sold";
};

const SORTS = [
  { v: "new", label: "最新" },
  { v: "price_asc", label: "价格升" },
  { v: "price_desc", label: "价格降" },
];

export default function ProductsPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [brs, setBrs] = useState<Brand[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCats(d.categories ?? []);
        setBrs(d.brands ?? []);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    if (q.trim()) params.set("q", q.trim());
    params.set("sort", sort);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setLoading(false);
      });
  }, [categoryId, brandId, q, sort]);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">在售二手好物</h1>

      <div className="space-y-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索关键词，如 MacBook"
        />
        <div className="flex gap-2">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">全部分类</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">全部品牌</option>
            {brs.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <Button
              key={s.v}
              size="sm"
              variant={sort === s.v ? "default" : "outline"}
              onClick={() => setSort(s.v)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          暂无符合条件的商品，换个筛选试试。
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="block h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5"
              >
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-muted text-xs text-muted-foreground">
                    暂无图片
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <div className="line-clamp-2 text-sm font-medium">{p.title}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.condition}</span>
                    {p.status === "sold" && <Badge variant="warning">已售</Badge>}
                  </div>
                  <div className="text-base font-bold text-primary">
                    ¥{p.price}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
