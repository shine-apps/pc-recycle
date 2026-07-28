"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  id: number;
  productId: number | null;
  content: string;
  contact: string;
  handled: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(m: Message) {
    setMsg("");
    const res = await fetch(`/api/admin/messages/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled: !m.handled }),
    });
    if (res.ok) load();
    else setMsg("操作失败");
  }

  const unhandled = items.filter((m) => !m.handled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">留言 / 咨询</h1>
        <span className="text-sm text-muted-foreground">未处理 {unhandled}</span>
      </div>
      {msg && <div className="rounded-lg bg-secondary px-3 py-2 text-sm">{msg}</div>}

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无留言</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id}>
              <Card className={m.handled ? "opacity-60" : ""}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.contact}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={m.handled ? "muted" : "warning"}>
                        {m.handled ? "已处理" : "未处理"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-card-foreground">
                    {m.content}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-sm" onClick={() => toggle(m)}>
                    {m.handled ? "标为未处理" : "标为已处理"}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
