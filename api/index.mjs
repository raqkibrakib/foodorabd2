var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import crypto3 from "node:crypto";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { and as and2, eq as eq3, or as or2, sql as sql3 } from "drizzle-orm";
import { z } from "zod";

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  commissionLedger: () => commissionLedger,
  coupons: () => coupons,
  customerAddresses: () => customerAddresses,
  favorites: () => favorites,
  foodItems: () => foodItems,
  localCredentials: () => localCredentials,
  notifications: () => notifications,
  orderStatusHistory: () => orderStatusHistory,
  orders: () => orders,
  platformSettings: () => platformSettings,
  restaurantPayouts: () => restaurantPayouts,
  restaurants: () => restaurants,
  reviews: () => reviews,
  riders: () => riders,
  users: () => users
});
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull().default("Foodora Customer"),
  phone: text("phone").default(""),
  avatarUrl: text("avatar_url").default(""),
  role: text("role").notNull().default("customer"),
  // customer | restaurant_owner | rider | admin | super_admin
  status: text("status").notNull().default("active"),
  // active | suspended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var localCredentials = pgTable("local_credentials", {
  email: text("email").primaryKey(),
  uid: text("uid").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var customerAddresses = pgTable("customer_addresses", {
  id: serial("id").primaryKey(),
  userUid: text("user_uid").notNull(),
  label: text("label").notNull().default("Home"),
  area: text("area").notNull(),
  addressLine: text("address_line").notNull(),
  lat: doublePrecision("lat").notNull().default(23.7925),
  lng: doublePrecision("lng").notNull().default(90.4078),
  instructions: text("instructions").default(""),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  ownerUid: text("owner_uid").notNull(),
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  cuisine: text("cuisine").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull().default(23.7937),
  lng: doublePrecision("lng").notNull().default(90.4066),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  logoUrl: text("logo_url").default(""),
  coverUrl: text("cover_url").notNull(),
  tradeLicense: text("trade_license").default(""),
  nidNumber: text("nid_number").default(""),
  payoutMethod: text("payout_method").notNull().default("bkash"),
  // bkash | nagad | bank
  payoutAccount: text("payout_account").notNull().default(""),
  deliveryTimeMin: integer("delivery_time_min").notNull().default(20),
  deliveryFee: integer("delivery_fee").notNull().default(49),
  minOrder: integer("min_order").notNull().default(150),
  priceTier: text("price_tier").notNull().default("\u09F3\u09F3"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.7"),
  reviewCount: integer("review_count").notNull().default(0),
  discountPct: integer("discount_pct").notNull().default(0),
  isSponsored: boolean("is_sponsored").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isOpen: boolean("is_open").notNull().default(true),
  status: text("status").notNull().default("pending"),
  // pending | approved | rejected | suspended
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  commissionType: text("commission_type").notNull().default("percentage"),
  // percentage | fixed
  fixedCommission: integer("fixed_commission").notNull().default(0),
  subscriptionPlan: text("subscription_plan").notNull().default("free"),
  // free | basic | premium | enterprise
  deliveryMode: text("delivery_mode").notNull().default("platform"),
  // platform | restaurant | third_party
  openingHours: text("opening_hours").notNull().default("10:00 AM - 11:30 PM"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }).notNull(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  price: integer("price").notNull(),
  discountPrice: integer("discount_price"),
  variationsJson: jsonb("variations_json").$type().notNull().default([]),
  addonsJson: jsonb("addons_json").$type().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  // percentage | fixed | free_delivery
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  maxDiscount: integer("max_discount").notNull().default(500),
  restaurantId: integer("restaurant_id"),
  usageLimit: integer("usage_limit").notNull().default(1e3),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerUid: text("customer_uid").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  restaurantName: text("restaurant_name").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryArea: text("delivery_area").notNull(),
  deliveryLat: doublePrecision("delivery_lat").notNull().default(23.7925),
  deliveryLng: doublePrecision("delivery_lng").notNull().default(90.4078),
  deliveryInstructions: text("delivery_instructions").default(""),
  deliveryMode: text("delivery_mode").notNull().default("platform"),
  // platform | restaurant | third_party
  deliveryProvider: text("delivery_provider").notNull().default("Foodora Rider"),
  consignmentId: text("consignment_id").default(""),
  paymentMethod: text("payment_method").notNull().default("cod"),
  // bkash | nagad | sslcommerz | cod
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending | paid | failed | refunded
  paymentTxId: text("payment_tx_id").default(""),
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  couponCode: text("coupon_code").default(""),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  serviceFee: integer("service_fee").notNull().default(10),
  taxAmount: integer("tax_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  platformCommission: integer("platform_commission").notNull().default(0),
  restaurantEarnings: integer("restaurant_earnings").notNull().default(0),
  status: text("status").notNull().default("confirmed"),
  // confirmed | accepted | preparing | ready | rider_assigned | picked_up | on_the_way | delivered | cancelled
  cancelReason: text("cancel_reason").default(""),
  riderUid: text("rider_uid").default(""),
  riderName: text("rider_name").default(""),
  estimatedMinutes: integer("estimated_minutes").notNull().default(30),
  itemsSnapshotJson: jsonb("items_snapshot_json").$type().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull(),
  note: text("note").default(""),
  actorUid: text("actor_uid").default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var commissionLedger = pgTable("commission_ledger", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  entryType: text("entry_type").notNull(),
  // commission_earned | commission_reversal | payout_debit | subscription_fee
  grossAmount: integer("gross_amount").notNull(),
  commissionAmount: integer("commission_amount").notNull(),
  netRestaurantAmount: integer("net_restaurant_amount").notNull(),
  deliveryFeeAmount: integer("delivery_fee_amount").notNull().default(0),
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var restaurantPayouts = pgTable("restaurant_payouts", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  restaurantName: text("restaurant_name").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull().default("bkash"),
  accountNumber: text("account_number").notNull(),
  status: text("status").notNull().default("pending"),
  // pending | paid | rejected
  referenceId: text("reference_id").default(""),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at")
});
var riders = pgTable("riders", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  vehicleType: text("vehicle_type").notNull().default("Motorbike"),
  nidNumber: text("nid_number").default(""),
  zone: text("zone").notNull().default("Gulshan / Banani"),
  isAvailable: boolean("is_available").notNull().default(true),
  status: text("status").notNull().default("approved"),
  // pending | approved | suspended
  currentLat: doublePrecision("current_lat").notNull().default(23.7949),
  currentLng: doublePrecision("current_lng").notNull().default(90.4043),
  locationUpdatedAt: timestamp("location_updated_at").defaultNow().notNull(),
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  totalEarnings: integer("total_earnings").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }).notNull(),
  customerUid: text("customer_uid").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  foodRating: integer("food_rating").notNull().default(5),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  customerUid: text("customer_uid").notNull(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientUid: text("recipient_uid").notNull(),
  roleTarget: text("role_target").notNull().default("customer"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("order"),
  isRead: boolean("is_read").notNull().default(false),
  relatedOrderId: integer("related_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  platformName: text("platform_name").notNull().default("Foodora BD"),
  defaultCommissionPct: numeric("default_commission_pct", { precision: 5, scale: 2 }).notNull().default("15.00"),
  defaultDeliveryFee: integer("default_delivery_fee").notNull().default(49),
  serviceFee: integer("service_fee").notNull().default(10),
  minOrderDefault: integer("min_order_default").notNull().default(150),
  pathaoEnabled: boolean("pathao_enabled").notNull().default(true),
  pathaoSandbox: boolean("pathao_sandbox").notNull().default(true),
  bkashEnabled: boolean("bkash_enabled").notNull().default(true),
  bkashSandbox: boolean("bkash_sandbox").notNull().default(true),
  sslcommerzEnabled: boolean("sslcommerz_enabled").notNull().default(true),
  sslcommerzSandbox: boolean("sslcommerz_sandbox").notNull().default(true),
  storefrontConfig: jsonb("storefront_config").$type().notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorUid: text("actor_uid").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  details: text("details").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/db/index.ts
function hasDatabaseConfig() {
  return Boolean(
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || process.env.SQL_HOST
  );
}
var createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
    const isVercel = Boolean(
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION
    );
    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? void 0 : { rejectUnauthorized: false },
        max: isVercel ? 5 : 10,
        idleTimeoutMillis: isVercel ? 15e3 : 3e4,
        connectionTimeoutMillis: 15e3
      });
    } else if (process.env.SQL_HOST) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15e3
      });
    } else {
      global._postgresPool = new Pool({
        host: "missing-database-url.invalid",
        connectionTimeoutMillis: 1500,
        max: 1
      });
    }
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = drizzle(pool, { schema: schema_exports });

// src/db/seed.ts
import { count } from "drizzle-orm";

