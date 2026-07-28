"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Settings = {
  phone?: string;
  wechatQr?: string;
  address?: string;
  hours?: string;
  intro?: string;
  recycleScope?: string;
  announcement?: string;
};

const FIELDS: { key: keyof Settings; label: string; textarea?: boolean }[] = [
  { key: "phone", label: "联系电话" },
  { key: "wechatQr", label: "微信二维码图片地址" },
  { key: "address", label: "地址" },
  { key: "hours", label: "营业时间" },
  { key: "recycleScope", label: "回收范围", textarea: true },
  { key: "intro", label: "店铺简介", textarea: true },
  { key: "announcement", label: "首页公告", textarea: true },
];

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/shop-settings")
      .then((r) => r.json())
      .then((d) => {
        setForm(d.shop ?? {});
        setLoading(false);
      });
  }, []);

  function set(key: keyof Settings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/shop-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMsg(res.ok ? "已保存" : "保存失败");
  }

  if (loading) return <p className="text-sm text-muted-foreground">加载中…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">店铺设置</h1>
      {msg && <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{msg}</div>}

      <Card>
        <CardContent className="space-y-4 pt-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.textarea ? (
                <Textarea
                  id={f.key}
                  rows={2}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <Input
                  id={f.key}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={save} disabled={saving}>
        {saving ? "保存中…" : "保存设置"}
      </Button>
    </div>
  );
}
