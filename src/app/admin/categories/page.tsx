"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Category = { id: number; name: string; slug: string; sort: number };
type Brand = { id: number; name: string; sort: number };

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [brs, setBrs] = useState<Brand[]>([]);

  const [catForm, setCatForm] = useState({ id: 0, name: "", slug: "", sort: "0" });
  const [brandForm, setBrandForm] = useState({ id: 0, name: "", sort: "0" });
  const [error, setError] = useState("");

  async function load() {
    const m = await fetch("/api/categories").then((r) => r.json());
    setCats(m.categories ?? []);
    setBrs(m.brands ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function saveCat() {
    setError("");
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      setError("分类名称与 slug 必填");
      return;
    }
    const payload = {
      name: catForm.name.trim(),
      slug: catForm.slug.trim(),
      sort: Number(catForm.sort) || 0,
    };
    const url = catForm.id ? `/api/admin/categories/${catForm.id}` : "/api/admin/categories";
    const method = catForm.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("保存失败");
      return;
    }
    setCatForm({ id: 0, name: "", slug: "", sort: "0" });
    load();
  }
  async function delCat(id: number) {
    if (!confirm("删除分类？关联商品不会自动删除。")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  async function saveBrand() {
    setError("");
    if (!brandForm.name.trim()) {
      setError("品牌名称必填");
      return;
    }
    const payload = { name: brandForm.name.trim(), sort: Number(brandForm.sort) || 0 };
    const url = brandForm.id ? `/api/admin/brands/${brandForm.id}` : "/api/admin/brands";
    const method = brandForm.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("保存失败");
      return;
    }
    setBrandForm({ id: 0, name: "", sort: "0" });
    load();
  }
  async function delBrand(id: number) {
    if (!confirm("删除品牌？")) return;
    await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">分类与品牌</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">分类</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              placeholder="名称"
            />
            <Input
              value={catForm.slug}
              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              placeholder="slug"
            />
            <Input
              type="number"
              value={catForm.sort}
              onChange={(e) => setCatForm({ ...catForm, sort: e.target.value })}
              placeholder="排序"
            />
          </div>
          <Button onClick={saveCat}>
            {catForm.id ? "更新分类" : "添加分类"}
          </Button>
          <ul className="divide-y divide-border text-sm">
            {cats.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>
                  {c.name} <span className="text-muted-foreground">/ {c.slug}</span>
                </span>
                <span className="flex gap-3">
                  <button
                    onClick={() =>
                      setCatForm({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        sort: String(c.sort),
                      })
                    }
                    className="text-primary"
                  >
                    编辑
                  </button>
                  <button onClick={() => delCat(c.id)} className="text-destructive">
                    删除
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">品牌</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              placeholder="名称"
            />
            <Input
              type="number"
              value={brandForm.sort}
              onChange={(e) => setBrandForm({ ...brandForm, sort: e.target.value })}
              placeholder="排序"
            />
          </div>
          <Button onClick={saveBrand}>
            {brandForm.id ? "更新品牌" : "添加品牌"}
          </Button>
          <ul className="divide-y divide-border text-sm">
            {brs.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2">
                <span>{b.name}</span>
                <span className="flex gap-3">
                  <button
                    onClick={() =>
                      setBrandForm({ id: b.id, name: b.name, sort: String(b.sort) })
                    }
                    className="text-primary"
                  >
                    编辑
                  </button>
                  <button onClick={() => delBrand(b.id)} className="text-destructive">
                    删除
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
