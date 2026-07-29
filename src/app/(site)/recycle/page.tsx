"use client";

import { useEffect, useState } from "react";
import { compressImage } from "@/lib/compress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
const CONDITIONS = ["95新", "9成新", "8成新", "7成新及以下"];

type Brand = { id: number; name: string };

export default function RecyclePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES[0]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [buyYear, setBuyYear] = useState("");
  const [config, setConfig] = useState<{ k: string; v: string }[]>([
    { k: "", v: "" },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [expectPrice, setExpectPrice] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWechat, setContactWechat] = useState("");
  const [captcha, setCaptcha] = useState<{ question: string; token: string }>({
    question: "",
    token: "",
  });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<null | {
    mode: "auto" | "manual";
    range?: { min: number; max: number };
    reason?: string;
    orderId: number;
  }>(null);

  async function loadCaptcha() {
    try {
      const d = await fetch("/api/captcha").then((r) => r.json());
      setCaptcha({ question: d.question ?? "", token: d.token ?? "" });
      setCaptchaAnswer("");
    } catch {
      /* 拉取失败由后端二次校验兜底 */
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []));
    loadCaptcha();
  }, []);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files.slice(0, 6 - images.length)) {
      try {
        const dataUrl = await compressImage(f);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (data.ok) setImages((s) => [...s, data.url]);
      } catch {
        /* 忽略单张失败 */
      }
    }
    e.target.value = "";
  }

  function setCfg(idx: number, key: "k" | "v", val: string) {
    setConfig((s) => s.map((c, i) => (i === idx ? { ...c, [key]: val } : c)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!contactPhone.trim()) {
      setError("请填写联系电话");
      return;
    }
    const configObj = Object.fromEntries(
      config.filter((c) => c.k.trim()).map((c) => [c.k.trim(), c.v.trim()]),
    );
    const payload = {
      deviceType,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      condition,
      buyYear: buyYear ? Number(buyYear) : undefined,
      config: Object.keys(configObj).length ? configObj : undefined,
      images,
      expectPrice: expectPrice ? Number(expectPrice) : undefined,
      contactPhone: contactPhone.trim(),
      contactWechat: contactWechat.trim() || undefined,
      captchaToken: captcha.token,
      captchaAnswer,
    };

    setSubmitting(true);
    const res = await fetch("/api/recycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "提交失败");
      loadCaptcha();
      return;
    }
    const d = await res.json();
    setResult({ ...d.estimate, orderId: d.orderId });
    loadCaptcha();
  }

  if (result) {
    return (
      <section className="space-y-4">
        <h1 className="text-xl font-bold">提交成功</h1>
        <Card>
          <CardContent className="space-y-2 p-4">
            {result.mode === "auto" && result.range ? (
              <>
                <div className="text-sm text-muted-foreground">系统预估回收区间</div>
                <div className="text-2xl font-bold text-primary">
                  ¥{result.range.min} – ¥{result.range.max}
                </div>
                <p className="text-sm text-muted-foreground">
                  最终以老板确认报价为准，请保持电话畅通。
                </p>
              </>
            ) : (
              <p className="text-sm text-foreground">
                已收到您的回收信息，暂无匹配自动估价，老板将人工报价，请保持电话畅通。
              </p>
            )}
            <div className="text-xs text-muted-foreground">
              单号 #{result.orderId}
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full" onClick={() => {
          window.location.href = "/contact";
        }}>
          联系老板
        </Button>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setImages([]);
            setConfig([{ k: "", v: "" }]);
            loadCaptcha();
          }}
          className="block w-full text-center text-sm text-primary underline"
        >
          再填一单
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">在线估价回收</h1>
      <p className="text-sm text-muted-foreground">
        填写设备信息，立即获得预估区间；也可直接联系老板上门看货。
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <Label>设备类型</Label>
          <Select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
            {DEVICE_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label>品牌</Label>
          <Input
            list="brand-list"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="如 苹果 / 联想"
          />
          <datalist id="brand-list">
            {brands.map((b) => (
              <option key={b.id} value={b.name} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <Label>型号</Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="如 MacBook Pro 13"
          />
        </div>

        <div className="space-y-1">
          <Label>成色</Label>
          <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label>购买年份（选填）</Label>
          <Input
            type="number"
            value={buyYear}
            onChange={(e) => setBuyYear(e.target.value)}
            placeholder="如 2021"
          />
        </div>

        <div className="space-y-1">
          <Label>配置（选填）</Label>
          {config.map((c, i) => (
            <div key={i} className="mb-1 flex gap-2">
              <Input
                value={c.k}
                onChange={(e) => setCfg(i, "k", e.target.value)}
                placeholder="键，如 内存"
              />
              <Input
                value={c.v}
                onChange={(e) => setCfg(i, "v", e.target.value)}
                placeholder="值，如 16G"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setConfig((s) => [...s, { k: "", v: "" }])}
            className="text-sm text-primary underline"
          >
            + 添加配置项
          </button>
        </div>

        <div className="space-y-1">
          <Label>照片（最多 6 张，自动压缩）</Label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
            className="block w-full text-sm"
          />
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={u}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label>期望价（选填，元）</Label>
          <Input
            type="number"
            value={expectPrice}
            onChange={(e) => setExpectPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-1">
          <Label>
            联系电话 <span className="text-destructive">*</span>
          </Label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="11 位手机号"
          />
        </div>

        <div className="space-y-1">
          <Label>微信（选填）</Label>
          <Input
            value={contactWechat}
            onChange={(e) => setContactWechat(e.target.value)}
            placeholder="微信号"
          />
        </div>

        <div className="space-y-1">
          <Label>
            验证码 <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            {captcha.question || "正在加载…"}
          </p>
          <Input
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            placeholder="请输入计算结果"
            inputMode="numeric"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? "提交中…" : "提交估价"}
        </Button>
      </form>
    </section>
  );
}
