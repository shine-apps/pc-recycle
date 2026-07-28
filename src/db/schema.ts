import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", ["onsale", "off", "sold"]);
export const orderStatus = pgEnum("order_status", ["pending", "quoted", "deal", "cancel"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sort: integer("sort").notNull().default(0),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  title: text("title").notNull(),
  condition: text("condition").notNull(),
  price: integer("price").notNull(),
  config: jsonb("config").$type<Record<string, string>>(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  status: productStatus("status").notNull().default("onsale"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceRules = pgTable("price_rules", {
  id: serial("id").primaryKey(),
  deviceType: text("device_type").notNull(),
  brand: text("brand"),
  model: text("model"),
  basePrice: integer("base_price").notNull(),
  conditionFactor: jsonb("condition_factor").$type<Record<string, number>>().notNull(),
  configBonus: jsonb("config_bonus").$type<Record<string, number>>(),
});

export const recycleOrders = pgTable("recycle_orders", {
  id: serial("id").primaryKey(),
  deviceType: text("device_type").notNull(),
  brand: text("brand"),
  model: text("model"),
  config: jsonb("config").$type<Record<string, string>>(),
  condition: text("condition").notNull(),
  buyYear: integer("buy_year"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  expectPrice: integer("expect_price"),
  contactPhone: text("contact_phone").notNull(),
  contactWechat: text("contact_wechat"),
  status: orderStatus("status").notNull().default("pending"),
  estRange: jsonb("est_range").$type<{ min: number; max: number }>(),
  estMode: text("est_mode"),
  finalPrice: integer("final_price"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  productId: integer("product_id"),
  content: text("content").notNull(),
  contact: text("contact").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shopSettings = pgTable("shop_settings", {
  id: integer("id").primaryKey().default(1),
  phone: text("phone"),
  wechatQr: text("wechat_qr"),
  address: text("address"),
  hours: text("hours"),
  intro: text("intro"),
  recycleScope: text("recycle_scope"),
  announcement: text("announcement"),
});

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
