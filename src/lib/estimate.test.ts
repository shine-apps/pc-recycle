import { describe, it, expect } from "vitest";
import { estimatePrice, type PriceRule } from "./estimate";

const rules: PriceRule[] = [
  {
    deviceType: "笔记本",
    brand: "苹果",
    model: "MacBook Pro 13",
    basePrice: 4000,
    conditionFactor: { "95新": 0.85, "9成新": 0.75, "8成新": 0.6 },
    configBonus: { M1: 0, M2: 800 },
  },
  {
    deviceType: "笔记本",
    brand: "苹果",
    basePrice: 3500,
    conditionFactor: { "95新": 0.8 },
  },
];

describe("estimatePrice", () => {
  it("精确匹配 + 配置加成：95新 M1 → [2890, 3910]", () => {
    const r = estimatePrice(
      {
        deviceType: "笔记本",
        brand: "苹果",
        model: "MacBook Pro 13",
        condition: "95新",
        config: { cpu: "M1" },
      },
      rules,
    );
    expect(r.mode).toBe("auto");
    expect(r.range).toEqual({ min: 2890, max: 3910 });
  });

  it("精确匹配 + 高配加成：9成新 M2 → [3230, 4370]", () => {
    const r = estimatePrice(
      {
        deviceType: "笔记本",
        brand: "苹果",
        model: "MacBook Pro 13",
        condition: "9成新",
        config: { cpu: "M2" },
      },
      rules,
    );
    expect(r.mode).toBe("auto");
    expect(r.range).toEqual({ min: 3230, max: 4370 });
  });

  it("品牌回退（无型号）：笔记本/苹果 95新 → auto", () => {
    const r = estimatePrice(
      { deviceType: "笔记本", brand: "苹果", condition: "95新" },
      rules,
    );
    expect(r.mode).toBe("auto");
    expect(r.range?.min).toBe(2380);
    expect(r.range?.max).toBe(3220);
  });

  it("无匹配规则 → 人工报价（manual）", () => {
    const r = estimatePrice(
      { deviceType: "显示器", brand: "三星", condition: "95新" },
      rules,
    );
    expect(r.mode).toBe("manual");
    expect(r.range).toBeUndefined();
  });

  it("命中规则但缺成色系数 → 人工报价（manual）", () => {
    const r = estimatePrice(
      {
        deviceType: "笔记本",
        brand: "苹果",
        model: "MacBook Pro 13",
        condition: "7成新及以下",
      },
      rules,
    );
    expect(r.mode).toBe("manual");
    expect(r.range).toBeUndefined();
  });
});
