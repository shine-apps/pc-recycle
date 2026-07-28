/**
 * 极简内存限流（步骤 8）。
 * 单进程 Node 部署下可用；若后续上多实例/Serverless，需换成 Redis 等共享存储。
 * 挂到 globalThis 上做单例，避免 Turbopack 多模块图下每个路由各持一份计数器。
 */
const globalForRate = globalThis as unknown as {
  __pcRecycleRateStore?: Map<string, number[]>;
};
const store = globalForRate.__pcRecycleRateStore ?? new Map<string, number[]>();
globalForRate.__pcRecycleRateStore = store;

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const hits = store.get(key) ?? [];
  const recent = hits.filter((t) => now - t < windowMs);
  recent.push(now);
  store.set(key, recent);
  return recent.length > limit;
}
