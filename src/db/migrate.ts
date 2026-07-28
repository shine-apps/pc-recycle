import { config } from "dotenv";
config({ path: ".env.local" });

import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

async function main() {
  const dir = (process.env.DATABASE_URL ?? "pglite://./.data/pglite").replace(
    "pglite://",
    "",
  );
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ migrations applied (pglite)");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
