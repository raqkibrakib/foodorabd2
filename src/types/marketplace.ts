import type { DeliveryMode, OrderStatus, PaymentMethod } from '../lib/marketplace-logic';

export type Lang = 'bn' | 'en';
export type UserRole = 'customer' | 'restaurant_owner' | 'rider' | 'admin' | 'super_admin';

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  isSandbox: boolean;
}

export interface Restaurant {
  id: number;
  ownerUid: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  cuisine: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  logoUrl: string | null;
  coverUrl: string;
  tradeLicense: string | null;
  nidNumber: string | null;
  payoutMethod: string;
  payoutAccount: string;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  priceTier: string;
  rating: string;
  reviewCount: number;
  discountPct: number;
  isSponsored: boolean;
  isNew: boolean;
  isOpen: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: string;
  commissionType: 'percentage' | 'fixed';
  fixedCommission: number;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  deliveryMode: DeliveryMode;
  openingHours: string;
}

export interface FoodItem {
  id: number;
  restaurantId: number;
  category: string;
  name: string;
  nameBn: string;
  description: string;
  imageUrl: string;
  price: number;
  discountPrice: number | null;
  variationsJson: Array<{ name: string; priceDelta: number }>;
  addonsJson: Array<{ name: string; price: number }>;
  inStock: boolean;
  isAvailable: boolean;
  isPopular: boolean;
}

export interface ReviewItem {
  id: number;
  restaurantId: number;
  customerName: string;
  rating: number;
  foodRating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  title: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrder: number;
  maxDiscount: number;
  restaurantId: number | null;
  isActive: boolean;
}

export interface CustomerAddress {
  id: number;
  label: string;
  area: string;
  addressLine: string;
  lat: number;
  lng: number;
  instructions: string | null;
  isDefault: boolean;
}

export interface OrderSnapshotItem {
  foodItemId: number;
  name: string;
  nameBn: string;
  quantity: number;
  unitPrice: number;
  variation?: string;
  addons: Array<{ name: string; price: number }>;
  specialInstructions?: string;
  lineTotal: number;
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  customerUid: string;
  customerName: string;
  customerPhone: string;
  restaurantId: number;
  restaurantName: string;
  deliveryAddress: string;
  deliveryArea: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryInstructions: string | null;
  deliveryMode: DeliveryMode;
  deliveryProvider: string;
  consignmentId: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentTxId: string | null;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  deliveryFee: number;
  serviceFee: number;
  taxAmount: number;
  totalAmount: number;
  commissionRate: string;
  platformCommission: number;
  restaurantEarnings: number;
  status: OrderStatus;
  cancelReason: string | null;
  riderUid: string | null;
  riderName: string | null;
  restaurantLat?: number;
  restaurantLng?: number;
  estimatedMinutes: number;
  itemsSnapshotJson: OrderSnapshotItem[];
  createdAt: string;
}

export interface RiderLiveLocation {
  uid: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  zone: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
  locationUpdatedAt: string;
}

export interface LedgerEntry {
  id: number;
  orderId: number | null;
  restaurantId: number;
  entryType: string;
  grossAmount: number;
  commissionAmount: number;
  netRestaurantAmount: number;
  deliveryFeeAmount: number;
  note: string | null;
  createdAt: string;
}

export interface PayoutRecord {
  id: number;
  restaurantId: number;
  restaurantName: string;
  amount: number;
  method: string;
  accountNumber: string;
  status: 'pending' | 'paid' | 'rejected';
  referenceId: string | null;
  requestedAt: string;
}

export interface RiderRecord {
  id: number;
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: string;
  zone: string;
  isAvailable: boolean;
  status: string;
  currentLat: number;
  currentLng: number;
  locationUpdatedAt?: string;
  totalDeliveries: number;
  totalEarnings: number;
}

export interface StorefrontConfig {
  brandPrefix: string;
  brandSuffix: string;
  accentColor: string;
  showTopPartnerBar: boolean;
  showPickupTab: boolean;
  announcementBarEnabled: boolean;
  announcementTextEn: string;
  announcementTextBn: string;
  showHero: boolean;
  heroBadgeEn: string;
  heroBadgeBn: string;
  heroTitleEn: string;
  heroTitleBn: string;
  heroSubEn: string;
  heroSubBn: string;
  heroTrustEn: string;
  heroTrustBn: string;
  heroBtnEn: string;
  heroBtnBn: string;
  heroImageUrl: string;
  showPromoTicket: boolean;
  promoCode: string;
  promoDescEn: string;
  promoDescBn: string;
  showCuisineRibbon: boolean;
  showDailyDeals: boolean;
  dailyDealsTitleEn: string;
  dailyDealsTitleBn: string;
  restaurantsHeadingEn: string;
  restaurantsHeadingBn: string;
  footerDescEn: string;
  footerDescBn: string;
  footerZonesLine1: string;
  footerZonesLine2: string;
  footerCopyright: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface PlatformSettings {
  id: number;
  platformName: string;
  defaultCommissionPct: string;
  defaultDeliveryFee: number;
  serviceFee: number;
  minOrderDefault: number;
  pathaoEnabled: boolean;
  pathaoSandbox: boolean;
  bkashEnabled: boolean;
  bkashSandbox: boolean;
  sslcommerzEnabled: boolean;
  sslcommerzSandbox: boolean;
  storefrontConfig?: Partial<StorefrontConfig> | null;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedOrderId: number | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  createdAt: string;
}

export interface BackendStatusSummary {
  ok: boolean;
  checkedAt: string;
  latencyMs: number;
  runtime: 'vercel-serverless' | 'node-express';
  databaseProvider: 'supabase-or-external-url' | 'cloudsql-pg' | 'local-pg';
  sslActive: boolean;
  integrations: {
    databaseConfigured: boolean;
    supabaseAuthConfigured: boolean;
    googleMapsConfigured: boolean;
    bkashLiveConfigured: boolean;
    sslcommerzLiveConfigured: boolean;
    pathaoLiveConfigured: boolean;
  };
  tableCounts: {
    users: number;
    restaurants: number;
    foodItems: number;
    orders: number;
    riders: number;
    coupons: number;
    notifications: number;
    commissionLedger: number;
    auditLogs: number;
  };
}

