import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

// 必须在导入 client.ts（及依赖它的路由）之前设定，client 在模块加载时读取 DATABASE_URL。
process.env.DATABASE_URL = "pglite://memory";

describe("POST /api/admin/products/[id]/duplicate", () => {
  it(
    "克隆为下架草稿，其余字段保留，原商品不受影响；不存在返回 404",
    async () => {
    const { products } = await import("@/db/schema");
    const { getDb } = await import("@/db/client");
    const db = await getDb();

    const [src] = await db
      .insert(products)
      .values({
        title: "测试机",
        condition: "95新",
        price: 1000,
        status: "onsale",
        images: ["a.png"],
        config: { cpu: "M1" },
      })
      .returning();

    const { POST } = await import("./route");

    const req = new NextRequest(
      `http://localhost/api/admin/products/${src.id}/duplicate`,
      { method: "POST" },
    );
    const res = await POST(req, {
      params: Promise.resolve({ id: String(src.id) }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.item.title).toBe(`${src.title} 副本`);
    expect(data.item.status).toBe("off");
    expect(data.item.price).toBe(src.price);
    expect(data.item.images).toEqual(["a.png"]);
    expect(data.item.config).toEqual({ cpu: "M1" });
    expect(data.item.id).not.toBe(src.id);

    const [orig] = await db
      .select()
      .from(products)
      .where(eq(products.id, src.id));
    expect(orig.status).toBe("onsale");

    const notFound = await POST(
      new NextRequest(
        "http://localhost/api/admin/products/999999/duplicate",
        { method: "POST" },
      ),
      { params: Promise.resolve({ id: "999999" }) },
    );
    expect(notFound.status).toBe(404);
  },
  30000,
);
});
