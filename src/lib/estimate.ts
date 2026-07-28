export type EstimateInput = {
  deviceType: string;
  brand?: string | null;
  model?: string | null;
  condition: string;
  config?: Record<string, string> | null;
};

export type PriceRule = {
  deviceType: string;
  brand: string | null;
  model?: string | null;
  basePrice: number;
  conditionFactor: Record<string, number>;
  configBonus?: Record<string, number> | null;
};

export type EstimateResult = {
  mode: "auto" | "manual";
  range?: { min: number; max: number };
  basePrice?: number;
  reason?: string;
};

/**
 * 估价引擎（纯函数，步骤 9）。
 * 匹配优先级：deviceType+brand+model 精确 → deviceType+brand 退一步。
 * 命中后：参考价 = 基准价 × 成色系数 + 配置加成；区间 = 参考价 × [0.85, 1.15]。
 * 未命中或缺少系数 → 降级为人工报价（mode='manual'）。
 */
export function estimatePrice(
  input: EstimateInput,
  rules: PriceRule[],
): EstimateResult {
  const exact = rules.find(
    (r) =>
      r.deviceType === input.deviceType &&
      r.brand === input.brand &&
      (r.model === input.model || (r.model == null && input.model == null)),
  );
  const rule = exact ?? rules.find(
    (r) => r.deviceType === input.deviceType && r.brand === input.brand,
  );

  if (!rule) {
    return { mode: "manual", reason: "暂无匹配估价规则，老板将人工报价" };
  }

  const factor = rule.conditionFactor[input.condition];
  if (factor === undefined) {
    return { mode: "manual", reason: "该成色暂无系数，老板将人工报价" };
  }

  const base = rule.basePrice * factor;
  let bonus = 0;
  if (rule.configBonus && input.config) {
    for (const [key, value] of Object.entries(input.config)) {
      const b =
        rule.configBonus[value] ?? rule.configBonus[key] ?? undefined;
      if (typeof b === "number") bonus += b;
    }
  }

  const mid = Math.round(base + bonus);
  const min = Math.round(mid * 0.85);
  const max = Math.round(mid * 1.15);

  return {
    mode: "auto",
    basePrice: mid,
    range: { min, max },
    reason: "按规则自动预估，最终以老板确认报价为准",
  };
}
