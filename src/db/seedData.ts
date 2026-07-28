import bcrypt from "bcryptjs";
import * as schema from "./schema";

// 共享的初始化数据。供 `seed.ts`（落盘 PGlite / 生产库）与
// `client.ts` 的本地内存模式（避免沙箱 safe-delete 拦截磁盘写入）复用。
export async function seedData(db: any) {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const hash = await bcrypt.hash(password, 10);
  await db.insert(schema.admin).values({ username, passwordHash: hash });

  await db.insert(schema.categories).values([
    { name: "整机", slug: "desktop", sort: 1 },
    { name: "笔记本", slug: "laptop", sort: 2 },
    { name: "CPU", slug: "cpu", sort: 3 },
    { name: "显卡", slug: "gpu", sort: 4 },
    { name: "内存", slug: "ram", sort: 5 },
    { name: "硬盘", slug: "storage", sort: 6 },
    { name: "显示器", slug: "monitor", sort: 7 },
    { name: "外设", slug: "peripheral", sort: 8 },
  ]);

  await db.insert(schema.brands).values([
    { name: "联想", sort: 1 },
    { name: "戴尔", sort: 2 },
    { name: "惠普", sort: 3 },
    { name: "华硕", sort: 4 },
    { name: "苹果", sort: 5 },
    { name: "小米", sort: 6 },
  ]);

  await db.insert(schema.products).values({
    categoryId: 2,
    brandId: 5,
    title: "MacBook Pro 13 2020（示例）",
    condition: "95新",
    price: 3200,
    config: { cpu: "M1", ram: "8G", disk: "256G" },
    images: [],
    status: "onsale",
    description: "示例商品，可删除。",
  });

  await db.insert(schema.priceRules).values({
    deviceType: "笔记本",
    brand: "苹果",
    model: "MacBook Pro 13",
    basePrice: 4000,
    conditionFactor: { "95新": 0.85, "9成新": 0.75, "8成新": 0.6 },
    configBonus: { M1: 0, M2: 800 },
  });

  await db.insert(schema.shopSettings).values({
    id: 1,
    phone: "13800000000",
    wechatQr: "",
    address: "示例地址",
    hours: "9:00-21:00",
    intro: "本地二手电脑回收与出售",
    recycleScope: "笔记本 / 台式机 / 配件",
    announcement: "欢迎光临",
  });
}
