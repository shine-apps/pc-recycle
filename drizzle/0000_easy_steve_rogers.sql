CREATE TYPE "public"."order_status" AS ENUM('pending', 'quoted', 'deal', 'cancel');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('onsale', 'off', 'sold');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "admin_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"content" text NOT NULL,
	"contact" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_type" text NOT NULL,
	"brand" text,
	"model" text,
	"base_price" integer NOT NULL,
	"condition_factor" jsonb NOT NULL,
	"config_bonus" jsonb
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"brand_id" integer,
	"title" text NOT NULL,
	"condition" text NOT NULL,
	"price" integer NOT NULL,
	"config" jsonb,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "product_status" DEFAULT 'onsale' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recycle_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_type" text NOT NULL,
	"brand" text,
	"model" text,
	"config" jsonb,
	"condition" text NOT NULL,
	"buy_year" integer,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expect_price" integer,
	"contact_phone" text NOT NULL,
	"contact_wechat" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"est_range" jsonb,
	"est_mode" text,
	"final_price" integer,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"phone" text,
	"wechat_qr" text,
	"address" text,
	"hours" text,
	"intro" text,
	"recycle_scope" text,
	"announcement" text
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;