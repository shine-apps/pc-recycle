"use client";

import { useEffect, useState } from "react";
import { compressImage } from "@/lib/compress";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Category = { id: number; name: string; slug: string; sort: number };
type Brand = { id: number; name: string; sort: number };
type Product = {
  id: number;
  categoryId: number | null;
  brandId: number | null;
  title: string;
  condition: string;
  price: number;
  config: Record<string, string> | null;
  images: string[];
  status: "onsale" | "off" | "sold";
  description: string | null;
  createdAt: string;
};

const CONDITIONS = ["95新", "9成新", "8成新", "7成新及以下"];
const STATUS_LABEL: Record<Product["status"], string> = {
  onsale: "在售",
  off: "下架",
  sold: "已售",
};
const STATUS_BADGE: Record<Product["status"], "success" | "muted" | "warning"> = {
  onsale: "success",
  off: "muted",
  sold: "warning",
};

type FormState = {
  title: string;
  categoryId: string;
  brandId: string;
  condition: string;
  price: string;
  status: Product["status"];
  description: string;
  config: { k: string; v: string }[];
  images: string[];
};

const EMPTY: FormState = {
  title: "",
  categoryId: "",
  brandId: "",
  condition: "95新",
  price: "",
  status: "onsale",
  description: "",
  config: [{ k: "", v: "" }],
  images: [],
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [brs, setBrs] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [p, m] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setItems(p.items ?? []);
    setCats(m.categories ?? []);
    setBrs(m.brands ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setError("");
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      categoryId: p.categoryId ? String(p.categoryId) : "",
      brandId: p.brandId ? String(p.brandId) : "",
      condition: p.condition,
      price: String(p.price),
      status: p.status,
      description: p.description ?? "",
      config: p.config
        ? Object.entries(p.config).map(([k, v]) => ({ k, v }))
        : [{ k: "", v: "" }],
      images: p.images ?? [],
    });
    setError("");
    setFormOpen(true);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      try {
        const dataUrl = await compressImage(f);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (data.ok) {
          setForm((s) => ({ ...s, images: [...s.images, data.url] }));
        }
      } catch {
        /* 忽略单张失败 */
      }
    }
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) }));
  }

  function setConfig(idx: number, key: "k" | "v", val: string) {
    setForm((s) => ({
      ...s,
      config: s.config.map((c, i) => (i === idx ? { ...c, [key]: val } : c)),
    }));
  }
  function addConfig() {
    setForm((s) => ({ ...s, config: [...s.config, { k: "", v: "" }] }));
  }
  function removeConfig(idx: number) {
    setForm((s) => ({ ...s, config: s.config.filter((_, i) => i !== idx) }));
  }

  async function save() {
    setError("");
    if (!form.title.trim() || !form.price) {
      setError("请填写标题与价格");
      return;
    }
    const configObj = Object.fromEntries(
      form.config.filter((c) => c.k.trim()).map((c) => [c.k.trim(), c.v.trim()]),
    );
    const payload = {
      title: form.title.trim(),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      brandId: form.brandId ? Number(form.brandId) : undefined,
      condition: form.condition,
      price: Number(form.price),
      status: form.status,
      description: form.description.trim() || undefined,
      config: Object.keys(configObj).length ? configObj : undefined,
      images: form.images,
    };

    setSaving(true);
    const url = editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "保存失败");
      return;
    }
    setFormOpen(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("确定删除该商品？")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function setStatus(p: Product, status: Product["status"]) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">商品管理</h1>
        <Button onClick={openCreate}>新增</Button>
      </div>

      {formOpen && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {editingId ? "编辑商品" : "新增商品"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
                收起
              </Button>
            </div>

            <div className="space-y-1">
              <Label>标题</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="如：MacBook Pro 13 2020"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>分类</Label>
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">未分类</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>品牌</Label>
                <Select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                >
                  <option value="">未知</option>
                  {brs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>成色</Label>
                <Select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>价格（元）</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>状态</Label>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Product["status"] })
                }
              >
                {(["onsale", "off", "sold"] as const).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label>描述</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="选填"
              />
            </div>

            <div className="space-y-1">
              <Label>图片（自动压缩后上传）</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onFiles}
                className="block w-full text-sm"
              />
              {form.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.images.map((u, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive px-1 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>配置（选填，键值对）</Label>
              {form.config.map((c, i) => (
                <div key={i} className="mb-1 flex gap-2">
                  <Input
                    value={c.k}
                    onChange={(e) => setConfig(i, "k", e.target.value)}
                    placeholder="键，如 cpu"
                  />
                  <Input
                    value={c.v}
                    onChange={(e) => setConfig(i, "v", e.target.value)}
                    placeholder="值，如 M1"
                  />
                  <button
                    onClick={() => removeConfig(i)}
                    className="px-2 text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addConfig}
                className="text-sm text-primary underline"
              >
                + 添加配置项
              </button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? "保存中…" : "保存"}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有商品，点右上角新增。</p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              {p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  无图
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={STATUS_BADGE[p.status]}>
                    {STATUS_LABEL[p.status]}
                  </Badge>
                  <span className="font-semibold text-primary">¥{p.price}</span>
                  <span>{p.condition}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-md px-2 py-1 text-xs text-primary hover:bg-accent"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-accent"
                  >
                    删除
                  </button>
                </div>
                <Select
                  value={p.status}
                  onChange={(e) => setStatus(p, e.target.value as Product["status"])}
                  className="h-8 w-24 text-xs"
                >
                  {(["onsale", "off", "sold"] as const).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