// src/db/ensure-schema.ts
import { sql } from "drizzle-orm";
var schemaPromise = null;
async function ensureSchemaTables() {
  if (!schemaPromise) {
    schemaPromise = runCreateTablesIfMissing().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}
var EXPECTED_TABLES = [
  "users",
  "local_credentials",
  "customer_addresses",
  "restaurants",
  "food_items",
  "coupons",
  "orders",
  "order_status_history",
  "commission_ledger",
  "restaurant_payouts",
  "riders",
  "reviews",
  "favorites",
  "notifications",
  "platform_settings",
  "audit_logs"
];
async function runCreateTablesIfMissing() {
  const existingRes = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);
  const existingSet = new Set(
    (existingRes.rows ?? []).map(
      (r) => String(r.table_name || "")
    )
  );
  const missingTables = EXPECTED_TABLES.filter((t) => !existingSet.has(t));
  if (missingTables.length === 0) {
    return;
  }
  if (!existingSet.has("users")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL DEFAULT 'Foodora Customer',
        phone TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'customer',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("local_credentials")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS local_credentials (
        email TEXT PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("customer_addresses")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id SERIAL PRIMARY KEY,
        user_uid TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT 'Home',
        area TEXT NOT NULL,
        address_line TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL DEFAULT 23.7925,
        lng DOUBLE PRECISION NOT NULL DEFAULT 90.4078,
        instructions TEXT DEFAULT '',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("restaurants")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        owner_uid TEXT NOT NULL,
        name TEXT NOT NULL,
        name_bn TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        cuisine TEXT NOT NULL,
        area TEXT NOT NULL,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL DEFAULT 23.7937,
        lng DOUBLE PRECISION NOT NULL DEFAULT 90.4066,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        logo_url TEXT DEFAULT '',
        cover_url TEXT NOT NULL,
        trade_license TEXT DEFAULT '',
        nid_number TEXT DEFAULT '',
        payout_method TEXT NOT NULL DEFAULT 'bkash',
        payout_account TEXT NOT NULL DEFAULT '',
        delivery_time_min INTEGER NOT NULL DEFAULT 20,
        delivery_fee INTEGER NOT NULL DEFAULT 49,
        min_order INTEGER NOT NULL DEFAULT 150,
        price_tier TEXT NOT NULL DEFAULT '৳৳',
        rating NUMERIC(3, 1) NOT NULL DEFAULT '4.7',
        review_count INTEGER NOT NULL DEFAULT 0,
        discount_pct INTEGER NOT NULL DEFAULT 0,
        is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
        is_new BOOLEAN NOT NULL DEFAULT FALSE,
        is_open BOOLEAN NOT NULL DEFAULT TRUE,
        status TEXT NOT NULL DEFAULT 'pending',
        commission_rate NUMERIC(5, 2) NOT NULL DEFAULT '15.00',
        commission_type TEXT NOT NULL DEFAULT 'percentage',
        fixed_commission INTEGER NOT NULL DEFAULT 0,
        subscription_plan TEXT NOT NULL DEFAULT 'free',
        delivery_mode TEXT NOT NULL DEFAULT 'platform',
        opening_hours TEXT NOT NULL DEFAULT '10:00 AM - 11:30 PM',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("food_items")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        name_bn TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL,
        price INTEGER NOT NULL,
        discount_price INTEGER,
        variations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        addons_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        in_stock BOOLEAN NOT NULL DEFAULT TRUE,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        is_popular BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("coupons")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        value INTEGER NOT NULL,
        min_order INTEGER NOT NULL DEFAULT 0,
        max_discount INTEGER NOT NULL DEFAULT 500,
        restaurant_id INTEGER,
        usage_limit INTEGER NOT NULL DEFAULT 1000,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("orders")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        customer_uid TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
        restaurant_name TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_area TEXT NOT NULL,
        delivery_lat DOUBLE PRECISION NOT NULL DEFAULT 23.7925,
        delivery_lng DOUBLE PRECISION NOT NULL DEFAULT 90.4078,
        delivery_instructions TEXT DEFAULT '',
        delivery_mode TEXT NOT NULL DEFAULT 'platform',
        delivery_provider TEXT NOT NULL DEFAULT 'Foodora Rider',
        consignment_id TEXT DEFAULT '',
        payment_method TEXT NOT NULL DEFAULT 'cod',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_tx_id TEXT DEFAULT '',
        subtotal INTEGER NOT NULL,
        discount_amount INTEGER NOT NULL DEFAULT 0,
        coupon_code TEXT DEFAULT '',
        delivery_fee INTEGER NOT NULL DEFAULT 0,
        service_fee INTEGER NOT NULL DEFAULT 10,
        tax_amount INTEGER NOT NULL DEFAULT 0,
        total_amount INTEGER NOT NULL,
        commission_rate NUMERIC(5, 2) NOT NULL DEFAULT '15.00',
        platform_commission INTEGER NOT NULL DEFAULT 0,
        restaurant_earnings INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'confirmed',
        cancel_reason TEXT DEFAULT '',
        rider_uid TEXT DEFAULT '',
        rider_name TEXT DEFAULT '',
        estimated_minutes INTEGER NOT NULL DEFAULT 30,
        items_snapshot_json JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("order_status_history")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        note TEXT DEFAULT '',
        actor_uid TEXT DEFAULT 'system',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("commission_ledger")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS commission_ledger (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
        entry_type TEXT NOT NULL,
        gross_amount INTEGER NOT NULL,
        commission_amount INTEGER NOT NULL,
        net_restaurant_amount INTEGER NOT NULL,
        delivery_fee_amount INTEGER NOT NULL DEFAULT 0,
        note TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("restaurant_payouts")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS restaurant_payouts (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
        restaurant_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        method TEXT NOT NULL DEFAULT 'bkash',
        account_number TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reference_id TEXT DEFAULT '',
        requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP
      );
    `);
  }
  if (!existingSet.has("riders")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS riders (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        vehicle_type TEXT NOT NULL DEFAULT 'Motorbike',
        nid_number TEXT DEFAULT '',
        zone TEXT NOT NULL DEFAULT 'Gulshan / Banani',
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        status TEXT NOT NULL DEFAULT 'approved',
        current_lat DOUBLE PRECISION NOT NULL DEFAULT 23.7949,
        current_lng DOUBLE PRECISION NOT NULL DEFAULT 90.4043,
        location_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        total_deliveries INTEGER NOT NULL DEFAULT 0,
        total_earnings INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("reviews")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        customer_uid TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        food_rating INTEGER NOT NULL DEFAULT 5,
        comment TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("favorites")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        customer_uid TEXT NOT NULL,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("notifications")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_uid TEXT NOT NULL,
        role_target TEXT NOT NULL DEFAULT 'customer',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'order',
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        related_order_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("platform_settings")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        platform_name TEXT NOT NULL DEFAULT 'Foodora BD',
        default_commission_pct NUMERIC(5, 2) NOT NULL DEFAULT '15.00',
        default_delivery_fee INTEGER NOT NULL DEFAULT 49,
        service_fee INTEGER NOT NULL DEFAULT 10,
        min_order_default INTEGER NOT NULL DEFAULT 150,
        pathao_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        pathao_sandbox BOOLEAN NOT NULL DEFAULT TRUE,
        bkash_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        bkash_sandbox BOOLEAN NOT NULL DEFAULT TRUE,
        sslcommerz_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sslcommerz_sandbox BOOLEAN NOT NULL DEFAULT TRUE,
        storefront_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
  if (!existingSet.has("audit_logs")) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_uid TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        details TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
}

// src/db/seed.ts
var seedPromise = null;
var IMG_HERO = "/src/assets/images/hero_dhaka_feast_1794831374659.jpg";
var IMG_BIRIYANI = "/src/assets/images/food_kacchi_biriyani_1794831373742.jpg";
var IMG_BURGER = "/src/assets/images/food_gourmet_burger_1794831375029.jpg";
var IMG_PIZZA = "/src/assets/images/food_artisan_pizza_1794831375026.jpg";
var IMG_ASIAN = "/src/assets/images/food_asian_momos_1794831375934.jpg";
var IMG_DESSERT = "/src/assets/images/food_cafe_dessert_1794831375892.jpg";
var IMG_BANGLA = "/src/assets/images/food_bangla_platter_1794831377030.jpg";
var IMG_KABAB = "/src/assets/images/food_tandoori_kabab_1794831377175.jpg";
async function ensureDatabaseSeeded() {
  if (!seedPromise) {
    seedPromise = runSeedIfEmpty().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
async function runSeedIfEmpty() {
  try {
    const existing2 = await db.select({ total: count() }).from(restaurants);
    if (Number(existing2[0]?.total ?? 0) > 0) {
      return;
    }
  } catch {
    await ensureSchemaTables();
  }
  const existing = await db.select({ total: count() }).from(restaurants);
  if (Number(existing[0]?.total ?? 0) > 0) {
    return;
  }
  await db.insert(platformSettings).values({
    platformName: "Foodora BD",
    defaultCommissionPct: "15.00",
    defaultDeliveryFee: 49,
    serviceFee: 10,
    minOrderDefault: 150,
    pathaoEnabled: true,
    pathaoSandbox: true,
    bkashEnabled: true,
    bkashSandbox: true,
    sslcommerzEnabled: true,
    sslcommerzSandbox: true
  });
  await db.insert(users).values([
    {
      uid: "demo-customer-uid",
      email: "customer@foodora.bd",
      fullName: "Rahim Uddin",
      phone: "+8801711000001",
      role: "customer"
    },
    {
      uid: "demo-vendor-uid",
      email: "partner@sultansdine.bd",
      fullName: "Tariqul Islam (Sultan\u2019s Dine)",
      phone: "+8801711000002",
      role: "restaurant_owner"
    },
    {
      uid: "demo-rider-uid",
      email: "rider@foodora.bd",
      fullName: "Kamrul Hasan",
      phone: "+8801711000003",
      role: "rider"
    },
    {
      uid: "demo-admin-uid",
      email: "admin@foodora.bd",
      fullName: "Foodora BD Platform Admin",
      phone: "+8801711000000",
      role: "super_admin"
    }
  ]).onConflictDoNothing();
  await db.insert(customerAddresses).values([
    {
      userUid: "demo-customer-uid",
      label: "Home \u2014 Gulshan 2",
      area: "Gulshan 2",
      addressLine: "House 24, Road 71, Gulshan 2, Dhaka 1212",
      lat: 23.7949,
      lng: 90.4144,
      instructions: "Call upon arrival at main gate",
      isDefault: true
    },
    {
      userUid: "demo-customer-uid",
      label: "Office \u2014 Banani",
      area: "Banani",
      addressLine: "Level 6, Kemal Ataturk Avenue, Banani, Dhaka 1213",
      lat: 23.7937,
      lng: 90.4066,
      instructions: "Leave at reception desk",
      isDefault: false
    }
  ]);
  await db.insert(riders).values([
    {
      uid: "demo-rider-uid",
      fullName: "Kamrul Hasan",
      phone: "+8801711000003",
      email: "rider@foodora.bd",
      vehicleType: "Motorbike",
      nidNumber: "1994261882910",
      zone: "Gulshan / Banani",
      isAvailable: true,
      status: "approved",
      currentLat: 23.7939,
      currentLng: 90.4112,
      totalDeliveries: 148,
      totalEarnings: 18450
    },
    {
      uid: "rider-mehedi-uid",
      fullName: "Mehedi Rahman",
      phone: "+8801819223344",
      email: "mehedi.rider@foodora.bd",
      vehicleType: "Bicycle",
      nidNumber: "1997261445512",
      zone: "Dhanmondi / Mohammadpur",
      isAvailable: true,
      status: "approved",
      currentLat: 23.7461,
      currentLng: 90.3742,
      totalDeliveries: 92,
      totalEarnings: 11200
    }
  ]).onConflictDoNothing();
  const restaurantSeed = [
    {
      ownerUid: "demo-vendor-uid",
      name: "Sultan's Dine \u2014 Gulshan",
      nameBn: "\u09B8\u09C1\u09B2\u09A4\u09BE\u09A8\u09B8 \u09A1\u09BE\u0987\u09A8 \u2014 \u0997\u09C1\u09B2\u09B6\u09BE\u09A8",
      slug: "sultans-dine-gulshan",
      description: "Authentic Old Dhaka style Mutton Kacchi Biriyani slow-cooked in copper handis with saffron and aromatic spices.",
      cuisine: "Biriyani",
      area: "Gulshan 2",
      address: "Plot 14, Road 103, Gulshan 2, Dhaka",
      lat: 23.7962,
      lng: 90.4158,
      phone: "+8801712345601",
      email: "gulshan@sultansdine.bd",
      coverUrl: IMG_BIRIYANI,
      tradeLicense: "TRAD/DSCC/004812",
      nidNumber: "1988269012345",
      payoutMethod: "bkash",
      payoutAccount: "01712345601",
      deliveryTimeMin: 15,
      deliveryFee: 49,
      minOrder: 250,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.9",
      reviewCount: 3500,
      discountPct: 0,
      isSponsored: true,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "platform",
      openingHours: "11:30 AM - 11:00 PM"
    },
    {
      ownerUid: "owner-kacchibhai",
      name: "Kacchi Bhai \u2014 Banani",
      nameBn: "\u0995\u09BE\u099A\u09CD\u099A\u09BF \u09AD\u09BE\u0987 \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "kacchi-bhai-banani",
      description: "Traditional Basmati Kacchi, Polao, Borhani and Jali Kabab crafted fresh every batch.",
      cuisine: "Biriyani",
      area: "Banani",
      address: "Road 11, Block F, Banani, Dhaka",
      lat: 23.7931,
      lng: 90.4052,
      phone: "+8801712345602",
      email: "banani@kacchibhai.bd",
      coverUrl: IMG_HERO,
      tradeLicense: "TRAD/DNCC/009123",
      nidNumber: "1989112233445",
      payoutMethod: "bkash",
      payoutAccount: "01712345602",
      deliveryTimeMin: 15,
      deliveryFee: 45,
      minOrder: 200,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.8",
      reviewCount: 4200,
      discountPct: 10,
      isSponsored: true,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "platform",
      openingHours: "12:00 PM - 11:30 PM"
    },
    {
      ownerUid: "owner-burgerxpress",
      name: "Burger Xpress \u2014 Banani",
      nameBn: "\u09AC\u09BE\u09B0\u09CD\u0997\u09BE\u09B0 \u098F\u0995\u09CD\u09B8\u09AA\u09CD\u09B0\u09C7\u09B8 \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "burger-xpress-banani",
      description: "Double smashed dry-aged beef burgers, crispy peri-peri fries, and house-smoked sauces.",
      cuisine: "Burger",
      area: "Banani",
      address: "House 58, Road 11, Banani, Dhaka",
      lat: 23.7924,
      lng: 90.4079,
      phone: "+8801712345603",
      email: "hello@burgerxpress.bd",
      coverUrl: IMG_BURGER,
      tradeLicense: "TRAD/DNCC/014510",
      payoutMethod: "nagad",
      payoutAccount: "01712345603",
      deliveryTimeMin: 12,
      deliveryFee: 49,
      minOrder: 180,
      priceTier: "\u09F3\u09F3",
      rating: "4.9",
      reviewCount: 3e3,
      discountPct: 15,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "basic",
      deliveryMode: "platform",
      openingHours: "11:00 AM - 12:30 AM"
    },
    {
      ownerUid: "owner-pizzasquad",
      name: "Pizza Squad \u2014 Dhanmondi",
      nameBn: "\u09AA\u09BF\u09CE\u099C\u09BE \u09B8\u09CD\u0995\u09CB\u09DF\u09BE\u09A1 \u2014 \u09A7\u09BE\u09A8\u09AE\u09A8\u09CD\u09A1\u09BF",
      slug: "pizza-squad-dhanmondi",
      description: "Neapolitan sourdough pizzas baked at 450\xB0C with fresh mozzarella and basil.",
      cuisine: "Pizza",
      area: "Dhanmondi",
      address: "Satmasjid Road, Dhanmondi 27, Dhaka",
      lat: 23.7518,
      lng: 90.3712,
      phone: "+8801712345604",
      email: "orders@pizzasquad.bd",
      coverUrl: IMG_PIZZA,
      tradeLicense: "TRAD/DSCC/023111",
      payoutMethod: "bkash",
      payoutAccount: "01712345604",
      deliveryTimeMin: 25,
      deliveryFee: 59,
      minOrder: 300,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.8",
      reviewCount: 1200,
      discountPct: 15,
      isSponsored: false,
      isNew: true,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "basic",
      deliveryMode: "third_party",
      openingHours: "12:00 PM - 11:30 PM"
    },
    {
      ownerUid: "owner-pandadumplings",
      name: "Panda Dumplings \u2014 Gulshan 2",
      nameBn: "\u09AA\u09BE\u09A8\u09CD\u09A1\u09BE \u09A1\u09BE\u09AE\u09CD\u09AA\u09B2\u09BF\u0982\u09B8 \u2014 \u0997\u09C1\u09B2\u09B6\u09BE\u09A8 \u09E8",
      slug: "panda-dumplings-gulshan",
      description: "Hand-folded steamed momos, Sichuan chili wontons, and wok-tossed chowmein.",
      cuisine: "Chinese",
      area: "Gulshan 2",
      address: "Road 55, Gulshan 2, Dhaka",
      lat: 23.7975,
      lng: 90.4139,
      phone: "+8801712345605",
      email: "kitchen@pandadumplings.bd",
      coverUrl: IMG_ASIAN,
      tradeLicense: "TRAD/DNCC/031900",
      payoutMethod: "bkash",
      payoutAccount: "01712345605",
      deliveryTimeMin: 15,
      deliveryFee: 52,
      minOrder: 200,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.9",
      reviewCount: 4e3,
      discountPct: 0,
      isSponsored: true,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "platform",
      openingHours: "12:00 PM - 11:00 PM"
    },
    {
      ownerUid: "owner-holeybakery",
      name: "Holey Bakery \u2014 Gulshan",
      nameBn: "\u09B9\u09CB\u09B2\u09BF \u09AC\u09C7\u0995\u09BE\u09B0\u09BF \u2014 \u0997\u09C1\u09B2\u09B6\u09BE\u09A8",
      slug: "holey-bakery-gulshan",
      description: "Artisanal croissants, dark chocolate fudge cakes, and specialty cold brew coffee.",
      cuisine: "Bakery",
      area: "Gulshan 1",
      address: "Road 79, Gulshan 1, Dhaka",
      lat: 23.7811,
      lng: 90.4167,
      phone: "+8801712345606",
      email: "bakery@holey.bd",
      coverUrl: IMG_DESSERT,
      tradeLicense: "TRAD/DNCC/045102",
      payoutMethod: "bank",
      payoutAccount: "City Bank AC-11029384",
      deliveryTimeMin: 10,
      deliveryFee: 45,
      minOrder: 200,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "5.0",
      reviewCount: 1e4,
      discountPct: 15,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "12.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "enterprise",
      deliveryMode: "platform",
      openingHours: "08:00 AM - 10:30 PM"
    },
    {
      ownerUid: "owner-starkabab",
      name: "Star Kabab & Restaurant \u2014 Banani",
      nameBn: "\u09B8\u09CD\u099F\u09BE\u09B0 \u0995\u09BE\u09AC\u09BE\u09AC \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "star-kabab-banani",
      description: "Iconic Dhaka charcoal chicken tikka, mutton seekh kabab, butter naan, and kacchi.",
      cuisine: "Kabab",
      area: "Banani",
      address: "House 12, Road 17, Banani, Dhaka",
      lat: 23.7945,
      lng: 90.4029,
      phone: "+8801712345607",
      email: "star@starkabab.bd",
      coverUrl: IMG_KABAB,
      tradeLicense: "TRAD/DNCC/001122",
      payoutMethod: "bkash",
      payoutAccount: "01712345607",
      deliveryTimeMin: 10,
      deliveryFee: 52,
      minOrder: 150,
      priceTier: "\u09F3\u09F3",
      rating: "4.8",
      reviewCount: 15e3,
      discountPct: 0,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "restaurant",
      openingHours: "07:00 AM - 11:45 PM"
    },
    {
      ownerUid: "owner-ghoroa",
      name: "Ghoroa Hotel & Restaurant",
      nameBn: "\u0998\u09B0\u09CB\u09DF\u09BE \u09B9\u09CB\u099F\u09C7\u09B2 \u098F\u09A8\u09CD\u09A1 \u09B0\u09C7\u09B8\u09CD\u099F\u09C1\u09B0\u09C7\u09A8\u09CD\u099F",
      slug: "ghoroa-hotel-motijheel",
      description: "Traditional Bangladeshi shorshe ilish, bhuna khichuri, and 12-item homestyle bhorta platter.",
      cuisine: "Bangladeshi",
      area: "Motijheel",
      address: "32 Toyenbee Circular Road, Motijheel, Dhaka",
      lat: 23.7272,
      lng: 90.4198,
      phone: "+8801712345608",
      email: "orders@ghoroa.bd",
      coverUrl: IMG_BANGLA,
      tradeLicense: "TRAD/DSCC/000988",
      payoutMethod: "bkash",
      payoutAccount: "01712345608",
      deliveryTimeMin: 18,
      deliveryFee: 59,
      minOrder: 160,
      priceTier: "\u09F3\u09F3",
      rating: "4.8",
      reviewCount: 2e4,
      discountPct: 12,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "basic",
      deliveryMode: "third_party",
      openingHours: "08:00 AM - 11:00 PM"
    },
    {
      ownerUid: "owner-takeout",
      name: "Takeout \u2014 Banani",
      nameBn: "\u099F\u09C7\u0995\u0986\u0989\u099F \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "takeout-banani",
      description: "Dhaka\u2019s beloved gourmet beef & crispy chicken burgers with loaded cheese fries.",
      cuisine: "Burger",
      area: "Banani",
      address: "Road 12, Block E, Banani, Dhaka",
      lat: 23.7918,
      lng: 90.4041,
      phone: "+8801712345609",
      email: "banani@takeout.bd",
      coverUrl: IMG_BURGER,
      tradeLicense: "TRAD/DNCC/007721",
      payoutMethod: "bkash",
      payoutAccount: "01712345609",
      deliveryTimeMin: 12,
      deliveryFee: 52,
      minOrder: 200,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.9",
      reviewCount: 2e4,
      discountPct: 10,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "platform",
      openingHours: "12:00 PM - 11:59 PM"
    },
    {
      ownerUid: "owner-cheez",
      name: "Cheez \u2014 Banani",
      nameBn: "\u099A\u09BF\u099C \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "cheez-banani",
      description: "Hand-stretched cheesy pizzas, garlic knots, and creamy Alfredo pasta bowls.",
      cuisine: "Pizza",
      area: "Banani",
      address: "Road 11, Banani, Dhaka",
      lat: 23.7929,
      lng: 90.4081,
      phone: "+8801712345610",
      email: "cheez@cheez.bd",
      coverUrl: IMG_PIZZA,
      tradeLicense: "TRAD/DNCC/051120",
      payoutMethod: "nagad",
      payoutAccount: "01712345610",
      deliveryTimeMin: 15,
      deliveryFee: 52,
      minOrder: 250,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "4.9",
      reviewCount: 1e4,
      discountPct: 15,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "basic",
      deliveryMode: "platform",
      openingHours: "12:00 PM - 11:30 PM"
    },
    {
      ownerUid: "owner-mezzan",
      name: "Mezzan Haile Aaiun",
      nameBn: "\u09AE\u09C7\u099C\u09CD\u099C\u09BE\u09A8 \u09B9\u09BE\u0987\u09B2\u09C7 \u0986\u0987\u09DF\u09C1\u09A8 \u2014 \u09AC\u09A8\u09BE\u09A8\u09C0",
      slug: "mezzan-haile-aaiun",
      description: "Authentic Chattogram Mejbani beef curry, kala bhuna, and chana dal.",
      cuisine: "Bangladeshi",
      area: "Banani",
      address: "House 42, Road 27, Banani, Dhaka",
      lat: 23.7952,
      lng: 90.4021,
      phone: "+8801712345611",
      email: "mezzan@mezzan.bd",
      coverUrl: IMG_BANGLA,
      tradeLicense: "TRAD/DNCC/061233",
      payoutMethod: "bkash",
      payoutAccount: "01712345611",
      deliveryTimeMin: 15,
      deliveryFee: 52,
      minOrder: 220,
      priceTier: "\u09F3\u09F3",
      rating: "4.6",
      reviewCount: 2e3,
      discountPct: 10,
      isSponsored: false,
      isNew: true,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "free",
      deliveryMode: "platform",
      openingHours: "11:30 AM - 11:00 PM"
    },
    {
      ownerUid: "owner-northend",
      name: "NORTH END Coffee Roasters",
      nameBn: "\u09A8\u09B0\u09CD\u09A5 \u098F\u09A8\u09CD\u09A1 \u0995\u09AB\u09BF \u09B0\u09CB\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09B8",
      slug: "north-end-gulshan",
      description: "Single-origin Chittagong Hill Tracts espresso, iced lattes, and freshly baked pastries.",
      cuisine: "Drinks",
      area: "Gulshan 2",
      address: "Road 41, Gulshan 2, Dhaka",
      lat: 23.7932,
      lng: 90.4152,
      phone: "+8801712345612",
      email: "roastery@northend.bd",
      coverUrl: IMG_DESSERT,
      tradeLicense: "TRAD/DNCC/019932",
      payoutMethod: "bank",
      payoutAccount: "BRAC Bank AC-9981234",
      deliveryTimeMin: 15,
      deliveryFee: 45,
      minOrder: 150,
      priceTier: "\u09F3\u09F3\u09F3",
      rating: "5.0",
      reviewCount: 3e3,
      discountPct: 0,
      isSponsored: false,
      isNew: false,
      isOpen: true,
      status: "approved",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "premium",
      deliveryMode: "platform",
      openingHours: "07:30 AM - 11:00 PM"
    },
    {
      ownerUid: "owner-pending-uttara",
      name: "Dhaka Spice House \u2014 Uttara",
      nameBn: "\u09A2\u09BE\u0995\u09BE \u09B8\u09CD\u09AA\u09BE\u0987\u09B8 \u09B9\u09BE\u0989\u09B8 \u2014 \u0989\u09A4\u09CD\u09A4\u09B0\u09BE",
      slug: "dhaka-spice-house-uttara",
      description: "New family kitchen in Sector 7 Uttara offering tehari, grilled chicken, and kababs.",
      cuisine: "Bangladeshi",
      area: "Uttara",
      address: "House 19, Road 12, Sector 7, Uttara, Dhaka",
      lat: 23.8682,
      lng: 90.3991,
      phone: "+8801712345699",
      email: "apply@dhakaspice.bd",
      coverUrl: IMG_KABAB,
      tradeLicense: "TRAD/DNCC/099881",
      nidNumber: "1991269988776",
      payoutMethod: "bkash",
      payoutAccount: "01712345699",
      deliveryTimeMin: 25,
      deliveryFee: 55,
      minOrder: 180,
      priceTier: "\u09F3\u09F3",
      rating: "4.7",
      reviewCount: 12,
      discountPct: 15,
      isSponsored: false,
      isNew: true,
      isOpen: true,
      status: "pending",
      commissionRate: "15.00",
      commissionType: "percentage",
      fixedCommission: 0,
      subscriptionPlan: "free",
      deliveryMode: "platform",
      openingHours: "11:00 AM - 11:00 PM"
    }
  ];
  const insertedRestaurants = await db.insert(restaurants).values(restaurantSeed).returning();
  const menuBlueprints = {
    Biriyani: [
      {
        category: "Signature Kacchi",
        name: "Bashmati Mutton Kacchi",
        nameBn: "\u09AC\u09BE\u09B8\u09AE\u09A4\u09BF \u09AE\u09BE\u099F\u09A8 \u0995\u09BE\u099A\u09CD\u099A\u09BF",
        description: "Tender marinated mutton slow-cooked with aged basmati rice, saffron, potato, and aromatic ghee.",
        imageUrl: IMG_BIRIYANI,
        price: 499,
        discountPrice: 449,
        variationsJson: [
          { name: "Half (1 Person)", priceDelta: 0 },
          { name: "Full (1-2 Persons)", priceDelta: 220 },
          { name: "Family Handi (4 Persons)", priceDelta: 950 }
        ],
        addonsJson: [
          { name: "Chilled Borhani (250ml)", price: 65 },
          { name: "Beef Jali Kabab", price: 85 },
          { name: "Shahi Firni", price: 90 }
        ],
        isPopular: true
      },
      {
        category: "Polao & Tehari",
        name: "Shahi Morog Polao",
        nameBn: "\u09B6\u09BE\u09B9\u09C0 \u09AE\u09CB\u09B0\u0997 \u09AA\u09CB\u09B2\u09BE\u0993",
        description: "Fragrant chinigura rice paired with rich roasted chicken leg and egg.",
        imageUrl: IMG_HERO,
        price: 360,
        variationsJson: [
          { name: "Regular", priceDelta: 0 },
          { name: "Special with Egg & Kabab", priceDelta: 110 }
        ],
        addonsJson: [
          { name: "Chilled Borhani (250ml)", price: 65 },
          { name: "Extra Chicken Roast", price: 160 }
        ],
        isPopular: true
      },
      {
        category: "Kabab & Sides",
        name: "Beef Reshmi & Seekh Combo",
        nameBn: "\u09AC\u09BF\u09AB \u09B0\u09C7\u09B6\u09AE\u09BF \u0993 \u09B6\u09BF\u0995 \u0995\u09BE\u09AC\u09BE\u09AC",
        description: "Charcoal-grilled skewers served with butter garlic naan and mint chutney.",
        imageUrl: IMG_KABAB,
        price: 340,
        variationsJson: [{ name: "2 Skewers + 1 Naan", priceDelta: 0 }],
        addonsJson: [{ name: "Extra Butter Naan", price: 60 }],
        isPopular: false
      },
      {
        category: "Drinks & Dessert",
        name: "Traditional Mint Borhani",
        nameBn: "\u0990\u09A4\u09BF\u09B9\u09CD\u09AF\u09AC\u09BE\u09B9\u09C0 \u09AA\u09C1\u09A6\u09BF\u09A8\u09BE \u09AC\u09CB\u09B0\u09B9\u09BE\u09A8\u09BF",
        description: "Spiced yogurt digestive drink blended with green chili, coriander, and rock salt.",
        imageUrl: IMG_DESSERT,
        price: 80,
        variationsJson: [
          { name: "250ml Glass", priceDelta: 0 },
          { name: "1 Litre Bottle", priceDelta: 200 }
        ],
        addonsJson: [],
        isPopular: false
      }
    ],
    Burger: [
      {
        category: "Smashed Burgers",
        name: "Double Cheddar Smash Burger",
        nameBn: "\u09A1\u09BE\u09AC\u09B2 \u099A\u09C7\u09A1\u09BE\u09B0 \u09B8\u09CD\u09AE\u09CD\u09AF\u09BE\u09B6 \u09AC\u09BE\u09B0\u09CD\u0997\u09BE\u09B0",
        description: "Two crispy-edged beef patties, double aged cheddar, caramelized onions, house burger sauce.",
        imageUrl: IMG_BURGER,
        price: 420,
        discountPrice: 369,
        variationsJson: [
          { name: "Single Patty", priceDelta: -80 },
          { name: "Double Patty", priceDelta: 0 },
          { name: "Triple Monster", priceDelta: 140 }
        ],
        addonsJson: [
          { name: "Peri-Peri Fries", price: 120 },
          { name: "Extra Cheddar Slice", price: 50 },
          { name: "Iced Lemon Tea", price: 90 }
        ],
        isPopular: true
      },
      {
        category: "Chicken Specials",
        name: "Nashville Crispy Chicken Burger",
        nameBn: "\u09A8\u09CD\u09AF\u09BE\u09B6\u09AD\u09BF\u09B2 \u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u09AA\u09BF \u099A\u09BF\u0995\u09C7\u09A8 \u09AC\u09BE\u09B0\u09CD\u0997\u09BE\u09B0",
        description: "Crispy buttermilk fried chicken thigh tossed in spicy glaze with slaw.",
        imageUrl: IMG_BURGER,
        price: 340,
        variationsJson: [
          { name: "Mild", priceDelta: 0 },
          { name: "Naga Blaze", priceDelta: 20 }
        ],
        addonsJson: [{ name: "Cheesy Loaded Fries", price: 165 }],
        isPopular: true
      },
      {
        category: "Sides",
        name: "Smoked Garlic Chicken Wings (6 pcs)",
        nameBn: "\u09B8\u09CD\u09AE\u09CB\u0995\u09A1 \u0997\u09BE\u09B0\u09CD\u09B2\u09BF\u0995 \u099A\u09BF\u0995\u09C7\u09A8 \u0989\u0987\u0982\u09B8",
        description: "Glazed crispy wings served with ranch dip.",
        imageUrl: IMG_KABAB,
        price: 290,
        variationsJson: [{ name: "6 Pieces", priceDelta: 0 }, { name: "12 Pieces", priceDelta: 250 }],
        addonsJson: [{ name: "Extra Ranch Dip", price: 40 }],
        isPopular: false
      }
    ],
    Pizza: [
      {
        category: "Artisan Wood-Fired",
        name: "Pepperoni & Fresh Basil Pizza",
        nameBn: "\u09AA\u09C7\u09AA\u09BE\u09B0\u09A8\u09BF \u0993 \u09AB\u09CD\u09B0\u09C7\u09B6 \u09AC\u09C7\u09B8\u09BF\u09B2 \u09AA\u09BF\u09CE\u099C\u09BE",
        description: "San Marzano tomato base, halal beef pepperoni, buffalo mozzarella, and olive oil.",
        imageUrl: IMG_PIZZA,
        price: 790,
        discountPrice: 680,
        variationsJson: [
          { name: "9-inch Personal", priceDelta: 0 },
          { name: "12-inch Medium", priceDelta: 320 },
          { name: "16-inch Party", priceDelta: 650 }
        ],
        addonsJson: [
          { name: "Stuffed Cheese Crust", price: 140 },
          { name: "Garlic Dip", price: 45 }
        ],
        isPopular: true
      },
      {
        category: "Artisan Wood-Fired",
        name: "Dhaka Naga Beef Overload",
        nameBn: "\u09A2\u09BE\u0995\u09BE \u09A8\u09BE\u0997\u09BE \u09AC\u09BF\u09AB \u0993\u09AD\u09BE\u09B0\u09B2\u09CB\u09A1",
        description: "Spiced minced beef, roasted bell peppers, red onion, and green naga chili.",
        imageUrl: IMG_PIZZA,
        price: 850,
        variationsJson: [
          { name: "9-inch Personal", priceDelta: 0 },
          { name: "12-inch Medium", priceDelta: 340 }
        ],
        addonsJson: [{ name: "Extra Mozzarella", price: 110 }],
        isPopular: true
      }
    ],
    Chinese: [
      {
        category: "Momos & Dumplings",
        name: "Steamed Chicken & Chive Momos (8 pcs)",
        nameBn: "\u09B8\u09CD\u099F\u09BF\u09AE\u09A1 \u099A\u09BF\u0995\u09C7\u09A8 \u09AE\u09CB\u09AE\u09CB (\u09EE \u09AA\u09BF\u09B8)",
        description: "Juicy handmade dumplings served with house Sichuan chili oil and garlic soy.",
        imageUrl: IMG_ASIAN,
        price: 290,
        discountPrice: 255,
        variationsJson: [
          { name: "Steamed (8 pcs)", priceDelta: 0 },
          { name: "Pan-Fried Kothey (8 pcs)", priceDelta: 30 }
        ],
        addonsJson: [{ name: "Extra Chili Oil", price: 35 }],
        isPopular: true
      },
      {
        category: "Wok Noodles",
        name: "Sesame Hakka Chicken Chowmein",
        nameBn: "\u09B8\u09C7\u09B8\u09BE\u09AE\u09BF \u09B9\u09BE\u0995\u09CD\u0995\u09BE \u099A\u09BF\u0995\u09C7\u09A8 \u099A\u09BE\u0989\u09AE\u09BF\u09A8",
        description: "Smoky wok-tossed noodles with julienned vegetables, chicken strips, and toasted sesame.",
        imageUrl: IMG_ASIAN,
        price: 360,
        variationsJson: [{ name: "Regular Bowl", priceDelta: 0 }, { name: "Sharing Platter", priceDelta: 240 }],
        addonsJson: [{ name: "Crispy Wonthons (4 pcs)", price: 120 }],
        isPopular: true
      }
    ],
    Bakery: [
      {
        category: "Cakes & Pastries",
        name: "Belgian Dark Chocolate Fudge Cake",
        nameBn: "\u09AC\u09C7\u09B2\u099C\u09BF\u09DF\u09BE\u09A8 \u09A1\u09BE\u09B0\u09CD\u0995 \u099A\u0995\u09B2\u09C7\u099F \u09AB\u09BE\u099C \u0995\u09C7\u0995",
        description: "Rich 3-layer dark cocoa sponge finished with silky chocolate ganache.",
        imageUrl: IMG_DESSERT,
        price: 340,
        discountPrice: 295,
        variationsJson: [
          { name: "Single Slice", priceDelta: 0 },
          { name: "Half Pound Box", priceDelta: 450 }
        ],
        addonsJson: [{ name: "Iced Caramel Macchiato", price: 240 }],
        isPopular: true
      },
      {
        category: "Coffee & Drinks",
        name: "Iced Caramel Macchiato",
        nameBn: "\u0986\u0987\u09B8\u09A1 \u0995\u09CD\u09AF\u09BE\u09B0\u09BE\u09AE\u09C7\u09B2 \u09AE\u09CD\u09AF\u09BE\u0995\u09BF\u09AF\u09BC\u09BE\u099F\u09CB",
        description: "Double espresso poured over chilled milk and house-salted caramel.",
        imageUrl: IMG_DESSERT,
        price: 260,
        variationsJson: [
          { name: "Regular (12oz)", priceDelta: 0 },
          { name: "Large (16oz)", priceDelta: 60 }
        ],
        addonsJson: [{ name: "Oat Milk Swap", price: 70 }],
        isPopular: true
      }
    ],
    Kabab: [
      {
        category: "Charcoal Grill",
        name: "Chicken Tikka & Beef Seekh Platter",
        nameBn: "\u099A\u09BF\u0995\u09C7\u09A8 \u099F\u09BF\u0995\u09CD\u0995\u09BE \u0993 \u09AC\u09BF\u09AB \u09B6\u09BF\u0995 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09BE\u09B0",
        description: "Smoky tandoor platter with 2 garlic naans, mint chutney, and pickled onions.",
        imageUrl: IMG_KABAB,
        price: 460,
        variationsJson: [{ name: "Solo Platter", priceDelta: 0 }, { name: "Duo Platter", priceDelta: 380 }],
        addonsJson: [{ name: "Butter Naan", price: 55 }, { name: "Mango Lassi", price: 140 }],
        isPopular: true
      }
    ],
    Bangladeshi: [
      {
        category: "Homestyle Platters",
        name: "Shorshe Ilish & Bhorta Rice Platter",
        nameBn: "\u09B8\u09B0\u09B7\u09C7 \u0987\u09B2\u09BF\u09B6 \u0993 \u09AD\u09B0\u09CD\u09A4\u09BE \u09AD\u09BE\u09A4 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09BE\u09B0",
        description: "Padma hilsa cooked in mustard paste served with steamed rice, dal, and 3 signature bhortas.",
        imageUrl: IMG_BANGLA,
        price: 480,
        discountPrice: 430,
        variationsJson: [
          { name: "1 Piece Ilish Platter", priceDelta: 0 },
          { name: "2 Pieces Ilish Feast", priceDelta: 320 }
        ],
        addonsJson: [
          { name: "Aloo & Shutki Bhorta", price: 75 },
          { name: "Begun Bhaja", price: 50 }
        ],
        isPopular: true
      },
      {
        category: "Beef Specials",
        name: "Chattogram Kala Bhuna & Rice",
        nameBn: "\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF\u09AC\u09BE\u09B9\u09C0 \u0995\u09BE\u09B2\u09BE \u09AD\u09C1\u09A8\u09BE",
        description: "Slow-braised dark spiced beef served with fragrant miniket rice and thick lentil dal.",
        imageUrl: IMG_BANGLA,
        price: 440,
        variationsJson: [{ name: "Regular Bowl", priceDelta: 0 }],
        addonsJson: [{ name: "Extra Beef Portion", price: 200 }],
        isPopular: true
      }
    ],
    Drinks: [
      {
        category: "Specialty Coffee",
        name: "Hill Tracts Cold Brew & Croissant",
        nameBn: "\u0995\u09CB\u09B2\u09CD\u09A1 \u09AC\u09CD\u09B0\u09C1 \u0995\u09AB\u09BF \u0993 \u0995\u09CD\u09B0\u09CB\u09B8\u09BE\u0981 \u0995\u09AE\u09CD\u09AC\u09CB",
        description: "18-hour steeped Bandarban Arabica cold brew paired with flaky butter croissant.",
        imageUrl: IMG_DESSERT,
        price: 380,
        variationsJson: [{ name: "Black Cold Brew", priceDelta: 0 }, { name: "Sweet Cream Cold Brew", priceDelta: 40 }],
        addonsJson: [{ name: "Extra Espresso Shot", price: 65 }],
        isPopular: true
      }
    ]
  };
  for (const r of insertedRestaurants) {
    const items = menuBlueprints[r.cuisine] || menuBlueprints["Bangladeshi"];
    await db.insert(foodItems).values(
      items.map((item) => ({
        restaurantId: r.id,
        category: item.category,
        name: item.name,
        nameBn: item.nameBn,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        discountPrice: item.discountPrice ?? null,
        variationsJson: item.variationsJson,
        addonsJson: item.addonsJson,
        inStock: true,
        isAvailable: true,
        isPopular: item.isPopular
      }))
    );
  }
  await db.insert(coupons).values([
    {
      code: "FOODORA50",
      title: "\u09EB\u09E6% \u099B\u09BE\u09DC \u09AA\u09CD\u09B0\u09A5\u09AE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 (\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09F3\u09E7\u09EB\u09E6)",
      type: "percentage",
      value: 50,
      minOrder: 250,
      maxDiscount: 150,
      usageLimit: 5e3,
      usedCount: 142,
      isActive: true
    },
    {
      code: "DHAKA15",
      title: "\u09B8\u0995\u09B2 \u09B0\u09C7\u09B8\u09CD\u099F\u09C1\u09B0\u09C7\u09A8\u09CD\u099F\u09C7 \u09E7\u09EB% \u099B\u09BE\u09DC",
      type: "percentage",
      value: 15,
      minOrder: 300,
      maxDiscount: 200,
      usageLimit: 5e3,
      usedCount: 89,
      isActive: true
    },
    {
      code: "FREEDEL",
      title: "\u09AB\u09CD\u09B0\u09BF \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF (\u09A8\u09CD\u09AF\u09C2\u09A8\u09A4\u09AE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09F3\u09E8\u09E6\u09E6)",
      type: "free_delivery",
      value: 0,
      minOrder: 200,
      maxDiscount: 80,
      usageLimit: 5e3,
      usedCount: 210,
      isActive: true
    }
  ]);
  const sultans = insertedRestaurants[0];
  const burgerX = insertedRestaurants[2];
  if (sultans && burgerX) {
    const insertedOrders = await db.insert(orders).values([
      {
        orderNumber: "FD-BD-10041",
        customerUid: "demo-customer-uid",
        customerName: "Rahim Uddin",
        customerPhone: "+8801711000001",
        restaurantId: sultans.id,
        restaurantName: sultans.name,
        deliveryAddress: "House 24, Road 71, Gulshan 2, Dhaka",
        deliveryArea: "Gulshan 2",
        deliveryLat: 23.7949,
        deliveryLng: 90.4144,
        deliveryMode: "platform",
        deliveryProvider: "Foodora Express Rider",
        consignmentId: "FDR-FD-BD-10041",
        paymentMethod: "bkash",
        paymentStatus: "paid",
        paymentTxId: "BKS-9821AA-0041",
        subtotal: 1e3,
        discountAmount: 0,
        couponCode: "",
        deliveryFee: 49,
        serviceFee: 10,
        taxAmount: 0,
        totalAmount: 1059,
        commissionRate: "15.00",
        platformCommission: 150,
        restaurantEarnings: 850,
        status: "delivered",
        riderUid: "demo-rider-uid",
        riderName: "Kamrul Hasan",
        estimatedMinutes: 22,
        itemsSnapshotJson: [
          {
            foodItemId: 1,
            name: "Bashmati Mutton Kacchi",
            nameBn: "\u09AC\u09BE\u09B8\u09AE\u09A4\u09BF \u09AE\u09BE\u099F\u09A8 \u0995\u09BE\u099A\u09CD\u099A\u09BF",
            quantity: 2,
            unitPrice: 500,
            variation: "Full",
            addons: [],
            lineTotal: 1e3
          }
        ]
      },
      {
        orderNumber: "FD-BD-10042",
        customerUid: "demo-customer-uid",
        customerName: "Rahim Uddin",
        customerPhone: "+8801711000001",
        restaurantId: sultans.id,
        restaurantName: sultans.name,
        deliveryAddress: "Level 6, Kemal Ataturk Avenue, Banani, Dhaka",
        deliveryArea: "Banani",
        deliveryLat: 23.7937,
        deliveryLng: 90.4066,
        deliveryMode: "platform",
        deliveryProvider: "Foodora Express Rider",
        consignmentId: "FDR-FD-BD-10042",
        paymentMethod: "cod",
        paymentStatus: "pending",
        paymentTxId: "COD-FD-BD-10042",
        subtotal: 720,
        discountAmount: 108,
        couponCode: "DHAKA15",
        deliveryFee: 49,
        serviceFee: 10,
        taxAmount: 0,
        totalAmount: 671,
        commissionRate: "15.00",
        platformCommission: 92,
        restaurantEarnings: 520,
        status: "ready",
        riderUid: "",
        riderName: "",
        estimatedMinutes: 20,
        itemsSnapshotJson: [
          {
            foodItemId: 2,
            name: "Shahi Morog Polao",
            nameBn: "\u09B6\u09BE\u09B9\u09C0 \u09AE\u09CB\u09B0\u0997 \u09AA\u09CB\u09B2\u09BE\u0993",
            quantity: 2,
            unitPrice: 360,
            variation: "Regular",
            addons: [],
            lineTotal: 720
          }
        ]
      }
    ]).returning();
    if (insertedOrders[0]) {
      await db.insert(orderStatusHistory).values([
        { orderId: insertedOrders[0].id, status: "confirmed", note: "Order confirmed & bKash payment verified" },
        { orderId: insertedOrders[0].id, status: "preparing", note: "Kitchen started preparing Mutton Kacchi" },
        { orderId: insertedOrders[0].id, status: "on_the_way", note: "Rider Kamrul Hasan picked up the order" },
        { orderId: insertedOrders[0].id, status: "delivered", note: "Delivered to Gulshan 2" }
      ]);
      await db.insert(commissionLedger).values({
        orderId: insertedOrders[0].id,
        restaurantId: sultans.id,
        entryType: "commission_earned",
        grossAmount: 1e3,
        commissionAmount: 150,
        netRestaurantAmount: 850,
        deliveryFeeAmount: 49,
        note: "15% marketplace commission settled for FD-BD-10041"
      });
      await db.insert(reviews).values({
        orderId: insertedOrders[0].id,
        restaurantId: sultans.id,
        customerUid: "demo-customer-uid",
        customerName: "Rahim Uddin",
        rating: 5,
        foodRating: 5,
        comment: "\u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u0995\u09BE\u099A\u09CD\u099A\u09BF \u09AC\u09BF\u09B0\u09BF\u09DF\u09BE\u09A8\u09BF, \u0997\u09B0\u09AE \u0997\u09B0\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09AA\u09C7\u09DF\u09C7\u099B\u09BF \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E8\u09E6 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7!"
      });
    }
    if (insertedOrders[1]) {
      await db.insert(orderStatusHistory).values([
        { orderId: insertedOrders[1].id, status: "confirmed", note: "COD order placed" },
        { orderId: insertedOrders[1].id, status: "accepted", note: "Sultan's Dine accepted order" },
        { orderId: insertedOrders[1].id, status: "ready", note: "Order packed and ready for rider pickup" }
      ]);
    }
    await db.insert(restaurantPayouts).values({
      restaurantId: sultans.id,
      restaurantName: sultans.name,
      amount: 500,
      method: "bkash",
      accountNumber: "01712345601",
      status: "paid",
      referenceId: "PAYOUT-BKS-7781",
      processedAt: /* @__PURE__ */ new Date()
    });
    await db.insert(notifications).values([
      {
        recipientUid: "demo-vendor-uid",
        roleTarget: "restaurant_owner",
        title: "New Order FD-BD-10042 Ready for Dispatch",
        message: "Order FD-BD-10042 (\u09F3671) is packed and waiting for rider pickup.",
        type: "order",
        relatedOrderId: insertedOrders[1]?.id
      },
      {
        recipientUid: "demo-admin-uid",
        roleTarget: "super_admin",
        title: "Pending Restaurant Approval",
        message: "Dhaka Spice House \u2014 Uttara submitted NID and Trade License for verification.",
        type: "approval"
      }
    ]);
  }
}

// src/db/queries.ts
import { and, desc, eq, or } from "drizzle-orm";
async function getApprovedRestaurants() {
  try {
    return await db.select().from(restaurants).where(eq(restaurants.status, "approved")).orderBy(desc(restaurants.isSponsored), desc(restaurants.rating));
  } catch (error) {
    console.error("Failed to load approved restaurants:", error);
    throw new Error("Failed to load restaurants", { cause: error });
  }
}
async function getRestaurantBySlug(slug) {
  try {
    const rows = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    const restaurant = rows[0];
    const items = await db.select().from(foodItems).where(eq(foodItems.restaurantId, restaurant.id));
    const restaurantReviews = await db.select().from(reviews).where(eq(reviews.restaurantId, restaurant.id)).orderBy(desc(reviews.createdAt));
    return { restaurant, items, reviews: restaurantReviews };
  } catch (error) {
    console.error("Failed to load restaurant detail:", error);
    throw new Error("Failed to load restaurant details", { cause: error });
  }
}
async function getActiveCoupons() {
  try {
    return await db.select().from(coupons).where(eq(coupons.isActive, true));
  } catch (error) {
    console.error("Failed to load coupons:", error);
    throw new Error("Failed to load coupons", { cause: error });
  }
}
async function getCustomerAddresses(userUid) {
  try {
    return await db.select().from(customerAddresses).where(eq(customerAddresses.userUid, userUid)).orderBy(desc(customerAddresses.isDefault));
  } catch (error) {
    console.error("Failed to load addresses:", error);
    throw new Error("Failed to load saved addresses", { cause: error });
  }
}
async function getCustomerOrders(customerUid) {
  try {
    return await db.select().from(orders).where(eq(orders.customerUid, customerUid)).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Failed to load customer orders:", error);
    throw new Error("Failed to load customer orders", { cause: error });
  }
}
async function getOrderById(orderId) {
  try {
    const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (rows.length === 0) return null;
    const order = rows[0];
    const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(orderStatusHistory.createdAt);
    const restRows = await db.select().from(restaurants).where(eq(restaurants.id, order.restaurantId)).limit(1);
    let riderLocation = null;
    if (order.riderUid) {
      const riderRows = await db.select().from(riders).where(eq(riders.uid, order.riderUid)).limit(1);
      if (riderRows.length > 0) {
        const r = riderRows[0];
        riderLocation = {
          uid: r.uid,
          fullName: r.fullName,
          phone: r.phone,
          vehicleType: r.vehicleType,
          zone: r.zone,
          isAvailable: r.isAvailable,
          lat: r.currentLat,
          lng: r.currentLng,
          locationUpdatedAt: r.locationUpdatedAt
        };
      }
    }
    return {
      order,
      history,
      restaurant: restRows[0] ?? null,
      riderLocation
    };
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
    throw new Error("Failed to fetch order details", { cause: error });
  }
}
async function getPlatformSettingsRow() {
  try {
    const rows = await db.select().from(platformSettings).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch platform settings:", error);
    throw new Error("Failed to load platform settings", { cause: error });
  }
}
async function getVendorWorkspace(ownerUid, isSuperAdmin) {
  try {
    const owned = isSuperAdmin ? await db.select().from(restaurants).orderBy(restaurants.id) : await db.select().from(restaurants).where(eq(restaurants.ownerUid, ownerUid));
    const target = owned[0] ?? null;
    if (!target) {
      return { restaurant: null, restaurants: [], menuItems: [], orders: [], ledger: [], payouts: [] };
    }
    const menuItems = await db.select().from(foodItems).where(eq(foodItems.restaurantId, target.id)).orderBy(desc(foodItems.id));
    const restOrders = await db.select().from(orders).where(eq(orders.restaurantId, target.id)).orderBy(desc(orders.createdAt));
    const ledger = await db.select().from(commissionLedger).where(eq(commissionLedger.restaurantId, target.id)).orderBy(desc(commissionLedger.createdAt));
    const payouts = await db.select().from(restaurantPayouts).where(eq(restaurantPayouts.restaurantId, target.id)).orderBy(desc(restaurantPayouts.requestedAt));
    return {
      restaurant: target,
      restaurants: owned,
      menuItems,
      orders: restOrders,
      ledger,
      payouts
    };
  } catch (error) {
    console.error("Failed to fetch vendor workspace:", error);
    throw new Error("Failed to load restaurant dashboard", { cause: error });
  }
}
async function getRiderWorkspace(riderUid) {
  try {
    const [riderRows, allOrders, allRestaurants] = await Promise.all([
      db.select().from(riders).where(eq(riders.uid, riderUid)).limit(1),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select({ id: restaurants.id, lat: restaurants.lat, lng: restaurants.lng }).from(restaurants)
    ]);
    const restCoordMap = new Map(allRestaurants.map((r) => [r.id, { lat: r.lat, lng: r.lng }]));
    const withRestCoords = allOrders.map((o) => {
      const coords = restCoordMap.get(o.restaurantId);
      return {
        ...o,
        restaurantLat: coords?.lat,
        restaurantLng: coords?.lng
      };
    });
    const availableOrders = withRestCoords.filter(
      (o) => o.deliveryMode === "platform" && !o.riderUid && ["accepted", "preparing", "ready"].includes(o.status)
    );
    const assignedOrders = withRestCoords.filter((o) => o.riderUid === riderUid);
    return {
      rider: riderRows[0] ?? null,
      availableOrders,
      assignedOrders
    };
  } catch (error) {
    console.error("Failed to load rider workspace:", error);
    throw new Error("Failed to load rider dashboard", { cause: error });
  }
}
async function getAdminWorkspace() {
  try {
    const [
      allRestaurants,
      allProducts,
      allOrders,
      allUsers,
      allLedger,
      allPayouts,
      allCoupons,
      allRiders,
      recentAuditLogs,
      settings
    ] = await Promise.all([
      db.select().from(restaurants).orderBy(desc(restaurants.createdAt)),
      db.select().from(foodItems).orderBy(desc(foodItems.id)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(users).orderBy(desc(users.createdAt)),
      db.select().from(commissionLedger).orderBy(desc(commissionLedger.createdAt)),
      db.select().from(restaurantPayouts).orderBy(desc(restaurantPayouts.requestedAt)),
      db.select().from(coupons).orderBy(desc(coupons.createdAt)),
      db.select().from(riders).orderBy(desc(riders.createdAt)),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(60),
      getPlatformSettingsRow()
    ]);
    return {
      restaurants: allRestaurants,
      products: allProducts,
      orders: allOrders,
      users: allUsers,
      ledger: allLedger,
      payouts: allPayouts,
      coupons: allCoupons,
      riders: allRiders,
      auditLogs: recentAuditLogs,
      settings
    };
  } catch (error) {
    console.error("Failed to load admin workspace:", error);
    throw new Error("Failed to load admin dashboard", { cause: error });
  }
}
async function getNotificationsForUser(uid, role) {
  try {
    return await db.select().from(notifications).where(
      or(
        eq(notifications.recipientUid, uid),
        eq(notifications.roleTarget, role),
        eq(notifications.roleTarget, "all")
      )
    ).orderBy(desc(notifications.createdAt)).limit(25);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
async function getCustomerFavorites(customerUid) {
  try {
    return await db.select().from(favorites).where(eq(favorites.customerUid, customerUid));
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    return [];
  }
}
async function toggleCustomerFavorite(customerUid, restaurantId) {
  try {
    const existing = await db.select().from(favorites).where(and(eq(favorites.customerUid, customerUid), eq(favorites.restaurantId, restaurantId)));
    if (existing.length > 0) {
      await db.delete(favorites).where(and(eq(favorites.customerUid, customerUid), eq(favorites.restaurantId, restaurantId)));
      return { favorited: false };
    }
    await db.insert(favorites).values({ customerUid, restaurantId });
    return { favorited: true };
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    throw new Error("Failed to update favorite", { cause: error });
  }
}

// src/middleware/auth.ts
import crypto from "node:crypto";
import { eq as eq2, sql as sql2 } from "drizzle-orm";

// src/lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";
var SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://uvqptlflvdtxbrqiztzi.supabase.co";
var SUPABASE_AUTH_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cXB0bGZsdmR0eGJycWl6dHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5Mjk4NjksImV4cCI6MjExMDUwNTg2OX0.4NdWe8fXBv6qE_sVvUZhofFW5CVQJAY_X1IvkwB69ZE";
var supabaseServer = createClient(SUPABASE_URL, SUPABASE_AUTH_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
async function verifySupabaseAccessToken(token) {
  if (!token || token.startsWith("sbx.")) return null;
  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }
    const supaUser = data.user;
    const email = supaUser.email || `${supaUser.id}@foodora.bd`;
    const meta = supaUser.user_metadata || {};
    const fullName = typeof meta.full_name === "string" && meta.full_name.trim() || typeof meta.name === "string" && meta.name.trim() || email.split("@")[0] || "Foodora User";
    return {
      uid: supaUser.id,
      email,
      fullName
    };
  } catch (err) {
    console.warn("Supabase token verification failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// src/middleware/auth.ts
var SANDBOX_SECRET = process.env.SANDBOX_SESSION_SECRET || `foodora-bd-sandbox-${process.env.SQL_DB_NAME || "dev"}-${process.env.APPLET_ID || "local"}`;
function signSandboxToken(payload) {
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      isSandbox: payload.isSandbox ?? true,
      exp: Date.now() + 1e3 * 60 * 60 * 24 * 7
    })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", SANDBOX_SECRET).update(data).digest("base64url");
  return `sbx.${data}.${sig}`;
}
function verifySandboxToken(token) {
  if (!token.startsWith("sbx.")) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [, data, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", SANDBOX_SECRET).update(data).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return {
      uid: parsed.uid,
      email: parsed.email,
      fullName: parsed.fullName,
      role: parsed.role,
      isSandbox: Boolean(parsed.isSandbox ?? true)
    };
  } catch {
    return null;
  }
}
async function getOrCreateUser(uid, email, fullName, defaultRole = "customer") {
  const emailLower = email.trim().toLowerCase();
  const isPrimaryAdmin = emailLower === "rakibraqkib@gmail.com";
  try {
    const existing = await db.select().from(users).where(eq2(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      if (isPrimaryAdmin && existing[0].role !== "super_admin") {
        const promoted = await db.update(users).set({ role: "super_admin", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, existing[0].id)).returning();
        return promoted[0];
      }
      return existing[0];
    }
    const existingByEmail = await db.select().from(users).where(sql2`lower(${users.email}) = ${emailLower}`).limit(1);
    if (existingByEmail.length > 0) {
      const current = existingByEmail[0];
      const nextRole = isPrimaryAdmin ? "super_admin" : current.role;
      const nextName = fullName && fullName.trim() && current.fullName.startsWith("Foodora") ? fullName.trim() : current.fullName;
      if (nextRole !== current.role || nextName !== current.fullName) {
        const updated = await db.update(users).set({ role: nextRole, fullName: nextName, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, current.id)).returning();
        return updated[0];
      }
      return current;
    }
    const assignedRole = isPrimaryAdmin ? "super_admin" : defaultRole;
    const inserted = await db.insert(users).values({
      uid,
      email: emailLower,
      fullName: fullName || emailLower.split("@")[0] || "Foodora User",
      role: assignedRole
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email: emailLower,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Failed to synchronize user account.", { cause: error });
  }
}
async function resolveUserFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const sandboxUser = verifySandboxToken(token);
  if (sandboxUser) {
    const dbUser2 = await getOrCreateUser(
      sandboxUser.uid,
      sandboxUser.email,
      sandboxUser.fullName,
      sandboxUser.role
    );
    return {
      uid: dbUser2.uid,
      email: dbUser2.email,
      fullName: dbUser2.fullName,
      role: dbUser2.role,
      isSandbox: sandboxUser.isSandbox
    };
  }
  const supaUser = await verifySupabaseAccessToken(token);
  if (!supaUser) return null;
  const dbUser = await getOrCreateUser(
    supaUser.uid,
    supaUser.email,
    supaUser.fullName,
    "customer"
  );
  return {
    uid: dbUser.uid,
    email: dbUser.email,
    fullName: dbUser.fullName,
    role: dbUser.role,
    isSandbox: false
  };
}
var optionalAuth = async (req, _res, next) => {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.warn("Optional auth token ignored:", err instanceof Error ? err.message : err);
  }
  next();
};
var requireAuth = async (req, res, next) => {
  try {
    const user = await resolveUserFromHeader(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid authentication token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role permissions" });
    }
    next();
  };
};

// src/lib/marketplace-logic.ts
function calculateCartItemUnitPrice(item) {
  const effectiveBase = item.discountPrice !== null && item.discountPrice !== void 0 && item.discountPrice > 0 ? item.discountPrice : item.basePrice;
  const variationCost = item.variationDelta ?? 0;
  const addonsCost = item.addons.reduce((sum, addon) => sum + Math.max(0, addon.price), 0);
  return Math.max(0, effectiveBase + variationCost + addonsCost);
}
function evaluateCoupon(coupon, subtotal, deliveryFee, restaurantId) {
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: "Coupon is inactive" };
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: "Coupon usage limit reached" };
  }
  if (coupon.restaurantId && coupon.restaurantId !== restaurantId) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: "Coupon not valid for this restaurant" };
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      discountAmount: 0,
      deliveryFeeAfterCoupon: deliveryFee,
      reason: `Minimum order of \u09F3${coupon.minOrder} required`
    };
  }
  if (coupon.type === "free_delivery") {
    return {
      valid: true,
      discountAmount: 0,
      deliveryFeeAfterCoupon: 0
    };
  }
  if (coupon.type === "fixed") {
    const discount2 = Math.min(subtotal, Math.max(0, coupon.value));
    return {
      valid: true,
      discountAmount: discount2,
      deliveryFeeAfterCoupon: deliveryFee
    };
  }
  const rawPct = Math.round(subtotal * coupon.value / 100);
  const capped = coupon.maxDiscount > 0 ? Math.min(rawPct, coupon.maxDiscount) : rawPct;
  const discount = Math.min(subtotal, Math.max(0, capped));
  return {
    valid: true,
    discountAmount: discount,
    deliveryFeeAfterCoupon: deliveryFee
  };
}
function calculateOrderFinancials(params) {
  const subtotal = Math.max(0, Math.round(params.subtotal));
  const discountAmount = Math.min(subtotal, Math.max(0, Math.round(params.discountAmount)));
  const netFoodRevenue = Math.max(0, subtotal - discountAmount);
  const deliveryFee = Math.max(0, Math.round(params.deliveryFee));
  const serviceFee = Math.max(0, Math.round(params.serviceFee));
  const taxAmount = Math.max(0, Math.round(params.taxAmount ?? 0));
  let platformCommission = 0;
  if (netFoodRevenue > 0) {
    if (params.commissionType === "fixed") {
      platformCommission = Math.min(netFoodRevenue, Math.max(0, Math.round(params.fixedCommission)));
    } else {
      platformCommission = Math.round(netFoodRevenue * Math.max(0, params.commissionRate) / 100);
    }
  }
  const restaurantEarnings = Math.max(0, netFoodRevenue - platformCommission);
  const totalPayable = netFoodRevenue + deliveryFee + serviceFee + taxAmount;
  return {
    subtotal,
    discountAmount,
    netFoodRevenue,
    deliveryFee,
    serviceFee,
    taxAmount,
    totalPayable,
    platformCommission,
    restaurantEarnings
  };
}
var VALID_TRANSITIONS = {
  confirmed: ["accepted", "preparing", "cancelled"],
  accepted: ["preparing", "ready", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["rider_assigned", "picked_up", "on_the_way", "delivered", "cancelled"],
  rider_assigned: ["picked_up", "on_the_way", "cancelled"],
  picked_up: ["on_the_way", "delivered"],
  on_the_way: ["delivered"],
  delivered: [],
  cancelled: []
};
function canTransitionOrderStatus(from, to) {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}
function estimateDeliveryFeeAndEta(distanceKm, baseFee, deliveryMode) {
  const extraKm = Math.max(0, distanceKm - 2);
  const modeSurcharge = deliveryMode === "third_party" ? 10 : 0;
  const fee = Math.round(baseFee + extraKm * 12 + modeSurcharge);
  const etaMinutes = Math.max(12, Math.round(14 + distanceKm * 5.5));
  return { fee, etaMinutes };
}
function mapOpenMeteoWeather(weatherCode, precipitationMm) {
  const hasPrecip = precipitationMm > 0.2;
  if (weatherCode >= 95) {
    return { labelEn: "Thunderstorm", labelBn: "\u09AC\u099C\u09CD\u09B0\u09AC\u09C3\u09B7\u09CD\u099F\u09BF", isRaining: true, rainBufferMin: 12 };
  }
  if (weatherCode >= 51 && weatherCode <= 82 || hasPrecip) {
    return { labelEn: "Rainy", labelBn: "\u09AC\u09C3\u09B7\u09CD\u099F\u09BF \u09B9\u099A\u09CD\u099B\u09C7", isRaining: true, rainBufferMin: 7 };
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return { labelEn: "Hazy / Fog", labelBn: "\u0995\u09C1\u09DF\u09BE\u09B6\u09BE\u099A\u09CD\u099B\u09A8\u09CD\u09A8", isRaining: false, rainBufferMin: 2 };
  }
  if (weatherCode >= 1 && weatherCode <= 3) {
    return { labelEn: "Partly Cloudy", labelBn: "\u0986\u0982\u09B6\u09BF\u0995 \u09AE\u09C7\u0998\u09B2\u09BE", isRaining: false, rainBufferMin: 0 };
  }
  return { labelEn: "Clear Sky", labelBn: "\u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0986\u0995\u09BE\u09B6", isRaining: false, rainBufferMin: 0 };
}
var PRIMARY_SUPER_ADMIN_EMAIL = "rakibraqkib@gmail.com";
function canActorModifyUserAccount(params) {
  const { actorUid, actorRole, targetUid, targetEmail, currentRole, nextRole, nextStatus } = params;
  if (actorRole !== "admin" && actorRole !== "super_admin") {
    return { allowed: false, reason: "Only authorized Admin accounts can modify user roles." };
  }
  if (targetEmail.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL) {
    if (nextRole !== "super_admin" || nextStatus === "suspended") {
      return {
        allowed: false,
        reason: "Primary Super Admin account is protected and cannot be demoted or suspended."
      };
    }
  }
  if (actorUid === targetUid && nextStatus === "suspended") {
    return { allowed: false, reason: "You cannot suspend your own active admin account." };
  }
  const touchesPrivilegedRole = currentRole === "super_admin" || currentRole === "admin" || nextRole === "super_admin" || nextRole === "admin";
  if (touchesPrivilegedRole && actorRole !== "super_admin") {
    return {
      allowed: false,
      reason: "Only Super Admin can grant or modify Admin and Super Admin privileges."
    };
  }
  return { allowed: true };
}
function validateBroadcastNotification(input) {
  const allowedTargets = [
    "all",
    "customer",
    "restaurant_owner",
    "rider",
    "admin"
  ];
  if (!allowedTargets.includes(input.targetRole)) {
    return { valid: false, reason: "Invalid broadcast target role." };
  }
  const title = input.title.trim();
  const message = input.message.trim();
  if (title.length < 3 || title.length > 120) {
    return { valid: false, reason: "Broadcast title must be between 3 and 120 characters." };
  }
  if (message.length < 5 || message.length > 500) {
    return { valid: false, reason: "Broadcast message must be between 5 and 500 characters." };
  }
  const type = input.type === "promo" || input.type === "order" ? input.type : "system";
  return {
    valid: true,
    targetRole: input.targetRole,
    title,
    message,
    type
  };
}

// src/services/delivery.ts
var FoodoraOwnRiderProvider = class {
  constructor() {
    this.name = "Foodora Express Rider";
    this.mode = "platform";
  }
  isConfigured() {
    return true;
  }
  async getQuote(order) {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(distanceKm, order.baseFee, "platform");
    return {
      provider: this.name,
      mode: "platform",
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: false
    };
  }
  async createDelivery(order) {
    return {
      provider: this.name,
      consignmentId: `FDR-${order.orderNumber}`,
      status: "awaiting_rider",
      isSandbox: false
    };
  }
  async trackDelivery(_consignmentId) {
    return { status: "on_the_way", updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  async cancelDelivery(_consignmentId) {
    return { cancelled: true };
  }
};
var RestaurantSelfDeliveryProvider = class {
  constructor() {
    this.name = "Restaurant Own Fleet";
    this.mode = "restaurant";
  }
  isConfigured() {
    return true;
  }
  async getQuote(order) {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(distanceKm, order.baseFee, "restaurant");
    return {
      provider: this.name,
      mode: "restaurant",
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: false
    };
  }
  async createDelivery(order) {
    return {
      provider: this.name,
      consignmentId: `RST-${order.orderNumber}`,
      status: "restaurant_dispatched",
      isSandbox: false
    };
  }
  async trackDelivery(_consignmentId) {
    return { status: "preparing", updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  async cancelDelivery(_consignmentId) {
    return { cancelled: true };
  }
};
var PathaoDeliveryProvider = class {
  constructor() {
    this.name = "Pathao Courier";
    this.mode = "third_party";
  }
  isConfigured() {
    return Boolean(
      process.env.PATHAO_CLIENT_ID && process.env.PATHAO_CLIENT_SECRET && process.env.PATHAO_USERNAME && process.env.PATHAO_PASSWORD
    );
  }
  async getQuote(order) {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(
      distanceKm,
      Math.max(55, order.baseFee),
      "third_party"
    );
    return {
      provider: this.name,
      mode: "third_party",
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: !this.isConfigured()
    };
  }
  async createDelivery(order) {
    const isLive = this.isConfigured() && process.env.PATHAO_SANDBOX !== "true";
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      provider: isLive ? "Pathao Courier" : "Pathao Courier (Sandbox)",
      consignmentId: `PT-BD-${suffix}`,
      status: "consignment_created",
      isSandbox: !isLive
    };
  }
  async trackDelivery(_consignmentId) {
    return { status: "picked_up", updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  async cancelDelivery(_consignmentId) {
    return { cancelled: true };
  }
};
function getDeliveryProvider(mode) {
  switch (mode) {
    case "third_party":
      return new PathaoDeliveryProvider();
    case "restaurant":
      return new RestaurantSelfDeliveryProvider();
    case "platform":
    default:
      return new FoodoraOwnRiderProvider();
  }
}

// src/services/free-apis.ts
var cache = /* @__PURE__ */ new Map();
function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function setCached(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
async function fetchDhakaWeather(lat, lng) {
  const key = `weather:${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FDhaka`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();
    const tempC = Math.round(data.current?.temperature_2m ?? 28);
    const precipitationMm = Number(data.current?.precipitation ?? 0);
    const weatherCode = Number(data.current?.weather_code ?? 0);
    const windKmh = Math.round(data.current?.wind_speed_10m ?? 8);
    const mapped = mapOpenMeteoWeather(weatherCode, precipitationMm);
    return setCached(
      key,
      {
        tempC,
        windKmh,
        precipitationMm,
        weatherCode,
        ...mapped,
        source: "Open-Meteo"
      },
      15 * 60 * 1e3
    );
  } catch {
    return {
      tempC: 28,
      windKmh: 9,
      precipitationMm: 0,
      weatherCode: 1,
      labelEn: "Clear Sky",
      labelBn: "\u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0986\u0995\u09BE\u09B6",
      isRaining: false,
      rainBufferMin: 0,
      source: "Fallback"
    };
  }
}
async function searchOsmPlaces(query) {
  const q = query.trim();
  if (!q) return [];
  const key = `osm-search:${q.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      `${q}, Dhaka, Bangladesh`
    )}&format=json&countrycodes=bd&limit=5`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FoodoraBD-Marketplace/1.0" },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const rows = await res.json();
    const mapped = rows.map((r) => ({
      displayName: r.display_name,
      shortName: r.display_name.split(",").slice(0, 2).join(", ").trim(),
      lat: Number(r.lat),
      lng: Number(r.lon)
    }));
    return setCached(key, mapped, 10 * 60 * 1e3);
  } catch {
    return [];
  }
}
async function reverseOsmGeocode(lat, lng) {
  const key = `osm-rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FoodoraBD-Marketplace/1.0" },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error(`Nominatim reverse HTTP ${res.status}`);
    const data = await res.json();
    const areaName = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || "Dhaka";
    const displayName = data.display_name || `${areaName}, Dhaka`;
    return setCached(key, { displayName, areaName, source: "OpenStreetMap" }, 10 * 60 * 1e3);
  } catch {
    return {
      displayName: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}, Dhaka`,
      areaName: "Dhaka",
      source: "Fallback"
    };
  }
}
async function fetchOsrmRoute(fromLat, fromLng, toLat, toLng) {
  const key = `osrm:${fromLat.toFixed(3)},${fromLng.toFixed(3)}->${toLat.toFixed(3)},${toLng.toFixed(3)}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) throw new Error("No OSRM route");
    const distanceKm = Math.round(route.distance / 1e3 * 100) / 100;
    const drivingMinutes = Math.max(5, Math.round(route.duration / 60));
    return setCached(key, { distanceKm, drivingMinutes, source: "OSRM" }, 5 * 60 * 1e3);
  } catch {
    const distanceKm = haversineDistanceKm(fromLat, fromLng, toLat, toLng);
    return {
      distanceKm,
      drivingMinutes: Math.max(6, Math.round(distanceKm * 4.2)),
      source: "Haversine"
    };
  }
}
async function fetchBdtExchangeRates() {
  const key = "fx:BDT";
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BDT", {
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = await res.json();
    const r = data.rates || {};
    return setCached(
      key,
      {
        base: "BDT",
        rates: {
          USD: Number(r.USD ?? 833e-5),
          EUR: Number(r.EUR ?? 77e-4),
          GBP: Number(r.GBP ?? 65e-4),
          SAR: Number(r.SAR ?? 0.0312)
        },
        updatedAt: data.time_last_update_utc || (/* @__PURE__ */ new Date()).toUTCString(),
        source: "ExchangeRate-API"
      },
      60 * 60 * 1e3
    );
  } catch {
    return {
      base: "BDT",
      rates: { USD: 833e-5, EUR: 77e-4, GBP: 65e-4, SAR: 0.0312 },
      updatedAt: (/* @__PURE__ */ new Date()).toUTCString(),
      source: "Fallback"
    };
  }
}
async function searchMealDbDishes(query) {
  const q = query.trim() || "biryani";
  const key = `mealdb:${q.toLowerCase()}`;
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) throw new Error(`MealDB HTTP ${res.status}`);
    const data = await res.json();
    const meals = (data.meals || []).slice(0, 6).map((m) => ({
      id: m.idMeal,
      name: m.strMeal,
      category: m.strCategory || "Main Course",
      cuisine: m.strArea || "International",
      instructions: (m.strInstructions || "").slice(0, 140).replace(/\s+/g, " ").trim(),
      thumbUrl: m.strMealThumb
    }));
    return setCached(key, meals, 30 * 60 * 1e3);
  } catch {
    return [];
  }
}

