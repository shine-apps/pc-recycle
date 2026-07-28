"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type Range = { min: number; max: number };

type Order = {
  id: number;
  deviceType: string;
  brand: string | null;
  model: string | null;
  config: Record<string, string> | null;
  condition: string;
  buyYear: number | null;
  images: string[];
  expectPrice: number | null;
  contactPhone: string;
  contactWechat: string | null;
  status: "pending" | "quoted" | "deal" | "cancel";
  estRange: Range | null;
  estMode: string | null;
  finalPrice: number | null;
  note: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "待报价",
  quoted: "已报价",
  deal: "已成交",
  cancel: "已取消",
};

const STATUS_BADGE: Record<Order["status"], "warning" | "default" | "success" | "muted"> = {
  pending: "warning",
  quoted: "default",
  deal: "success",
  cancel: "muted",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "全部" },
  { value: "pending", label: "待报价" },
  { value: "quoted", label: "已报价" },
  { value: "deal", label: "已成交" },
  { value: "cancel", label: "已取消" },
];

export default function RecycleOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const q = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/recycle-orders${q}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function save(o: Order, patch: Partial<Order>) {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/recycle-orders/${o.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setMsg("已保存");
      load();
    } else {
      setMsg("保存失败");
    }
    setSaving(false);
  }

  async function convert(o: Order) {
    if (!confirm(`确认将「${o.brand ?? o.deviceType} ${o.model ?? ""}」转为在售商品？`)) return;
    setConvId(o.id);
    setMsg("");
    const res = await fetch(`/api/admin/recycle-orders/${o.id}/convert`, {
      method: "POST",
    });
    if (res.ok) {
      setMsg("已转为在售商品");
      setOpenId(null);
      load();
    } else {
      setMsg("转换失败");
    }
    setConvId(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">回收单</h1>
      {msg && <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{msg}</div>}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无回收单</p>
      ) : (
        <ul className="space-y-3">
          {items.map((o) => (
            <li key={o.id}>
              <Card>
                <button
                  onClick={() => setOpenId(openId === o.id ? null : o.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <div>
                    <div className="font-medium">
                      {o.brand ?? o.deviceType} {o.model ?? ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.deviceType} · {o.condition} · {o.contactPhone}
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </button>

                {openId === o.id && (
                  <CardContent className="space-y-3 border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">
                      提交时间：{new Date(o.createdAt).toLocaleString("zh-CN")}
                    </div>
                    {o.estRange && (
                      <div className="text-sm">
                        自动估价区间：¥{o.estRange.min} - ¥{o.estRange.max}
                        {o.estMode === "manual" && "（无匹配规则，需人工）"}
                      </div>
                    )}
                    {o.expectPrice != null && (
                      <div className="text-sm">期望价：¥{o.expectPrice}</div>
                    )}
                    {o.contactWechat && (
                      <div className="text-sm">微信：{o.contactWechat}</div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor={`status-${o.id}`}>状态</Label>
                      <Select
                        id={`status-${o.id}`}
                        defaultValue={o.status}
                        onChange={(e) =>
                          save(o, { status: e.target.value as Order["status"] })
                        }
                        disabled={saving}
                      >
                        <option value="pending">待报价</option>
                        <option value="quoted">已报价</option>
                        <option value="deal">已成交</option>
                        <option value="cancel">已取消</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`final-${o.id}`}>老板最终报价（元）</Label>
                      <Input
                        id={`final-${o.id}`}
                        type="number"
                        defaultValue={o.finalPrice ?? ""}
                        placeholder="未报价留空"
                        onBlur={(e) =>
                          save(o, {
                            finalPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`note-${o.id}`}>备注</Label>
                      <Textarea
                        id={`note-${o.id}`}
                        rows={2}
                        defaultValue={o.note ?? ""}
                        onBlur={(e) => save(o, { note: e.target.value })}
                        disabled={saving}
                      />
                    </div>

                    {o.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {o.images.map((img, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => convert(o)}
                      disabled={convId === o.id || o.status === "deal"}
                    >
                      {o.status === "deal" ? "已转为在售" : "转为在售商品"}
                    </Button>
                  </CardContent>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
