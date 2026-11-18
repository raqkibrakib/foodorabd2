import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default('Foodora Customer'),
  phone: text('phone').default(''),
  avatarUrl: text('avatar_url').default(''),
  role: text('role').notNull().default('customer'), // customer | restaurant_owner | rider | admin | super_admin
  status: text('status').notNull().default('active'), // active | suspended
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const localCredentials = pgTable('local_credentials', {
  email: text('email').primaryKey(),
  uid: text('uid').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customerAddresses = pgTable('customer_addresses', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  label: text('label').notNull().default('Home'),
  area: text('area').notNull(),
  addressLine: text('address_line').notNull(),
  lat: doublePrecision('lat').notNull().default(23.7925),
  lng: doublePrecision('lng').notNull().default(90.4078),
  instructions: text('instructions').default(''),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  ownerUid: text('owner_uid').notNull(),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  cuisine: text('cuisine').notNull(),
  area: text('area').notNull(),
  address: text('address').notNull(),
  lat: doublePrecision('lat').notNull().default(23.7937),
  lng: doublePrecision('lng').notNull().default(90.4066),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  logoUrl: text('logo_url').default(''),
  coverUrl: text('cover_url').notNull(),
  tradeLicense: text('trade_license').default(''),
  nidNumber: text('nid_number').default(''),
  payoutMethod: text('payout_method').notNull().default('bkash'), // bkash | nagad | bank
  payoutAccount: text('payout_account').notNull().default(''),
  deliveryTimeMin: integer('delivery_time_min').notNull().default(20),
  deliveryFee: integer('delivery_fee').notNull().default(49),
  minOrder: integer('min_order').notNull().default(150),
  priceTier: text('price_tier').notNull().default('৳৳'),
  rating: numeric('rating', { precision: 3, scale: 1 }).notNull().default('4.7'),
  reviewCount: integer('review_count').notNull().default(0),
  discountPct: integer('discount_pct').notNull().default(0),
  isSponsored: boolean('is_sponsored').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  isOpen: boolean('is_open').notNull().default(true),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | suspended
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull().default('15.00'),
  commissionType: text('commission_type').notNull().default('percentage'), // percentage | fixed
  fixedCommission: integer('fixed_commission').notNull().default(0),
  subscriptionPlan: text('subscription_plan').notNull().default('free'), // free | basic | premium | enterprise
  deliveryMode: text('delivery_mode').notNull().default('platform'), // platform | restaurant | third_party
  openingHours: text('opening_hours').notNull().default('10:00 AM - 11:30 PM'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const foodItems = pgTable('food_items', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id, { onDelete: 'cascade' })
    .notNull(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  nameBn: text('name_bn').notNull(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url').notNull(),
  price: integer('price').notNull(),
  discountPrice: integer('discount_price'),
  variationsJson: jsonb('variations_json')
    .$type<Array<{ name: string; priceDelta: number }>>()
    .notNull()
    .default([]),
  addonsJson: jsonb('addons_json')
    .$type<Array<{ name: string; price: number }>>()
    .notNull()
    .default([]),
  inStock: boolean('in_stock').notNull().default(true),
  isAvailable: boolean('is_available').notNull().default(true),
  isPopular: boolean('is_popular').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  type: text('type').notNull(), // percentage | fixed | free_delivery
  value: integer('value').notNull(),
  minOrder: integer('min_order').notNull().default(0),
  maxDiscount: integer('max_discount').notNull().default(500),
  restaurantId: integer('restaurant_id'),
  usageLimit: integer('usage_limit').notNull().default(1000),
  usedCount: integer('used_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerUid: text('customer_uid').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id)
    .notNull(),
  restaurantName: text('restaurant_name').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryArea: text('delivery_area').notNull(),
  deliveryLat: doublePrecision('delivery_lat').notNull().default(23.7925),
  deliveryLng: doublePrecision('delivery_lng').notNull().default(90.4078),
  deliveryInstructions: text('delivery_instructions').default(''),
  deliveryMode: text('delivery_mode').notNull().default('platform'), // platform | restaurant | third_party
  deliveryProvider: text('delivery_provider').notNull().default('Foodora Rider'),
  consignmentId: text('consignment_id').default(''),
  paymentMethod: text('payment_method').notNull().default('cod'), // bkash | nagad | sslcommerz | cod
  paymentStatus: text('payment_status').notNull().default('pending'), // pending | paid | failed | refunded
  paymentTxId: text('payment_tx_id').default(''),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  couponCode: text('coupon_code').default(''),
  deliveryFee: integer('delivery_fee').notNull().default(0),
  serviceFee: integer('service_fee').notNull().default(10),
  taxAmount: integer('tax_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull().default('15.00'),
  platformCommission: integer('platform_commission').notNull().default(0),
  restaurantEarnings: integer('restaurant_earnings').notNull().default(0),
  status: text('status').notNull().default('confirmed'), // confirmed | accepted | preparing | ready | rider_assigned | picked_up | on_the_way | delivered | cancelled
  cancelReason: text('cancel_reason').default(''),
  riderUid: text('rider_uid').default(''),
  riderName: text('rider_name').default(''),
  estimatedMinutes: integer('estimated_minutes').notNull().default(30),
  itemsSnapshotJson: jsonb('items_snapshot_json')
    .$type<
      Array<{
        foodItemId: number;
        name: string;
        nameBn: string;
        quantity: number;
        unitPrice: number;
        variation?: string;
        addons: Array<{ name: string; price: number }>;
        specialInstructions?: string;
        lineTotal: number;
      }>
    >()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull(),
  note: text('note').default(''),
  actorUid: text('actor_uid').default('system'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commissionLedger = pgTable('commission_ledger', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id)
    .notNull(),
  entryType: text('entry_type').notNull(), // commission_earned | commission_reversal | payout_debit | subscription_fee
  grossAmount: integer('gross_amount').notNull(),
  commissionAmount: integer('commission_amount').notNull(),
  netRestaurantAmount: integer('net_restaurant_amount').notNull(),
  deliveryFeeAmount: integer('delivery_fee_amount').notNull().default(0),
  note: text('note').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const restaurantPayouts = pgTable('restaurant_payouts', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id)
    .notNull(),
  restaurantName: text('restaurant_name').notNull(),
  amount: integer('amount').notNull(),
  method: text('method').notNull().default('bkash'),
  accountNumber: text('account_number').notNull(),
  status: text('status').notNull().default('pending'), // pending | paid | rejected
  referenceId: text('reference_id').default(''),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

export const riders = pgTable('riders', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  vehicleType: text('vehicle_type').notNull().default('Motorbike'),
  nidNumber: text('nid_number').default(''),
  zone: text('zone').notNull().default('Gulshan / Banani'),
  isAvailable: boolean('is_available').notNull().default(true),
  status: text('status').notNull().default('approved'), // pending | approved | suspended
  currentLat: doublePrecision('current_lat').notNull().default(23.7949),
  currentLng: doublePrecision('current_lng').notNull().default(90.4043),
  locationUpdatedAt: timestamp('location_updated_at').defaultNow().notNull(),
  totalDeliveries: integer('total_deliveries').notNull().default(0),
  totalEarnings: integer('total_earnings').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id, { onDelete: 'cascade' })
    .notNull(),
  customerUid: text('customer_uid').notNull(),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(),
  foodRating: integer('food_rating').notNull().default(5),
  comment: text('comment').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  customerUid: text('customer_uid').notNull(),
  restaurantId: integer('restaurant_id')
    .references(() => restaurants.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientUid: text('recipient_uid').notNull(),
  roleTarget: text('role_target').notNull().default('customer'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('order'),
  isRead: boolean('is_read').notNull().default(false),
  relatedOrderId: integer('related_order_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  platformName: text('platform_name').notNull().default('Foodora BD'),
  defaultCommissionPct: numeric('default_commission_pct', { precision: 5, scale: 2 })
    .notNull()
    .default('15.00'),
  defaultDeliveryFee: integer('default_delivery_fee').notNull().default(49),
  serviceFee: integer('service_fee').notNull().default(10),
  minOrderDefault: integer('min_order_default').notNull().default(150),
  pathaoEnabled: boolean('pathao_enabled').notNull().default(true),
  pathaoSandbox: boolean('pathao_sandbox').notNull().default(true),
  bkashEnabled: boolean('bkash_enabled').notNull().default(true),
  bkashSandbox: boolean('bkash_sandbox').notNull().default(true),
  sslcommerzEnabled: boolean('sslcommerz_enabled').notNull().default(true),
  sslcommerzSandbox: boolean('sslcommerz_sandbox').notNull().default(true),
  storefrontConfig: jsonb('storefront_config').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  details: text('details').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