// src/services/payments.ts
import crypto2 from "node:crypto";
function getGatewayAvailability() {
  return {
    bkash: {
      configured: Boolean(process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET),
      sandbox: process.env.BKASH_SANDBOX !== "false"
    },
    sslcommerz: {
      configured: Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD),
      sandbox: process.env.SSLCOMMERZ_SANDBOX !== "false"
    },
    nagad: {
      configured: Boolean(process.env.NAGAD_MERCHANT_ID && process.env.NAGAD_PUBLIC_KEY),
      sandbox: true
    },
    cod: {
      configured: true,
      sandbox: false
    }
  };
}
function initiatePaymentSession(method, orderNumber, amountBdt) {
  const rand = crypto2.randomBytes(4).toString("hex").toUpperCase();
  if (method === "cod") {
    return {
      gateway: "cod",
      transactionId: `COD-${orderNumber}`,
      status: "pending",
      isSandbox: false,
      gatewayMessage: `Cash on Delivery confirmed for \u09F3${amountBdt}`
    };
  }
  const avail = getGatewayAvailability()[method];
  const prefix = method === "bkash" ? "BKS" : method === "nagad" ? "NGD" : "SSL";
  return {
    gateway: method,
    transactionId: `${prefix}-${rand}-${orderNumber.slice(-4)}`,
    status: "pending",
    isSandbox: !avail.configured || avail.sandbox,
    gatewayMessage: avail.configured ? `${method.toUpperCase()} payment session initialized` : `${method.toUpperCase()} Sandbox session initialized (configure live keys in server env for production)`
  };
}
function verifyPaymentServerSide(method, transactionId, expectedAmountBdt) {
  if (!transactionId || expectedAmountBdt <= 0) {
    return {
      verified: false,
      transactionId,
      gateway: method,
      isSandbox: true,
      message: "Invalid transaction ID or order amount"
    };
  }
  if (method === "cod") {
    return {
      verified: true,
      transactionId,
      gateway: "cod",
      isSandbox: false,
      message: "Cash on Delivery verified"
    };
  }
  const avail = getGatewayAvailability()[method];
  return {
    verified: true,
    transactionId,
    gateway: method,
    isSandbox: !avail.configured || avail.sandbox,
    message: avail.configured ? `Server-verified ${method.toUpperCase()} transaction ${transactionId}` : `Sandbox-verified ${method.toUpperCase()} transaction ${transactionId}`
  };
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PROJECT_ROOT = path.basename(__dirname) === "api" ? path.resolve(__dirname, "..") : __dirname;
var UPLOADS_DIR = process.env.VERCEL ? path.join("/tmp", "foodora-uploads") : path.resolve(PROJECT_ROOT, "public", "uploads");
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {
}
var app = express();
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/api", async (req, res, next) => {
  if (req.path === "/health" || req.path === "/export/project-zip") {
    return next();
  }
  if (!hasDatabaseConfig()) {
    return res.status(503).json({
      error: "Database is not configured. Please add DATABASE_URL in Vercel Environment Variables and redeploy."
    });
  }
  try {
    await ensureDatabaseSeeded();
  } catch (err) {
    console.error("Lazy database seed check failed:", err);
  }
  next();
});
async function settleOrderCommissionIdempotent(orderId) {
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(commissionLedger).where(
      and2(
        eq3(commissionLedger.orderId, orderId),
        eq3(commissionLedger.entryType, "commission_earned")
      )
    ).limit(1);
    if (existing.length > 0) {
      return;
    }
    const orderRows = await tx.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
    if (orderRows.length === 0) return;
    const order = orderRows[0];
    await tx.insert(commissionLedger).values({
      orderId: order.id,
      restaurantId: order.restaurantId,
      entryType: "commission_earned",
      grossAmount: Math.max(0, order.subtotal - order.discountAmount),
      commissionAmount: order.platformCommission,
      netRestaurantAmount: order.restaurantEarnings,
      deliveryFeeAmount: order.deliveryFee,
      note: `Commission (${order.commissionRate}%) settled for ${order.orderNumber}`
    });
  });
}
app.get("/api/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "foodora-bd",
    databaseConfigured: hasDatabaseConfig(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/public-config", async (_req, res) => {
  try {
    const settings = await getPlatformSettingsRow();
    res.json({
      mapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "",
      gateways: getGatewayAvailability(),
      settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load public config" });
  }
});
app.post("/api/auth/sync", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});
app.post("/api/auth/sandbox-session", async (req, res) => {
  const requestedRole = typeof req.body?.role === "string" ? req.body.role : "";
  if (requestedRole === "super_admin" || requestedRole === "admin") {
    return res.status(403).json({
      error: "Admin and Super Admin access is restricted. Please sign in with an authorized Admin account."
    });
  }
  const schema = z.object({
    role: z.enum(["customer", "restaurant_owner", "rider"])
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid demo workspace role" });
  }
  const personas = {
    customer: {
      uid: "demo-customer-uid",
      email: "customer@foodora.bd",
      fullName: "Rahim Uddin",
      role: "customer"
    },
    restaurant_owner: {
      uid: "demo-vendor-uid",
      email: "partner@sultansdine.bd",
      fullName: "Tariqul Islam (Sultan's Dine)",
      role: "restaurant_owner"
    },
    rider: {
      uid: "demo-rider-uid",
      email: "rider@foodora.bd",
      fullName: "Kamrul Hasan",
      role: "rider"
    }
  };
  const p = personas[parsed.data.role];
  const token = signSandboxToken(p);
  res.json({ token, user: { ...p, isSandbox: true } });
});
function hashPasswordScrypt(password) {
  const salt = crypto3.randomBytes(16).toString("hex");
  const hash = crypto3.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPasswordScrypt(password, stored) {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;
  const derived = crypto3.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return crypto3.timingSafeEqual(derived, storedBuf);
}
app.post("/api/auth/register", async (req, res) => {
  const schema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(128)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please provide a valid name, email, and password (min 6 chars)." });
  }
  const emailLower = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();
  try {
    const existingCred = await db.select({ uid: localCredentials.uid }).from(localCredentials).where(eq3(localCredentials.email, emailLower)).limit(1);
    if (existingCred.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
    }
    const existingUser = await db.select().from(users).where(eq3(users.email, emailLower)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in with Google or your existing credentials."
      });
    }
    const uid = `usr-${crypto3.randomBytes(8).toString("hex")}`;
    const role = emailLower === "rakibraqkib@gmail.com" ? "super_admin" : "customer";
    const passwordHash = hashPasswordScrypt(parsed.data.password);
    await db.insert(localCredentials).values({
      email: emailLower,
      uid,
      passwordHash
    });
    await db.insert(users).values({
      uid,
      email: emailLower,
      fullName,
      role
    });
    const token = signSandboxToken({ uid, email: emailLower, fullName, role, isSandbox: false });
    res.status(201).json({
      token,
      user: { uid, email: emailLower, fullName, role, isSandbox: false }
    });
  } catch (error) {
    console.error("Register failed:", error);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please enter a valid email and password." });
  }
  const emailLower = parsed.data.email.trim().toLowerCase();
  try {
    const credRows = await db.select().from(localCredentials).where(eq3(localCredentials.email, emailLower)).limit(1);
    if (credRows.length === 0) {
      return res.status(401).json({ error: "No account found with this email. Please create an account first." });
    }
    const { uid, passwordHash: storedHash } = credRows[0];
    if (!verifyPasswordScrypt(parsed.data.password, storedHash)) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }
    const userRows = await db.select().from(users).where(eq3(users.uid, uid)).limit(1);
    const dbUser = userRows[0];
    if (dbUser?.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended by an administrator." });
    }
    const role = dbUser?.role || (emailLower === "rakibraqkib@gmail.com" ? "super_admin" : "customer");
    const fullName = dbUser?.fullName || emailLower.split("@")[0];
    const token = signSandboxToken({ uid, email: emailLower, fullName, role, isSandbox: false });
    res.json({
      token,
      user: { uid, email: emailLower, fullName, role, isSandbox: false }
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: error.message || "Sign in failed" });
  }
});
app.get("/api/restaurants", async (_req, res) => {
  try {
    const list = await getApprovedRestaurants();
    res.json({ restaurants: list });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch restaurants" });
  }
});
app.get("/api/restaurants/:slug", async (req, res) => {
  try {
    const data = await getRestaurantBySlug(req.params.slug);
    if (!data) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch restaurant" });
  }
});
app.get("/api/coupons", async (_req, res) => {
  try {
    const list = await getActiveCoupons();
    res.json({ coupons: list });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch coupons" });
  }
});
app.post("/api/coupons/validate", async (req, res) => {
  const schema = z.object({
    code: z.string().min(2),
    subtotal: z.number().nonnegative(),
    deliveryFee: z.number().nonnegative(),
    restaurantId: z.number().int().positive()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid coupon request" });
  }
  try {
    const rows = await db.select().from(coupons).where(eq3(coupons.code, parsed.data.code.trim().toUpperCase())).limit(1);
    if (rows.length === 0) {
      return res.status(404).json({ valid: false, reason: "Coupon code not found" });
    }
    const c = rows[0];
    const result = evaluateCoupon(
      {
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount,
        restaurantId: c.restaurantId,
        isActive: c.isActive,
        usedCount: c.usedCount,
        usageLimit: c.usageLimit
      },
      parsed.data.subtotal,
      parsed.data.deliveryFee,
      parsed.data.restaurantId
    );
    res.json({ ...result, coupon: c });
  } catch (error) {
    res.status(500).json({ error: error.message || "Coupon check failed" });
  }
});
app.get("/api/free/weather", async (req, res) => {
  const lat = Number(req.query.lat) || 23.7949;
  const lng = Number(req.query.lng) || 90.4144;
  const weather = await fetchDhakaWeather(lat, lng);
  res.json({ weather });
});
app.get("/api/free/geocode", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ places: [] });
  const places = await searchOsmPlaces(q);
  res.json({ places });
});
app.get("/api/free/reverse-geocode", async (req, res) => {
  const lat = Number(req.query.lat) || 23.7949;
  const lng = Number(req.query.lng) || 90.4144;
  const result = await reverseOsmGeocode(lat, lng);
  res.json(result);
});
app.get("/api/free/route", async (req, res) => {
  const fromLat = Number(req.query.fromLat);
  const fromLng = Number(req.query.fromLng);
  const toLat = Number(req.query.toLat);
  const toLng = Number(req.query.toLng);
  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }
  const route = await fetchOsrmRoute(fromLat, fromLng, toLat, toLng);
  res.json({ route });
});
app.get("/api/free/rates", async (_req, res) => {
  const rates = await fetchBdtExchangeRates();
  res.json(rates);
});
app.get("/api/free/meals", async (req, res) => {
  const q = String(req.query.q || "biryani").trim();
  const meals = await searchMealDbDishes(q);
  res.json({ meals });
});
app.post("/api/delivery/quote", async (req, res) => {
  const schema = z.object({
    restaurantId: z.number().int().positive(),
    dropoffLat: z.number(),
    dropoffLng: z.number(),
    deliveryMode: z.enum(["platform", "restaurant", "third_party"])
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid delivery quote parameters" });
  }
  try {
    const rows = await db.select().from(restaurants).where(eq3(restaurants.id, parsed.data.restaurantId)).limit(1);
    if (rows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
    const rest = rows[0];
    const provider = getDeliveryProvider(parsed.data.deliveryMode);
    const [baseQuote, osrmRoute, weather] = await Promise.all([
      provider.getQuote({
        orderNumber: "QUOTE",
        restaurantName: rest.name,
        pickupAddress: rest.address,
        pickupLat: rest.lat,
        pickupLng: rest.lng,
        dropoffAddress: "Customer Pin",
        dropoffArea: rest.area,
        dropoffLat: parsed.data.dropoffLat,
        dropoffLng: parsed.data.dropoffLng,
        customerName: "Guest",
        customerPhone: "",
        baseFee: rest.deliveryFee,
        orderValue: 0
      }),
      fetchOsrmRoute(rest.lat, rest.lng, parsed.data.dropoffLat, parsed.data.dropoffLng),
      fetchDhakaWeather(parsed.data.dropoffLat, parsed.data.dropoffLng)
    ]);
    const baseFeeInput = parsed.data.deliveryMode === "third_party" ? Math.max(55, rest.deliveryFee) : rest.deliveryFee;
    const roadCalc = estimateDeliveryFeeAndEta(
      osrmRoute.distanceKm,
      baseFeeInput,
      parsed.data.deliveryMode
    );
    res.json({
      quote: {
        ...baseQuote,
        distanceKm: osrmRoute.distanceKm,
        fee: roadCalc.fee,
        etaMinutes: Math.max(12, osrmRoute.drivingMinutes + 12 + weather.rainBufferMin),
        routeSource: osrmRoute.source,
        rainBufferMin: weather.rainBufferMin,
        weatherLabel: weather.labelEn
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to compute delivery quote" });
  }
});
app.get("/api/customer/addresses", requireAuth, async (req, res) => {
  try {
    const addresses = await getCustomerAddresses(req.user.uid);
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/customer/addresses", requireAuth, async (req, res) => {
  const schema = z.object({
    label: z.string().min(1).max(60),
    area: z.string().min(2).max(60),
    addressLine: z.string().min(4).max(200),
    lat: z.number(),
    lng: z.number(),
    instructions: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please complete all required address fields" });
  }
  try {
    const inserted = await db.insert(customerAddresses).values({
      userUid: req.user.uid,
      label: parsed.data.label,
      area: parsed.data.area,
      addressLine: parsed.data.addressLine,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      instructions: parsed.data.instructions || "",
      isDefault: true
    }).returning();
    res.status(201).json({ address: inserted[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/customer/favorites", requireAuth, async (req, res) => {
  const list = await getCustomerFavorites(req.user.uid);
  res.json({ favorites: list });
});
app.post("/api/customer/favorites", requireAuth, async (req, res) => {
  const schema = z.object({ restaurantId: z.number().int().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid restaurantId" });
  try {
    const result = await toggleCustomerFavorite(req.user.uid, parsed.data.restaurantId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/customer/orders", requireAuth, async (req, res) => {
  try {
    const list = await getCustomerOrders(req.user.uid);
    res.json({ orders: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/orders/:id", optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid order ID" });
  }
  try {
    const detail = await getOrderById(id);
    if (!detail) return res.status(404).json({ error: "Order not found" });
    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/orders", requireAuth, async (req, res) => {
  const schema = z.object({
    restaurantId: z.number().int().positive(),
    customerName: z.string().min(2),
    customerPhone: z.string().min(6),
    deliveryAddress: z.string().min(5),
    deliveryArea: z.string().min(2),
    deliveryLat: z.number(),
    deliveryLng: z.number(),
    deliveryInstructions: z.string().optional(),
    deliveryMode: z.enum(["platform", "restaurant", "third_party"]),
    paymentMethod: z.enum(["bkash", "nagad", "sslcommerz", "cod"]),
    couponCode: z.string().optional(),
    items: z.array(
      z.object({
        foodItemId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(50),
        variationName: z.string().optional(),
        addons: z.array(z.string()).default([]),
        specialInstructions: z.string().optional()
      })
    ).min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid order payload", details: parsed.error.flatten() });
  }
  const input = parsed.data;
  try {
    const created = await db.transaction(async (tx) => {
      const restRows = await tx.select().from(restaurants).where(eq3(restaurants.id, input.restaurantId)).limit(1);
      if (restRows.length === 0) throw new Error("Restaurant not found");
      const rest = restRows[0];
      if (rest.status !== "approved" || !rest.isOpen) {
        throw new Error("This restaurant is currently unavailable for orders");
      }
      const dbMenu = await tx.select().from(foodItems).where(eq3(foodItems.restaurantId, rest.id));
      const snapshotItems = [];
      let subtotal = 0;
      for (const reqItem of input.items) {
        const found = dbMenu.find((m) => m.id === reqItem.foodItemId);
        if (!found) {
          throw new Error(`Menu item #${reqItem.foodItemId} does not belong to ${rest.name}`);
        }
        if (!found.inStock || !found.isAvailable) {
          throw new Error(`"${found.name}" is currently out of stock`);
        }
        const matchedVar = (found.variationsJson || []).find(
          (v) => v.name === reqItem.variationName
        );
        const selectedAddons = (found.addonsJson || []).filter(
          (a) => reqItem.addons.includes(a.name)
        );
        const unitPrice = calculateCartItemUnitPrice({
          basePrice: found.price,
          discountPrice: found.discountPrice,
          variationDelta: matchedVar?.priceDelta ?? 0,
          addons: selectedAddons
        });
        const lineTotal = unitPrice * reqItem.quantity;
        subtotal += lineTotal;
        snapshotItems.push({
          foodItemId: found.id,
          name: found.name,
          nameBn: found.nameBn,
          quantity: reqItem.quantity,
          unitPrice,
          variation: matchedVar?.name,
          addons: selectedAddons,
          specialInstructions: reqItem.specialInstructions,
          lineTotal
        });
      }
      if (subtotal < rest.minOrder) {
        throw new Error(`Minimum order for ${rest.name} is \u09F3${rest.minOrder}`);
      }
      const provider = getDeliveryProvider(input.deliveryMode);
      const quote = await provider.getQuote({
        orderNumber: "NEW",
        restaurantName: rest.name,
        pickupAddress: rest.address,
        pickupLat: rest.lat,
        pickupLng: rest.lng,
        dropoffAddress: input.deliveryAddress,
        dropoffArea: input.deliveryArea,
        dropoffLat: input.deliveryLat,
        dropoffLng: input.deliveryLng,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        baseFee: rest.deliveryFee,
        orderValue: subtotal
      });
      let discountAmount = 0;
      let deliveryFeeAfterCoupon = quote.fee;
      let appliedCouponCode = "";
      if (input.couponCode && input.couponCode.trim()) {
        const cRows = await tx.select().from(coupons).where(eq3(coupons.code, input.couponCode.trim().toUpperCase())).limit(1);
        if (cRows.length > 0) {
          const c = cRows[0];
          const evalRes = evaluateCoupon(
            {
              code: c.code,
              type: c.type,
              value: c.value,
              minOrder: c.minOrder,
              maxDiscount: c.maxDiscount,
              restaurantId: c.restaurantId,
              isActive: c.isActive,
              usedCount: c.usedCount,
              usageLimit: c.usageLimit
            },
            subtotal,
            quote.fee,
            rest.id
          );
          if (evalRes.valid) {
            discountAmount = evalRes.discountAmount;
            deliveryFeeAfterCoupon = evalRes.deliveryFeeAfterCoupon;
            appliedCouponCode = c.code;
            await tx.update(coupons).set({ usedCount: sql3`${coupons.usedCount} + 1` }).where(eq3(coupons.id, c.id));
          }
        }
      }
      const settings = await tx.select().from(platformSettings).limit(1);
      const serviceFee = settings[0]?.serviceFee ?? 10;
      const financials = calculateOrderFinancials({
        subtotal,
        discountAmount,
        deliveryFee: deliveryFeeAfterCoupon,
        serviceFee,
        commissionType: rest.commissionType || "percentage",
        commissionRate: Number(rest.commissionRate) || 15,
        fixedCommission: rest.fixedCommission || 0
      });
      const orderNumber = `FD-BD-${Math.floor(1e4 + Math.random() * 89999)}`;
      const paymentInit = initiatePaymentSession(
        input.paymentMethod,
        orderNumber,
        financials.totalPayable
      );
      const deliveryDispatch = await provider.createDelivery({
        orderNumber,
        restaurantName: rest.name,
        pickupAddress: rest.address,
        pickupLat: rest.lat,
        pickupLng: rest.lng,
        dropoffAddress: input.deliveryAddress,
        dropoffArea: input.deliveryArea,
        dropoffLat: input.deliveryLat,
        dropoffLng: input.deliveryLng,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        baseFee: deliveryFeeAfterCoupon,
        orderValue: financials.totalPayable
      });
      const insertedOrders = await tx.insert(orders).values({
        orderNumber,
        customerUid: req.user.uid,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        restaurantId: rest.id,
        restaurantName: rest.name,
        deliveryAddress: input.deliveryAddress,
        deliveryArea: input.deliveryArea,
        deliveryLat: input.deliveryLat,
        deliveryLng: input.deliveryLng,
        deliveryInstructions: input.deliveryInstructions || "",
        deliveryMode: input.deliveryMode,
        deliveryProvider: deliveryDispatch.provider,
        consignmentId: deliveryDispatch.consignmentId,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
        paymentTxId: paymentInit.transactionId,
        subtotal: financials.subtotal,
        discountAmount: financials.discountAmount,
        couponCode: appliedCouponCode,
        deliveryFee: financials.deliveryFee,
        serviceFee: financials.serviceFee,
        taxAmount: financials.taxAmount,
        totalAmount: financials.totalPayable,
        commissionRate: rest.commissionRate,
        platformCommission: financials.platformCommission,
        restaurantEarnings: financials.restaurantEarnings,
        status: "confirmed",
        estimatedMinutes: quote.etaMinutes,
        itemsSnapshotJson: snapshotItems
      }).returning();
      const newOrder = insertedOrders[0];
      await tx.insert(orderStatusHistory).values({
        orderId: newOrder.id,
        status: "confirmed",
        note: `Order placed via ${input.paymentMethod.toUpperCase()} (${deliveryDispatch.provider})`,
        actorUid: req.user.uid
      });
      await tx.insert(notifications).values([
        {
          recipientUid: rest.ownerUid,
          roleTarget: "restaurant_owner",
          title: `New Order ${newOrder.orderNumber}`,
          message: `\u09F3${newOrder.totalAmount} order from ${input.customerName} (${input.deliveryArea})`,
          type: "order",
          relatedOrderId: newOrder.id
        },
        {
          recipientUid: req.user.uid,
          roleTarget: "customer",
          title: `Order ${newOrder.orderNumber} Confirmed`,
          message: `Your order from ${rest.name} has been received.`,
          type: "order",
          relatedOrderId: newOrder.id
        }
      ]);
      return { order: newOrder, paymentSession: paymentInit, deliveryDispatch };
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(400).json({ error: error.message || "Could not place order" });
  }
});
app.post("/api/payments/verify", requireAuth, async (req, res) => {
  const schema = z.object({
    orderId: z.number().int().positive(),
    transactionId: z.string().min(3)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid verification payload" });
  try {
    const orderRows = await db.select().from(orders).where(eq3(orders.id, parsed.data.orderId)).limit(1);
    if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
    const order = orderRows[0];
    if (order.paymentStatus === "paid") {
      return res.json({ verified: true, order, message: "Payment already verified" });
    }
    const verification = verifyPaymentServerSide(
      order.paymentMethod,
      parsed.data.transactionId,
      order.totalAmount
    );
    if (!verification.verified) {
      return res.status(400).json({ error: verification.message });
    }
    const updated = await db.update(orders).set({
      paymentStatus: "paid",
      paymentTxId: verification.transactionId,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(orders.id, order.id)).returning();
    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: order.status,
      note: verification.message,
      actorUid: req.user.uid
    });
    res.json({ verified: true, order: updated[0], message: verification.message });
  } catch (error) {
    res.status(500).json({ error: error.message || "Payment verification failed" });
  }
});
app.post("/api/reviews", requireAuth, async (req, res) => {
  const schema = z.object({
    restaurantId: z.number().int().positive(),
    orderId: z.number().int().positive().optional(),
    rating: z.number().int().min(1).max(5),
    foodRating: z.number().int().min(1).max(5),
    comment: z.string().min(2).max(500)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please write a short review and rating" });
  try {
    const inserted = await db.insert(reviews).values({
      restaurantId: parsed.data.restaurantId,
      orderId: parsed.data.orderId ?? null,
      customerUid: req.user.uid,
      customerName: req.user.fullName,
      rating: parsed.data.rating,
      foodRating: parsed.data.foodRating,
      comment: parsed.data.comment
    }).returning();
    const allReviews = await db.select().from(reviews).where(eq3(reviews.restaurantId, parsed.data.restaurantId));
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, allReviews.length);
    await db.update(restaurants).set({
      rating: avg.toFixed(1),
      reviewCount: sql3`${restaurants.reviewCount} + 1`
    }).where(eq3(restaurants.id, parsed.data.restaurantId));
    res.status(201).json({ review: inserted[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/restaurants/register", requireAuth, async (req, res) => {
  const schema = z.object({
    ownerName: z.string().min(2),
    name: z.string().min(2),
    nameBn: z.string().min(2),
    cuisine: z.string().min(2),
    area: z.string().min(2),
    address: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    phone: z.string().min(6),
    email: z.string().email(),
    description: z.string().min(5),
    tradeLicense: z.string().min(3),
    nidNumber: z.string().min(5),
    payoutMethod: z.enum(["bkash", "nagad", "bank"]),
    payoutAccount: z.string().min(5),
    deliveryFee: z.number().int().min(0).max(300).default(49),
    minOrder: z.number().int().min(50).max(5e3).default(150),
    deliveryMode: z.enum(["platform", "restaurant", "third_party"]).default("platform")
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please complete all restaurant onboarding fields" });
  }
  try {
    const slugBase = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
    const inserted = await db.insert(restaurants).values({
      ownerUid: req.user.uid,
      name: parsed.data.name,
      nameBn: parsed.data.nameBn,
      slug,
      description: parsed.data.description,
      cuisine: parsed.data.cuisine,
      area: parsed.data.area,
      address: parsed.data.address,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      phone: parsed.data.phone,
      email: parsed.data.email,
      coverUrl: IMG_BANGLA,
      tradeLicense: parsed.data.tradeLicense,
      nidNumber: parsed.data.nidNumber,
      payoutMethod: parsed.data.payoutMethod,
      payoutAccount: parsed.data.payoutAccount,
      deliveryFee: parsed.data.deliveryFee,
      minOrder: parsed.data.minOrder,
      deliveryMode: parsed.data.deliveryMode,
      isNew: true,
      status: "pending"
    }).returning();
    if (req.user.role === "customer") {
      await db.update(users).set({ role: "restaurant_owner", fullName: parsed.data.ownerName }).where(eq3(users.uid, req.user.uid));
    }
    await db.insert(notifications).values({
      recipientUid: "demo-admin-uid",
      roleTarget: "super_admin",
      title: "New Restaurant Application",
      message: `${parsed.data.name} (${parsed.data.area}) submitted documents for approval.`,
      type: "approval"
    });
    res.status(201).json({ restaurant: inserted[0] });
  } catch (error) {
    console.error("Restaurant registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register restaurant" });
  }
});
app.get(
  "/api/vendor/workspace",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const isSuperAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      const data = await getVendorWorkspace(req.user.uid, isSuperAdmin);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/vendor/menu",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      restaurantId: z.number().int().positive(),
      category: z.string().min(2),
      name: z.string().min(2),
      nameBn: z.string().min(2),
      description: z.string().default(""),
      imageUrl: z.string().default(IMG_BANGLA),
      price: z.number().int().positive(),
      discountPrice: z.number().int().positive().nullable().optional(),
      isPopular: z.boolean().default(false)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid food item details" });
    try {
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, parsed.data.restaurantId)).limit(1);
      if (restRows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && restRows[0].ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden: Not owner of this restaurant" });
      }
      const inserted = await db.insert(foodItems).values({
        restaurantId: parsed.data.restaurantId,
        category: parsed.data.category,
        name: parsed.data.name,
        nameBn: parsed.data.nameBn,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl || restRows[0].coverUrl,
        price: parsed.data.price,
        discountPrice: parsed.data.discountPrice ?? null,
        variationsJson: [{ name: "Regular", priceDelta: 0 }],
        addonsJson: [],
        isPopular: parsed.data.isPopular
      }).returning();
      res.status(201).json({ item: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/vendor/menu/:id",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId)) return res.status(400).json({ error: "Invalid item ID" });
    try {
      const itemRows = await db.select().from(foodItems).where(eq3(foodItems.id, itemId)).limit(1);
      if (itemRows.length === 0) return res.status(404).json({ error: "Food item not found" });
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, itemRows[0].restaurantId)).limit(1);
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && restRows[0]?.ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await db.update(foodItems).set({
        category: typeof req.body.category === "string" && req.body.category.trim() ? req.body.category.trim() : itemRows[0].category,
        name: typeof req.body.name === "string" && req.body.name.trim() ? req.body.name.trim() : itemRows[0].name,
        nameBn: typeof req.body.nameBn === "string" && req.body.nameBn.trim() ? req.body.nameBn.trim() : itemRows[0].nameBn,
        description: typeof req.body.description === "string" ? req.body.description : itemRows[0].description,
        imageUrl: typeof req.body.imageUrl === "string" && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : itemRows[0].imageUrl,
        inStock: req.body.inStock ?? itemRows[0].inStock,
        isAvailable: req.body.isAvailable ?? itemRows[0].isAvailable,
        isPopular: req.body.isPopular ?? itemRows[0].isPopular,
        price: typeof req.body.price === "number" && req.body.price > 0 ? req.body.price : itemRows[0].price,
        discountPrice: req.body.discountPrice === null ? null : typeof req.body.discountPrice === "number" && req.body.discountPrice > 0 ? req.body.discountPrice : itemRows[0].discountPrice,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(foodItems.id, itemId)).returning();
      res.json({ item: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.delete(
  "/api/vendor/menu/:id",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId)) return res.status(400).json({ error: "Invalid item ID" });
    try {
      const itemRows = await db.select().from(foodItems).where(eq3(foodItems.id, itemId)).limit(1);
      if (itemRows.length === 0) return res.status(404).json({ error: "Item not found" });
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, itemRows[0].restaurantId)).limit(1);
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && restRows[0]?.ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await db.delete(foodItems).where(eq3(foodItems.id, itemId));
      res.json({ deleted: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/vendor/restaurant",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      restaurantId: z.number().int().positive(),
      isOpen: z.boolean().optional(),
      openingHours: z.string().optional(),
      deliveryFee: z.number().int().min(0).max(500).optional(),
      minOrder: z.number().int().min(0).max(5e3).optional(),
      deliveryMode: z.enum(["platform", "restaurant", "third_party"]).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid restaurant settings" });
    try {
      const rows = await db.select().from(restaurants).where(eq3(restaurants.id, parsed.data.restaurantId)).limit(1);
      if (rows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && rows[0].ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await db.update(restaurants).set({
        isOpen: parsed.data.isOpen ?? rows[0].isOpen,
        openingHours: parsed.data.openingHours ?? rows[0].openingHours,
        deliveryFee: parsed.data.deliveryFee ?? rows[0].deliveryFee,
        minOrder: parsed.data.minOrder ?? rows[0].minOrder,
        deliveryMode: parsed.data.deliveryMode ?? rows[0].deliveryMode,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(restaurants.id, rows[0].id)).returning();
      res.json({ restaurant: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/vendor/orders/:id/status",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const orderId = Number(req.params.id);
    const schema = z.object({
      status: z.enum(["accepted", "preparing", "ready", "on_the_way", "delivered", "cancelled"]),
      note: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!Number.isInteger(orderId) || !parsed.success) {
      return res.status(400).json({ error: "Invalid status update" });
    }
    try {
      const orderRows = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
      if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
      const order = orderRows[0];
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, order.restaurantId)).limit(1);
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && restRows[0]?.ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden: Order belongs to another restaurant" });
      }
      if (!canTransitionOrderStatus(order.status, parsed.data.status)) {
        return res.status(400).json({
          error: `Cannot transition order from ${order.status} to ${parsed.data.status}`
        });
      }
      const updated = await db.update(orders).set({
        status: parsed.data.status,
        cancelReason: parsed.data.status === "cancelled" ? parsed.data.note || "Cancelled by restaurant" : order.cancelReason,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(orders.id, order.id)).returning();
      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: parsed.data.status,
        note: parsed.data.note || `Updated to ${parsed.data.status}`,
        actorUid: req.user.uid
      });
      if (parsed.data.status === "delivered") {
        await settleOrderCommissionIdempotent(order.id);
      }
      await db.insert(notifications).values({
        recipientUid: order.customerUid,
        roleTarget: "customer",
        title: `Order ${order.orderNumber}: ${parsed.data.status.replace("_", " ")}`,
        message: parsed.data.note || `${order.restaurantName} updated your order status.`,
        type: "order",
        relatedOrderId: order.id
      });
      res.json({ order: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/vendor/payouts",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      restaurantId: z.number().int().positive(),
      amount: z.number().int().positive()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payout request" });
    try {
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, parsed.data.restaurantId)).limit(1);
      if (restRows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
      const rest = restRows[0];
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && rest.ownerUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const inserted = await db.insert(restaurantPayouts).values({
        restaurantId: rest.id,
        restaurantName: rest.name,
        amount: parsed.data.amount,
        method: rest.payoutMethod,
        accountNumber: rest.payoutAccount || rest.phone,
        status: "pending"
      }).returning();
      res.status(201).json({ payout: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post("/api/riders/register", requireAuth, async (req, res) => {
  const schema = z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email(),
    vehicleType: z.enum(["Motorbike", "Bicycle", "Scooter"]),
    zone: z.string().min(2),
    nidNumber: z.string().min(5)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid rider registration data" });
  try {
    const inserted = await db.insert(riders).values({
      uid: req.user.uid,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      vehicleType: parsed.data.vehicleType,
      zone: parsed.data.zone,
      nidNumber: parsed.data.nidNumber,
      status: "approved"
    }).onConflictDoUpdate({
      target: riders.uid,
      set: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        vehicleType: parsed.data.vehicleType,
        zone: parsed.data.zone
      }
    }).returning();
    if (req.user.role === "customer") {
      await db.update(users).set({ role: "rider" }).where(eq3(users.uid, req.user.uid));
    }
    res.status(201).json({ rider: inserted[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get(
  "/api/rider/workspace",
  requireAuth,
  requireRole(["rider", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const targetUid = req.user.role === "super_admin" || req.user.role === "admin" ? "demo-rider-uid" : req.user.uid;
      const data = await getRiderWorkspace(targetUid);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/rider/location",
  requireAuth,
  requireRole(["rider", "admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      isAvailable: z.boolean().optional(),
      zone: z.string().min(2).max(100).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Valid GPS latitude and longitude required." });
    }
    try {
      const riderUid = req.user.role === "super_admin" || req.user.role === "admin" ? "demo-rider-uid" : req.user.uid;
      const existing = await db.select().from(riders).where(eq3(riders.uid, riderUid)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Rider profile not found." });
      }
      const cur = existing[0];
      const updated = await db.update(riders).set({
        currentLat: Math.round(parsed.data.lat * 1e6) / 1e6,
        currentLng: Math.round(parsed.data.lng * 1e6) / 1e6,
        locationUpdatedAt: /* @__PURE__ */ new Date(),
        isAvailable: typeof parsed.data.isAvailable === "boolean" ? parsed.data.isAvailable : cur.isAvailable,
        zone: parsed.data.zone ? parsed.data.zone.trim() : cur.zone
      }).where(eq3(riders.uid, riderUid)).returning();
      res.json({ rider: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/rider/orders/:id/accept",
  requireAuth,
  requireRole(["rider", "admin", "super_admin"]),
  async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId)) return res.status(400).json({ error: "Invalid order ID" });
    try {
      const riderUid = req.user.role === "super_admin" || req.user.role === "admin" ? "demo-rider-uid" : req.user.uid;
      const orderRows = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
      if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
      const existingOrder = orderRows[0];
      if (["delivered", "cancelled"].includes(existingOrder.status)) {
        return res.status(409).json({ error: "Order is already closed and cannot be claimed." });
      }
      if (existingOrder.riderUid && existingOrder.riderUid !== riderUid) {
        return res.status(409).json({ error: "Order has already been claimed by another rider." });
      }
      const riderRows = await db.select().from(riders).where(eq3(riders.uid, riderUid)).limit(1);
      const riderName = riderRows[0]?.fullName || req.user.fullName;
      const updated = await db.update(orders).set({
        riderUid,
        riderName,
        status: "rider_assigned",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(orders.id, orderId)).returning();
      await db.insert(orderStatusHistory).values({
        orderId,
        status: "rider_assigned",
        note: `Rider ${riderName} accepted delivery assignment`,
        actorUid: riderUid
      });
      await db.insert(notifications).values({
        recipientUid: existingOrder.customerUid,
        roleTarget: "customer",
        title: "Rider Assigned to Your Order",
        message: `${riderName} is assigned for ${existingOrder.orderNumber}. Track live rider GPS on your map.`,
        type: "order",
        relatedOrderId: existingOrder.id
      });
      res.json({ order: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/rider/orders/:id/status",
  requireAuth,
  requireRole(["rider", "admin", "super_admin"]),
  async (req, res) => {
    const orderId = Number(req.params.id);
    const schema = z.object({
      status: z.enum(["picked_up", "on_the_way", "delivered"])
    });
    const parsed = schema.safeParse(req.body);
    if (!Number.isInteger(orderId) || !parsed.success) {
      return res.status(400).json({ error: "Invalid rider status update" });
    }
    try {
      const orderRows = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
      if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
      const order = orderRows[0];
      const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";
      if (!isAdmin && order.riderUid !== req.user.uid) {
        return res.status(403).json({ error: "Forbidden: Order is assigned to another rider" });
      }
      if (!canTransitionOrderStatus(order.status, parsed.data.status)) {
        return res.status(400).json({ error: `Cannot change order from ${order.status} to ${parsed.data.status}` });
      }
      const updated = await db.update(orders).set({
        status: parsed.data.status,
        paymentStatus: parsed.data.status === "delivered" && order.paymentMethod === "cod" ? "paid" : order.paymentStatus,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(orders.id, order.id)).returning();
      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: parsed.data.status,
        note: `Rider updated status to ${parsed.data.status.replace(/_/g, " ")}`,
        actorUid: req.user.uid
      });
      const statusLabels = {
        picked_up: "Order Picked Up",
        on_the_way: "Rider Is On The Way",
        delivered: "Order Delivered!"
      };
      await db.insert(notifications).values({
        recipientUid: order.customerUid,
        roleTarget: "customer",
        title: statusLabels[parsed.data.status] || "Delivery Update",
        message: `${order.orderNumber} (${order.restaurantName}) is now ${parsed.data.status.replace(/_/g, " ")}.`,
        type: "order",
        relatedOrderId: order.id
      });
      if (parsed.data.status === "delivered") {
        await settleOrderCommissionIdempotent(order.id);
        if (order.riderUid) {
          await db.update(riders).set({
            totalDeliveries: sql3`${riders.totalDeliveries} + 1`,
            totalEarnings: sql3`${riders.totalEarnings} + ${Math.max(40, order.deliveryFee)}`
          }).where(eq3(riders.uid, order.riderUid));
        }
      }
      res.json({ order: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/upload-image",
  requireAuth,
  requireRole(["restaurant_owner", "admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      dataUrl: z.string().min(20),
      filename: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid image upload payload" });
    }
    const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(
      parsed.data.dataUrl.trim()
    );
    if (!match) {
      return res.status(400).json({ error: "Only PNG, JPG, WEBP, or GIF images are supported" });
    }
    try {
      const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.byteLength > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image must be 5 MB or smaller" });
      }
      const safeStem = (parsed.data.filename || "food").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 32) || "food";
      const outName = `${safeStem}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      if (process.env.VERCEL) {
        return res.status(201).json({ imageUrl: parsed.data.dataUrl.trim() });
      }
      const outPath = path.join(UPLOADS_DIR, outName);
      await fs.promises.writeFile(outPath, buffer);
      res.status(201).json({ imageUrl: `/uploads/${outName}` });
    } catch (error) {
      res.status(500).json({ error: error.message || "Image upload failed" });
    }
  }
);
app.get(
  "/api/admin/workspace",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (_req, res) => {
    try {
      const data = await getAdminWorkspace();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/admin/restaurants",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      nameBn: z.string().min(1),
      cuisine: z.string().min(2),
      area: z.string().min(2),
      address: z.string().min(3),
      phone: z.string().default("+8801710000000"),
      email: z.string().email().default("partner@foodora.bd"),
      description: z.string().default(""),
      coverUrl: z.string().default(IMG_BANGLA),
      deliveryFee: z.number().int().min(0).max(500).default(49),
      minOrder: z.number().int().min(0).max(1e4).default(150),
      discountPct: z.number().int().min(0).max(90).default(0),
      openingHours: z.string().default("10:00 AM - 11:30 PM"),
      deliveryMode: z.enum(["platform", "restaurant", "third_party"]).default("platform"),
      commissionRate: z.string().default("15.00"),
      subscriptionPlan: z.enum(["free", "basic", "premium", "enterprise"]).default("basic"),
      isSponsored: z.boolean().default(false)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid restaurant creation payload" });
    }
    try {
      const slugBase = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
      const inserted = await db.insert(restaurants).values({
        ownerUid: req.user.uid,
        name: parsed.data.name,
        nameBn: parsed.data.nameBn,
        slug,
        description: parsed.data.description || `${parsed.data.name} in ${parsed.data.area}, Dhaka.`,
        cuisine: parsed.data.cuisine,
        area: parsed.data.area,
        address: parsed.data.address,
        lat: 23.7937,
        lng: 90.4066,
        phone: parsed.data.phone,
        email: parsed.data.email,
        coverUrl: parsed.data.coverUrl || IMG_BANGLA,
        deliveryFee: parsed.data.deliveryFee,
        minOrder: parsed.data.minOrder,
        discountPct: parsed.data.discountPct,
        openingHours: parsed.data.openingHours,
        deliveryMode: parsed.data.deliveryMode,
        commissionRate: parsed.data.commissionRate,
        subscriptionPlan: parsed.data.subscriptionPlan,
        isSponsored: parsed.data.isSponsored,
        isNew: true,
        isOpen: true,
        status: "approved"
      }).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "restaurant_created",
        targetType: "restaurant",
        targetId: String(inserted[0].id),
        details: JSON.stringify({ name: inserted[0].name, area: inserted[0].area })
      });
      res.status(201).json({ restaurant: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/restaurants/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid restaurant ID" });
    const schema = z.object({
      name: z.string().min(2).optional(),
      nameBn: z.string().min(1).optional(),
      cuisine: z.string().min(2).optional(),
      area: z.string().min(2).optional(),
      address: z.string().min(3).optional(),
      description: z.string().optional(),
      coverUrl: z.string().optional(),
      deliveryFee: z.number().int().min(0).max(500).optional(),
      minOrder: z.number().int().min(0).max(1e4).optional(),
      discountPct: z.number().int().min(0).max(90).optional(),
      openingHours: z.string().optional(),
      deliveryMode: z.enum(["platform", "restaurant", "third_party"]).optional(),
      isOpen: z.boolean().optional(),
      status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
      commissionRate: z.string().optional(),
      commissionType: z.enum(["percentage", "fixed"]).optional(),
      fixedCommission: z.number().int().min(0).optional(),
      subscriptionPlan: z.enum(["free", "basic", "premium", "enterprise"]).optional(),
      isSponsored: z.boolean().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid admin restaurant update" });
    try {
      const rows = await db.select().from(restaurants).where(eq3(restaurants.id, id)).limit(1);
      if (rows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
      const current = rows[0];
      const updated = await db.update(restaurants).set({
        name: parsed.data.name ?? current.name,
        nameBn: parsed.data.nameBn ?? current.nameBn,
        cuisine: parsed.data.cuisine ?? current.cuisine,
        area: parsed.data.area ?? current.area,
        address: parsed.data.address ?? current.address,
        description: parsed.data.description ?? current.description,
        coverUrl: parsed.data.coverUrl || current.coverUrl,
        deliveryFee: parsed.data.deliveryFee ?? current.deliveryFee,
        minOrder: parsed.data.minOrder ?? current.minOrder,
        discountPct: parsed.data.discountPct ?? current.discountPct,
        openingHours: parsed.data.openingHours ?? current.openingHours,
        deliveryMode: parsed.data.deliveryMode ?? current.deliveryMode,
        isOpen: parsed.data.isOpen ?? current.isOpen,
        status: parsed.data.status ?? current.status,
        commissionRate: parsed.data.commissionRate ?? current.commissionRate,
        commissionType: parsed.data.commissionType ?? current.commissionType,
        fixedCommission: parsed.data.fixedCommission ?? current.fixedCommission,
        subscriptionPlan: parsed.data.subscriptionPlan ?? current.subscriptionPlan,
        isSponsored: parsed.data.isSponsored ?? current.isSponsored,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(restaurants.id, id)).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: `restaurant_update_${parsed.data.status || "config"}`,
        targetType: "restaurant",
        targetId: String(id),
        details: JSON.stringify(parsed.data)
      });
      res.json({ restaurant: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/admin/products",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      restaurantId: z.number().int().positive(),
      category: z.string().min(2),
      name: z.string().min(2),
      nameBn: z.string().min(1),
      description: z.string().default(""),
      imageUrl: z.string().default(IMG_BANGLA),
      price: z.number().int().positive(),
      discountPrice: z.number().int().positive().nullable().optional(),
      inStock: z.boolean().default(true),
      isAvailable: z.boolean().default(true),
      isPopular: z.boolean().default(false),
      variationsJson: z.array(z.object({ name: z.string(), priceDelta: z.number() })).optional(),
      addonsJson: z.array(z.object({ name: z.string(), price: z.number() })).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid product payload" });
    try {
      const restRows = await db.select().from(restaurants).where(eq3(restaurants.id, parsed.data.restaurantId)).limit(1);
      if (restRows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
      const inserted = await db.insert(foodItems).values({
        restaurantId: parsed.data.restaurantId,
        category: parsed.data.category.trim(),
        name: parsed.data.name.trim(),
        nameBn: parsed.data.nameBn.trim(),
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl.trim() || restRows[0].coverUrl || IMG_BANGLA,
        price: parsed.data.price,
        discountPrice: parsed.data.discountPrice ?? null,
        inStock: parsed.data.inStock,
        isAvailable: parsed.data.isAvailable,
        isPopular: parsed.data.isPopular,
        variationsJson: parsed.data.variationsJson && parsed.data.variationsJson.length > 0 ? parsed.data.variationsJson : [{ name: "Regular", priceDelta: 0 }],
        addonsJson: parsed.data.addonsJson ?? []
      }).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "product_created",
        targetType: "food_item",
        targetId: String(inserted[0].id),
        details: JSON.stringify({ name: inserted[0].name, restaurantId: inserted[0].restaurantId })
      });
      res.status(201).json({ product: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/products/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid product ID" });
    const schema = z.object({
      restaurantId: z.number().int().positive().optional(),
      category: z.string().min(2).optional(),
      name: z.string().min(2).optional(),
      nameBn: z.string().min(1).optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      price: z.number().int().positive().optional(),
      discountPrice: z.number().int().positive().nullable().optional(),
      inStock: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      isPopular: z.boolean().optional(),
      variationsJson: z.array(z.object({ name: z.string(), priceDelta: z.number() })).optional(),
      addonsJson: z.array(z.object({ name: z.string(), price: z.number() })).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid product update payload" });
    try {
      const existing = await db.select().from(foodItems).where(eq3(foodItems.id, id)).limit(1);
      if (existing.length === 0) return res.status(404).json({ error: "Product not found" });
      const cur = existing[0];
      const updated = await db.update(foodItems).set({
        restaurantId: parsed.data.restaurantId ?? cur.restaurantId,
        category: parsed.data.category?.trim() || cur.category,
        name: parsed.data.name?.trim() || cur.name,
        nameBn: parsed.data.nameBn?.trim() || cur.nameBn,
        description: parsed.data.description ?? cur.description,
        imageUrl: parsed.data.imageUrl?.trim() || cur.imageUrl,
        price: parsed.data.price ?? cur.price,
        discountPrice: parsed.data.discountPrice === void 0 ? cur.discountPrice : parsed.data.discountPrice,
        inStock: parsed.data.inStock ?? cur.inStock,
        isAvailable: parsed.data.isAvailable ?? cur.isAvailable,
        isPopular: parsed.data.isPopular ?? cur.isPopular,
        variationsJson: parsed.data.variationsJson ?? cur.variationsJson,
        addonsJson: parsed.data.addonsJson ?? cur.addonsJson,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(foodItems.id, id)).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "product_updated",
        targetType: "food_item",
        targetId: String(id),
        details: JSON.stringify({ name: updated[0].name, price: updated[0].price })
      });
      res.json({ product: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.delete(
  "/api/admin/products/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid product ID" });
    try {
      const deleted = await db.delete(foodItems).where(eq3(foodItems.id, id)).returning();
      if (deleted.length === 0) return res.status(404).json({ error: "Product not found" });
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "product_deleted",
        targetType: "food_item",
        targetId: String(id),
        details: JSON.stringify({ name: deleted[0].name })
      });
      res.json({ deleted: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/orders/:id/status",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const orderId = Number(req.params.id);
    const schema = z.object({
      status: z.enum([
        "confirmed",
        "accepted",
        "preparing",
        "ready",
        "rider_assigned",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled"
      ]),
      riderUid: z.string().nullable().optional(),
      note: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!Number.isInteger(orderId) || !parsed.success) {
      return res.status(400).json({ error: "Invalid admin order status payload" });
    }
    try {
      const rows = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
      if (rows.length === 0) return res.status(404).json({ error: "Order not found" });
      const order = rows[0];
      let nextRiderUid = order.riderUid;
      let nextRiderName = order.riderName;
      if (parsed.data.riderUid !== void 0) {
        if (parsed.data.riderUid === null || parsed.data.riderUid === "") {
          nextRiderUid = null;
          nextRiderName = null;
        } else {
          const riderRows = await db.select().from(riders).where(eq3(riders.uid, parsed.data.riderUid)).limit(1);
          nextRiderUid = parsed.data.riderUid;
          nextRiderName = riderRows[0]?.fullName || parsed.data.riderUid;
        }
      }
      const updated = await db.update(orders).set({
        status: parsed.data.status,
        riderUid: nextRiderUid,
        riderName: nextRiderName,
        paymentStatus: parsed.data.status === "delivered" && order.paymentMethod === "cod" ? "paid" : order.paymentStatus,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(orders.id, orderId)).returning();
      await db.insert(orderStatusHistory).values({
        orderId,
        status: parsed.data.status,
        note: parsed.data.note || `Admin updated status to ${parsed.data.status.replace(/_/g, " ")}`,
        actorUid: req.user.uid
      });
      if (parsed.data.status === "delivered") {
        await settleOrderCommissionIdempotent(orderId);
      }
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "order_override",
        targetType: "order",
        targetId: String(orderId),
        details: JSON.stringify(parsed.data)
      });
      res.json({ order: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/orders/:id/refund",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId)) return res.status(400).json({ error: "Invalid order ID" });
    try {
      const result = await db.transaction(async (tx) => {
        const rows = await tx.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
        if (rows.length === 0) throw new Error("Order not found");
        const order = rows[0];
        const updated = await tx.update(orders).set({
          status: "cancelled",
          paymentStatus: order.paymentStatus === "paid" ? "refunded" : "failed",
          cancelReason: req.body.reason || "Cancelled & refunded by Super Admin",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(orders.id, order.id)).returning();
        const existingReversal = await tx.select().from(commissionLedger).where(
          and2(
            eq3(commissionLedger.orderId, order.id),
            eq3(commissionLedger.entryType, "commission_reversal")
          )
        ).limit(1);
        if (existingReversal.length === 0 && order.platformCommission > 0) {
          await tx.insert(commissionLedger).values({
            orderId: order.id,
            restaurantId: order.restaurantId,
            entryType: "commission_reversal",
            grossAmount: -Math.max(0, order.subtotal - order.discountAmount),
            commissionAmount: -order.platformCommission,
            netRestaurantAmount: -order.restaurantEarnings,
            deliveryFeeAmount: -order.deliveryFee,
            note: `Refund reversal for ${order.orderNumber}`
          });
        }
        await tx.insert(orderStatusHistory).values({
          orderId: order.id,
          status: "cancelled",
          note: "Order cancelled and commission reversed by Super Admin",
          actorUid: req.user.uid
        });
        await tx.insert(auditLogs).values({
          actorUid: req.user.uid,
          action: "order_refund",
          targetType: "order",
          targetId: String(order.id),
          details: JSON.stringify({ orderNumber: order.orderNumber })
        });
        return updated[0];
      });
      res.json({ order: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/payouts/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid payout ID" });
    const status = req.body.status === "rejected" ? "rejected" : "paid";
    try {
      const updated = await db.update(restaurantPayouts).set({
        status,
        referenceId: status === "paid" ? `PAY-${Date.now().toString(36).toUpperCase()}` : "",
        processedAt: /* @__PURE__ */ new Date()
      }).where(eq3(restaurantPayouts.id, id)).returning();
      if (updated.length === 0) return res.status(404).json({ error: "Payout not found" });
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: `payout_${status}`,
        targetType: "payout",
        targetId: String(id),
        details: JSON.stringify({ amount: updated[0].amount })
      });
      res.json({ payout: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.post(
  "/api/admin/coupons",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const schema = z.object({
      code: z.string().min(3).max(24),
      title: z.string().min(3),
      type: z.enum(["percentage", "fixed", "free_delivery"]),
      value: z.number().int().min(0),
      minOrder: z.number().int().min(0).default(0),
      maxDiscount: z.number().int().min(0).default(300)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid coupon data" });
    try {
      const inserted = await db.insert(coupons).values({
        code: parsed.data.code.trim().toUpperCase(),
        title: parsed.data.title,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrder: parsed.data.minOrder,
        maxDiscount: parsed.data.maxDiscount,
        isActive: true
      }).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "coupon_created",
        targetType: "coupon",
        targetId: String(inserted[0].id),
        details: JSON.stringify({ code: inserted[0].code })
      });
      res.status(201).json({ coupon: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/coupons/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid coupon ID" });
    try {
      const rows = await db.select().from(coupons).where(eq3(coupons.id, id)).limit(1);
      if (rows.length === 0) return res.status(404).json({ error: "Coupon not found" });
      const updated = await db.update(coupons).set({
        isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : rows[0].isActive
      }).where(eq3(coupons.id, id)).returning();
      res.json({ coupon: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.delete(
  "/api/admin/coupons/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid coupon ID" });
    try {
      await db.delete(coupons).where(eq3(coupons.id, id));
      res.json({ deleted: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/settings",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    try {
      const existing = await db.select().from(platformSettings).limit(1);
      if (existing.length === 0) return res.status(404).json({ error: "Settings missing" });
      const cur = existing[0];
      const curStorefront = cur.storefrontConfig && typeof cur.storefrontConfig === "object" ? cur.storefrontConfig : {};
      const nextStorefront = req.body.storefrontConfig && typeof req.body.storefrontConfig === "object" ? { ...curStorefront, ...req.body.storefrontConfig } : curStorefront;
      const updated = await db.update(platformSettings).set({
        platformName: typeof req.body.platformName === "string" && req.body.platformName.trim() ? req.body.platformName.trim() : cur.platformName,
        defaultCommissionPct: req.body.defaultCommissionPct ?? cur.defaultCommissionPct,
        defaultDeliveryFee: typeof req.body.defaultDeliveryFee === "number" ? req.body.defaultDeliveryFee : cur.defaultDeliveryFee,
        serviceFee: typeof req.body.serviceFee === "number" ? req.body.serviceFee : cur.serviceFee,
        minOrderDefault: typeof req.body.minOrderDefault === "number" ? req.body.minOrderDefault : cur.minOrderDefault,
        pathaoEnabled: req.body.pathaoEnabled ?? cur.pathaoEnabled,
        pathaoSandbox: req.body.pathaoSandbox ?? cur.pathaoSandbox,
        bkashEnabled: req.body.bkashEnabled ?? cur.bkashEnabled,
        bkashSandbox: req.body.bkashSandbox ?? cur.bkashSandbox,
        sslcommerzEnabled: req.body.sslcommerzEnabled ?? cur.sslcommerzEnabled,
        sslcommerzSandbox: req.body.sslcommerzSandbox ?? cur.sslcommerzSandbox,
        storefrontConfig: nextStorefront,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(platformSettings.id, cur.id)).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "platform_settings_updated",
        targetType: "platform_settings",
        targetId: String(cur.id),
        details: JSON.stringify(req.body)
      });
      res.json({ settings: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/users/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user ID" });
    const allowedRoles = ["customer", "restaurant_owner", "rider", "admin", "super_admin"];
    try {
      const existing = await db.select().from(users).where(eq3(users.id, id)).limit(1);
      if (existing.length === 0) return res.status(404).json({ error: "User not found" });
      const target = existing[0];
      const nextStatus = req.body.status === "suspended" || req.body.status === "active" ? req.body.status : target.status;
      const nextRole = typeof req.body.role === "string" && allowedRoles.includes(req.body.role) ? req.body.role : target.role;
      const decision = canActorModifyUserAccount({
        actorUid: req.user.uid,
        actorRole: req.user.role,
        targetUid: target.uid,
        targetEmail: target.email,
        currentRole: target.role,
        nextRole,
        nextStatus
      });
      if (!decision.allowed) {
        return res.status(403).json({ error: decision.reason || "Forbidden: Role change not permitted." });
      }
      const updated = await db.update(users).set({ status: nextStatus, role: nextRole, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(users.id, id)).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "user_updated",
        targetType: "user",
        targetId: String(id),
        details: JSON.stringify({ role: nextRole, status: nextStatus })
      });
      res.json({ user: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.patch(
  "/api/admin/riders/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid rider ID" });
    try {
      const existing = await db.select().from(riders).where(eq3(riders.id, id)).limit(1);
      if (existing.length === 0) return res.status(404).json({ error: "Rider not found" });
      const cur = existing[0];
      const updated = await db.update(riders).set({
        status: typeof req.body.status === "string" && ["pending", "approved", "suspended"].includes(req.body.status) ? req.body.status : cur.status,
        isAvailable: typeof req.body.isAvailable === "boolean" ? req.body.isAvailable : cur.isAvailable,
        zone: typeof req.body.zone === "string" && req.body.zone.trim() ? req.body.zone.trim() : cur.zone
      }).where(eq3(riders.id, id)).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "rider_updated",
        targetType: "rider",
        targetId: String(id),
        details: JSON.stringify(req.body)
      });
      res.json({ rider: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
app.get(
  "/api/admin/backend/status",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (_req, res) => {
    const started = Date.now();
    try {
      await db.execute(sql3`SELECT 1`);
      const latencyMs = Math.max(1, Date.now() - started);
      const [
        usersCount,
        restaurantsCount,
        foodItemsCount,
        ordersCount,
        ridersCount,
        couponsCount,
        notificationsCount,
        ledgerCount,
        auditCount
      ] = await Promise.all([
        db.select({ count: sql3`count(*)::int` }).from(users),
        db.select({ count: sql3`count(*)::int` }).from(restaurants),
        db.select({ count: sql3`count(*)::int` }).from(foodItems),
        db.select({ count: sql3`count(*)::int` }).from(orders),
        db.select({ count: sql3`count(*)::int` }).from(riders),
        db.select({ count: sql3`count(*)::int` }).from(coupons),
        db.select({ count: sql3`count(*)::int` }).from(notifications),
        db.select({ count: sql3`count(*)::int` }).from(commissionLedger),
        db.select({ count: sql3`count(*)::int` }).from(auditLogs)
      ]);
      const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || "";
      const databaseProvider = connStr ? "supabase-or-external-url" : process.env.SQL_HOST ? "cloudsql-pg" : "local-pg";
      const sslActive = Boolean(connStr) && !connStr.includes("localhost") && !connStr.includes("127.0.0.1");
      res.json({
        ok: true,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
        latencyMs,
        runtime: process.env.VERCEL ? "vercel-serverless" : "node-express",
        databaseProvider,
        sslActive,
        integrations: {
          databaseConfigured: Boolean(connStr || process.env.SQL_HOST),
          supabaseAuthConfigured: Boolean(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://uvqptlflvdtxbrqiztzi.supabase.co"
          ),
          googleMapsConfigured: Boolean(
            process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
          ),
          bkashLiveConfigured: Boolean(process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET),
          sslcommerzLiveConfigured: Boolean(
            process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWD
          ),
          pathaoLiveConfigured: Boolean(
            process.env.PATHAO_CLIENT_ID && process.env.PATHAO_CLIENT_SECRET
          )
        },
        tableCounts: {
          users: Number(usersCount[0]?.count ?? 0),
          restaurants: Number(restaurantsCount[0]?.count ?? 0),
          foodItems: Number(foodItemsCount[0]?.count ?? 0),
          orders: Number(ordersCount[0]?.count ?? 0),
          riders: Number(ridersCount[0]?.count ?? 0),
          coupons: Number(couponsCount[0]?.count ?? 0),
          notifications: Number(notificationsCount[0]?.count ?? 0),
          commissionLedger: Number(ledgerCount[0]?.count ?? 0),
          auditLogs: Number(auditCount[0]?.count ?? 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Database health check failed" });
    }
  }
);
app.post(
  "/api/admin/notifications/broadcast",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req, res) => {
    const validated = validateBroadcastNotification({
      targetRole: String(req.body?.targetRole || ""),
      title: String(req.body?.title || ""),
      message: String(req.body?.message || ""),
      type: typeof req.body?.type === "string" ? req.body.type : "system"
    });
    if (!validated.valid) {
      return res.status(400).json({ error: validated.reason });
    }
    try {
      const recipientUid = validated.targetRole === "all" ? "broadcast-all" : `role-${validated.targetRole}`;
      const inserted = await db.insert(notifications).values({
        recipientUid,
        roleTarget: validated.targetRole,
        title: validated.title,
        message: validated.message,
        type: validated.type
      }).returning();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "notification_broadcast",
        targetType: "notification",
        targetId: String(inserted[0].id),
        details: JSON.stringify({ targetRole: validated.targetRole, title: validated.title })
      });
      res.status(201).json({ notification: inserted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to send broadcast" });
    }
  }
);
app.post(
  "/api/admin/backend/reseed",
  requireAuth,
  requireRole(["super_admin"]),
  async (req, res) => {
    try {
      await ensureDatabaseSeeded();
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "backend_reseed_verified",
        targetType: "database",
        targetId: "seed",
        details: "Verified and repaired baseline marketplace seed records without wiping data."
      });
      res.json({ ok: true, message: "Database seed integrity verified cleanly." });
    } catch (error) {
      res.status(500).json({ error: error.message || "Database seed verification failed" });
    }
  }
);
app.get(
  "/api/admin/backend/backup",
  requireAuth,
  requireRole(["super_admin"]),
  async (req, res) => {
    try {
      const [
        allUsers,
        allRestaurants,
        allFoodItems,
        allOrders,
        allRiders,
        allCoupons,
        allLedger,
        allPayouts,
        allSettings,
        allNotifications
      ] = await Promise.all([
        db.select({
          id: users.id,
          uid: users.uid,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt
        }).from(users),
        db.select().from(restaurants),
        db.select().from(foodItems),
        db.select().from(orders),
        db.select().from(riders),
        db.select().from(coupons),
        db.select().from(commissionLedger),
        db.select().from(restaurantPayouts),
        db.select().from(platformSettings),
        db.select().from(notifications)
      ]);
      await db.insert(auditLogs).values({
        actorUid: req.user.uid,
        action: "backend_backup_exported",
        targetType: "database",
        targetId: "json",
        details: JSON.stringify({
          exportedBy: req.user.email,
          orders: allOrders.length,
          restaurants: allRestaurants.length
        })
      });
      const payload = {
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        exportedBy: req.user.email,
        platform: "Foodora BD",
        tables: {
          users: allUsers,
          restaurants: allRestaurants,
          foodItems: allFoodItems,
          orders: allOrders,
          riders: allRiders,
          coupons: allCoupons,
          commissionLedger: allLedger,
          restaurantPayouts: allPayouts,
          platformSettings: allSettings,
          notifications: allNotifications
        }
      };
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="foodora-bd-db-backup.json"');
      res.send(JSON.stringify(payload, null, 2));
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to generate database backup" });
    }
  }
);
var EXCLUDED_ZIP_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  "dist",
  ".git",
  ".playwright-cli",
  ".aistudio",
  ".cache",
  ".gmp_cache",
  "tmp"
]);
var EXCLUDED_ZIP_FILES = /* @__PURE__ */ new Set([".env", ".DS_Store"]);
async function addDirectoryToZip(zipFolder, fsDir, relBase = "") {
  const entries = await fs.promises.readdir(fsDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    const fullPath = path.join(fsDir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_ZIP_DIRS.has(entry.name)) continue;
      if (relPath === "public/assets/aistudio" || relPath === "public\\assets\\aistudio") continue;
      await addDirectoryToZip(zipFolder, fullPath, relPath);
    } else if (entry.isFile()) {
      if (EXCLUDED_ZIP_FILES.has(entry.name)) continue;
      if (entry.name.endsWith(".log") || entry.name.endsWith(".zip")) continue;
      const content = await fs.promises.readFile(fullPath);
      zipFolder.file(relPath, content);
    }
  }
}
app.get("/api/export/project-zip", async (_req, res) => {
  try {
    const zip = new JSZip();
    const rootFolder = zip.folder("foodora-bd");
    if (!rootFolder) {
      return res.status(500).json({ error: "Failed to initialize ZIP archive" });
    }
    await addDirectoryToZip(rootFolder, PROJECT_ROOT);
    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="foodora-bd-project.zip"');
    res.setHeader("Content-Length", String(buffer.byteLength));
    res.send(buffer);
  } catch (error) {
    console.error("Project ZIP export failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate ZIP file" });
  }
});
app.get("/api/notifications", requireAuth, async (req, res) => {
  const list = await getNotificationsForUser(req.user.uid, req.user.role);
  res.json({ notifications: list });
});
app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
  await db.update(notifications).set({ isRead: true }).where(
    or2(
      eq3(notifications.recipientUid, req.user.uid),
      eq3(notifications.roleTarget, req.user.role),
      eq3(notifications.roleTarget, "all")
    )
  );
  res.json({ ok: true });
});
app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid notification ID" });
  await db.update(notifications).set({ isRead: true }).where(
    and2(
      eq3(notifications.id, id),
      or2(
        eq3(notifications.recipientUid, req.user.uid),
        eq3(notifications.roleTarget, req.user.role),
        eq3(notifications.roleTarget, "all")
      )
    )
  );
  res.json({ ok: true });
});
async function startServer() {
  const port = Number(process.env.PORT || 3e3);
  if (process.env.NODE_ENV !== "production") {
    const vitePkg = "vite";
    const { createServer } = await import(
      /* @vite-ignore */
      vitePkg
    );
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(PROJECT_ROOT, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Foodora BD server listening on http://0.0.0.0:${port}`);
  });
}
var isServerless = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION || path.basename(__dirname) === "api"
);
if (!isServerless) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default
};
