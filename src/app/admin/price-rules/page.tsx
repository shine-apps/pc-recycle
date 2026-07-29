"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const DEVICE_TYPES = [
  "笔记本",
  "台式机",
  "CPU",
  "显卡",
  "内存",
  "硬盘",
  "显示器",
  "外设",
];
const DEFAULT_CONDITIONS = ["95新", "9成新", "8成新", "7成新及以下"];

type Rule = {
  id: number;
  deviceType: string;
  brand: string | null;
  model: string | null;
  basePrice: number;
  conditionFactor: Record<string, number>;
  configBonus: Record<string, number> | null;
};

type FactorRow = { condition: string; factor: string };
type BonusRow = { k: string; v: string };

type FormState = {
  deviceType: string;
  brand: string;
  model: string;
  basePrice: string;
  factors: FactorRow[];
  bonuses: BonusRow[];
};

const EMPTY: FormState = {
  deviceType: DEVICE_TYPES[0],
  brand: "",
  model: "",
  basePrice: "",
  factors: DEFAULT_CONDITIONS.map((c) => ({ condition: c, factor: "" })),
  bonuses: [],
};

export default function AdminPriceRulesPage() {
  const [items, setItems] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const d = await fetch("/api/admin/price-rules").then((r) => r.json());
    setItems(d.items ?? []);
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

  function openEdit(r: Rule) {
    setEditingId(r.id);
    setForm({
      deviceType: r.deviceType,
      brand: r.brand ?? "",
      model: r.model ?? "",
      basePrice: String(r.basePrice),
      factors: Object.entries(r.conditionFactor).map(([condition, factor]) => ({
        condition,
        factor: String(factor),
      })),
      bonuses: r.configBonus
        ? Object.entries(r.configBonus).map(([k, v]) => ({ k, v: String(v) }))
        : [],
    });
    setError("");
    setFormOpen(true);
  }

  function setFactor(idx: number, key: "condition" | "factor", val: string) {
    setForm((s) => ({
      ...s,
      factors: s.factors.map((f, i) => (i === idx ? { ...f, [key]: val } : f)),
    }));
  }
  function addFactor() {
    setForm((s) => ({ ...s, factors: [...s.factors, { condition: "", factor: "" }] }));
  }
  function removeFactor(idx: number) {
    setForm((s) => ({ ...s, factors: s.factors.filter((_, i) => i !== idx) }));
  }
  function setBonus(idx: number, key: "k" | "v", val: string) {
    setForm((s) => ({
      ...s,
      bonuses: s.bonuses.map((b, i) => (i === idx ? { ...b, [key]: val } : b)),
    }));
  }
  function addBonus() {
    setForm((s) => ({ ...s, bonuses: [...s.bonuses, { k: "", v: "" }] }));
  }
  function removeBonus(idx: number) {
    setForm((s) => ({ ...s, bonuses: s.bonuses.filter((_, i) => i !== idx) }));
  }

  async function save() {
    setError("");
    if (!form.deviceType) {
      setError("请选择设备类型");
      return;
    }
    const basePrice = Number(form.basePrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setError("请填写有效的基准价");
      return;
    }
    const conditionFactor: Record<string, number> = {};
    for (const f of form.factors) {
      const c = f.condition.trim();
      const val = Number(f.factor);
      if (!c) {
        setError("成色系数存在空成色，请填写或删除该行");
        return;
      }
      if (!Number.isFinite(val)) {
        setError(`成色「${c}」的系数不是有效数字`);
        return;
      }
      conditionFactor[c] = val;
    }
    if (Object.keys(conditionFactor).length === 0) {
      setError("请至少配置一个成色系数");
      return;
    }
    const configBonus: Record<string, number> = {};
    for (const b of form.bonuses) {
      const k = b.k.trim();
      const val = Number(b.v);
      if (!k) continue;
      if (!Number.isFinite(val)) {
        setError(`配置加成「${k}」的值不是有效数字`);
        return;
      }
      configBonus[k] = val;
    }

    const payload = {
      deviceType: form.deviceType,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      basePrice,
      conditionFactor,
      configBonus: Object.keys(configBonus).length ? configBonus : undefined,
    };

    setSaving(true);
    const url = editingId
      ? `/api/admin/price-rules/${editingId}`
      : "/api/admin/price-rules";
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
    if (!confirm("确定删除该估价规则？")) return;
    await fetch(`/api/admin/price-rules/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">估价规则</h1>
        <Button onClick={openCreate}>新增</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        估价公式：参考价 = 基准价 × 成色系数 + 配置加成；区间 = 参考价 × [0.85, 1.15]。
        精确匹配「设备类型+品牌+型号」，否则退到「设备类型+品牌」。
      </p>

      {formOpen && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {editingId ? "编辑规则" : "新增规则"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>
                收起
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>设备类型</Label>
                <Select
                  value={form.deviceType}
                  onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                >
                  {DEVICE_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>基准价（元）</Label>
                <Input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>品牌（选填，留空=该类型通用）</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="如 苹果"
                />
              </div>
              <div className="space-y-1">
                <Label>型号（选填）</Label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="如 MacBook Pro 13"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>成色系数（成色 → 系数，如 95新=0.85）</Label>
              {form.factors.map((f, i) => (
                <div key={i} className="mb-1 flex gap-2">
                  <Input
                    value={f.condition}
                    onChange={(e) => setFactor(i, "condition", e.target.value)}
                    placeholder="成色，如 95新"
                    className="flex-1"
                  />
                  <Input
                    value={f.factor}
                    onChange={(e) => setFactor(i, "factor", e.target.value)}
                    placeholder="系数，如 0.85"
                    className="w-24"
                  />
                  <button
                    onClick={() => removeFactor(i)}
                    className="px-2 text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addFactor}
                className="text-sm text-primary underline"
              >
                + 添加成色系数
              </button>
            </div>

            <div className="space-y-1">
              <Label>配置加成（选填，键/值 → 数值，如 M1=800）</Label>
              {form.bonuses.map((b, i) => (
                <div key={i} className="mb-1 flex gap-2">
                  <Input
                    value={b.k}
                    onChange={(e) => setBonus(i, "k", e.target.value)}
                    placeholder="键，如 M1"
                    className="flex-1"
                  />
                  <Input
                    value={b.v}
                    onChange={(e) => setBonus(i, "v", e.target.value)}
                    placeholder="值，如 800"
                    className="w-24"
                  />
                  <button
                    onClick={() => removeBonus(i)}
                    className="px-2 text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addBonus}
                className="text-sm text-primary underline"
              >
                + 添加配置加成
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
        <p className="text-sm text-muted-foreground">还没有估价规则。</p>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {r.deviceType}
                    {r.brand ? ` / ${r.brand}` : " / 通用"}
                    {r.model ? ` / ${r.model}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    基准价 ¥{r.basePrice} · 成色系数 {Object.keys(r.conditionFactor).length} 项
                    {r.configBonus ? ` · 加成 ${Object.keys(r.configBonus).length} 项` : ""}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(r.conditionFactor).map(([c, v]) => (
                      <Badge key={c} variant="outline">
                        {c}:{v}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded-md px-2 py-1 text-xs text-primary hover:bg-accent"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-accent"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
