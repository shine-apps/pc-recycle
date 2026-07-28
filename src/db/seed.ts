import { config } from "dotenv";
config({ path: ".env.local" });

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { count } from "drizzle-orm";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";
import { seedData } from "./seedData";

async function main() {
  const dir = (process.env.DATABASE_URL ?? "pglite://./.data/pglite").replace(
    "pglite://",
    "",
  );
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder: "./drizzle" });

  const existing = await db.select({ c: count() }).from(schema.categories);
  if (existing[0]?.c > 0) {
    console.log("✓ 已存在数据，跳过 seed");
    await client.close();
    return;
  }

  await seedData(db);

  console.log("✓ seed done");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
