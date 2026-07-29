-- 在 CloudBase PostgreSQL 中创建独立 schema pc_recycle，承载 pc-recycle 应用全部业务表。
-- 全部对象显式限定 pc_recycle schema，不依赖 search_path。
CREATE SCHEMA IF NOT EXISTS pc_recycle;

CREATE TYPE pc_recycle.order_status AS ENUM('pending', 'quoted', 'deal', 'cancel');
CREATE TYPE pc_recycle.product_status AS ENUM('onsale', 'off', 'sold');

CREATE TABLE pc_recycle.admin (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "admin_username_unique" UNIQUE("username")
);

CREATE TABLE pc_recycle.brands (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);

CREATE TABLE pc_recycle.categories (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);

CREATE TABLE pc_recycle.messages (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"content" text NOT NULL,
	"contact" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE pc_recycle.price_rules (
	"id" serial PRIMARY KEY NOT NULL,
	"device_type" text NOT NULL,
	"brand" text,
	"model" text,
	"base_price" integer NOT NULL,
	"condition_factor" jsonb NOT NULL,
	"config_bonus" jsonb
);

CREATE TABLE pc_recycle.products (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"brand_id" integer,
	"title" text NOT NULL,
	"condition" text NOT NULL,
	"price" integer NOT NULL,
	"config" jsonb,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" pc_recycle.product_status DEFAULT 'onsale' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE pc_recycle.recycle_orders (
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
	"status" pc_recycle.order_status DEFAULT 'pending' NOT NULL,
	"est_range" jsonb,
	"est_mode" text,
	"final_price" integer,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE pc_recycle.shop_settings (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"phone" text,
	"wechat_qr" text,
	"address" text,
	"hours" text,
	"intro" text,
	"recycle_scope" text,
	"announcement" text
);

ALTER TABLE pc_recycle.products ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES pc_recycle.categories("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE pc_recycle.products ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES pc_recycle.brands("id") ON DELETE no action ON UPDATE no action;
