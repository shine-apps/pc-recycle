"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function MessageForm() {
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!content.trim() || !contact.trim()) {
      setError("请填写留言内容和联系方式");
      return;
    }
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ content: content.trim(), contact: contact.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
      setContent("");
      setContact("");
    } else {
      setError("提交失败，请稍后再试");
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        留言已提交，老板会尽快联系你！
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="font-semibold">给老板留言</div>
      <Textarea
        rows={3}
        placeholder="想咨询的型号、预算或其他需求…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Input
        placeholder="手机号 / 微信（方便老板联系你）"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={sending} className="w-full">
        {sending ? "提交中…" : "提交留言"}
      </Button>
    </form>
  );
}
