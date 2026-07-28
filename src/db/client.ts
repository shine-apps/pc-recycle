import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "pglite://./.data/pglite";

// 双轨 DB：生产用真实 Postgres，本地/沙箱用 PGlite（进程内 Postgres，无需 Docker）。
// pglite 与 drizzle-orm/pglite 仅在 pglite 分支动态导入，避免生产包体引入 WASM。
//
// 关键：PGlite 同一进程内只允许一个实例指向同一数据目录，否则多实例会互相破坏查询。
// 开发模式下 Turbopack 可能把本模块编译进多个路由图，导致 _db 被复制成多份。
// 因此把实例挂到 globalThis 上做真正的单例，所有路由共享同一个连接。
const globalForDb = globalThis as unknown as {
  __pcRecycleDb?: any;
};

export async function getDb(): Promise<any> {
  if (globalForDb.__pcRecycleDb) return globalForDb.__pcRecycleDb;

  if (url.startsWith("pglite:")) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const { seedData } = await import("./seedData");

    // pglite://memory（或空路径）→ 纯内存模式，零磁盘写入。
    // 沙箱环境的 safe-delete 会拦截对 .data/pglite 的写入，故本地开发默认走内存。
    const inMemory = url === "pglite://memory" || url === "pglite://" || url.endsWith("/memory");
    const client = inMemory ? new PGlite() : new PGlite(url.replace("pglite://", ""));
    const db = drizzlePglite(client, { schema });

    // 内存库每次进程启动都是空的，需要自动建表 + 灌入示例数据。
    await migrate(db, { migrationsFolder: "./drizzle" });
    if (inMemory) {
      const { count } = await import("drizzle-orm");
      const existing = await db.select({ c: count() }).from(schema.categories);
      if (!existing[0]?.c) await seedData(db);
    }

    globalForDb.__pcRecycleDb = db;
  } else {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url });
    globalForDb.__pcRecycleDb = drizzlePg(pool, { schema });
  }

  return globalForDb.__pcRecycleDb;
}
