import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const productInputSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  brandId: z.number().int().positive().optional(),
  title: z.string().min(1),
  condition: z.string().min(1),
  price: z.number().int().nonnegative(),
  config: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).default([]),
  status: z.enum(["onsale", "off", "sold"]).default("onsale"),
  description: z.string().optional(),
});

export const recycleOrderInputSchema = z.object({
  deviceType: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  config: z.record(z.string(), z.string()).optional(),
  condition: z.string().min(1),
  buyYear: z.number().int().optional(),
  images: z.array(z.string()).default([]),
  expectPrice: z.number().int().optional(),
  contactPhone: z.string().min(1),
  contactWechat: z.string().optional(),
});

export const messageInputSchema = z.object({
  productId: z.number().int().optional(),
  content: z.string().min(1),
  contact: z.string().min(1),
});

export const priceRuleInputSchema = z.object({
  deviceType: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  basePrice: z.number().int().nonnegative(),
  conditionFactor: z.record(z.string(), z.number()),
  configBonus: z.record(z.string(), z.number()).optional(),
});

export const recycleOrderUpdateSchema = z.object({
  status: z.enum(["pending", "quoted", "deal", "cancel"]).optional(),
  finalPrice: z.number().int().nonnegative().optional(),
  note: z.string().optional(),
});

export const messageUpdateSchema = z.object({
  handled: z.boolean(),
});

export const shopSettingsUpdateSchema = z.object({
  phone: z.string().optional(),
  wechatQr: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  intro: z.string().optional(),
  recycleScope: z.string().optional(),
  announcement: z.string().optional(),
});
