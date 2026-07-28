import { defineConfig } from "drizzle-kit";

// generate 不连接数据库，URL 仅用于方言校验，用占位 postgres 串即可。
const url =
  process.env.DATABASE_URL?.startsWith("postgres")
    ? process.env.DATABASE_URL
    : "postgresql://localhost:5432/pcrecycle";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
