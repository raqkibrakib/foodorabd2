export type DeliveryMode = 'platform' | 'restaurant' | 'third_party';
export type PaymentMethod = 'bkash' | 'nagad' | 'sslcommerz' | 'cod';
export type OrderStatus =
  | 'confirmed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'rider_assigned'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartItemInput {
  foodItemId: number;
  restaurantId: number;
  name: string;
  nameBn: string;
  imageUrl: string;
  basePrice: number;
  discountPrice?: number | null;
  variationName?: string;
  variationDelta?: number;
  addons: CartAddon[];
  quantity: number;
  specialInstructions?: string;
}

export interface CouponInput {
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrder: number;
  maxDiscount: number;
  restaurantId?: number | null;
  isActive: boolean;
  usedCount: number;
  usageLimit: number;
}

export interface OrderFinancialParams {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  serviceFee: number;
  taxAmount?: number;
  commissionType: 'percentage' | 'fixed';
  commissionRate: number;
  fixedCommission: number;
}

export interface OrderFinancialBreakdown {
  subtotal: number;
  discountAmount: number;
  netFoodRevenue: number;
  deliveryFee: number;
  serviceFee: number;
  taxAmount: number;
  totalPayable: number;
  platformCommission: number;
  restaurantEarnings: number;
}

export function formatBdt(amount: number, lang: 'bn' | 'en' = 'bn'): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('en-US');
  if (lang === 'bn') {
    return `৳${toBengaliDigits(formatted)}`;
  }
  return `৳${formatted}`;
}

export function toBengaliDigits(input: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}

export function calculateCartItemUnitPrice(item: Pick<CartItemInput, 'basePrice' | 'discountPrice' | 'variationDelta' | 'addons'>): number {
  const effectiveBase =
    item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice > 0
      ? item.discountPrice
      : item.basePrice;
  const variationCost = item.variationDelta ?? 0;
  const addonsCost = item.addons.reduce((sum, addon) => sum + Math.max(0, addon.price), 0);
  return Math.max(0, effectiveBase + variationCost + addonsCost);
}

export function calculateCartSubtotal(items: CartItemInput[]): number {
  return items.reduce((sum, item) => {
    const qty = Math.max(1, Math.floor(item.quantity));
    return sum + calculateCartItemUnitPrice(item) * qty;
  }, 0);
}

export function canAddToSingleRestaurantCart(
  existingItems: Pick<CartItemInput, 'restaurantId'>[],
  incomingRestaurantId: number
): boolean {
  if (existingItems.length === 0) return true;
  return existingItems[0].restaurantId === incomingRestaurantId;
}

export function evaluateCoupon(
  coupon: CouponInput,
  subtotal: number,
  deliveryFee: number,
  restaurantId: number
): { valid: boolean; discountAmount: number; deliveryFeeAfterCoupon: number; reason?: string } {
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: 'Coupon is inactive' };
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: 'Coupon usage limit reached' };
  }
  if (coupon.restaurantId && coupon.restaurantId !== restaurantId) {
    return { valid: false, discountAmount: 0, deliveryFeeAfterCoupon: deliveryFee, reason: 'Coupon not valid for this restaurant' };
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      discountAmount: 0,
      deliveryFeeAfterCoupon: deliveryFee,
      reason: `Minimum order of ৳${coupon.minOrder} required`,
    };
  }

  if (coupon.type === 'free_delivery') {
    return {
      valid: true,
      discountAmount: 0,
      deliveryFeeAfterCoupon: 0,
    };
  }

  if (coupon.type === 'fixed') {
    const discount = Math.min(subtotal, Math.max(0, coupon.value));
    return {
      valid: true,
      discountAmount: discount,
      deliveryFeeAfterCoupon: deliveryFee,
    };
  }

  // Percentage discount with maxDiscount cap
  const rawPct = Math.round((subtotal * coupon.value) / 100);
  const capped = coupon.maxDiscount > 0 ? Math.min(rawPct, coupon.maxDiscount) : rawPct;
  const discount = Math.min(subtotal, Math.max(0, capped));
  return {
    valid: true,
    discountAmount: discount,
    deliveryFeeAfterCoupon: deliveryFee,
  };
}

export function calculateOrderFinancials(params: OrderFinancialParams): OrderFinancialBreakdown {
  const subtotal = Math.max(0, Math.round(params.subtotal));
  const discountAmount = Math.min(subtotal, Math.max(0, Math.round(params.discountAmount)));
  const netFoodRevenue = Math.max(0, subtotal - discountAmount);
  const deliveryFee = Math.max(0, Math.round(params.deliveryFee));
  const serviceFee = Math.max(0, Math.round(params.serviceFee));
  const taxAmount = Math.max(0, Math.round(params.taxAmount ?? 0));

  let platformCommission = 0;
  if (netFoodRevenue > 0) {
    if (params.commissionType === 'fixed') {
      platformCommission = Math.min(netFoodRevenue, Math.max(0, Math.round(params.fixedCommission)));
    } else {
      platformCommission = Math.round((netFoodRevenue * Math.max(0, params.commissionRate)) / 100);
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
    restaurantEarnings,
  };
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed: ['accepted', 'preparing', 'cancelled'],
  accepted: ['preparing', 'ready', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['rider_assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
  rider_assigned: ['picked_up', 'on_the_way', 'cancelled'],
  picked_up: ['on_the_way', 'delivered'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function estimateDeliveryFeeAndEta(
  distanceKm: number,
  baseFee: number,
  deliveryMode: DeliveryMode
): { fee: number; etaMinutes: number } {
  const extraKm = Math.max(0, distanceKm - 2);
  const modeSurcharge = deliveryMode === 'third_party' ? 10 : 0;
  const fee = Math.round(baseFee + extraKm * 12 + modeSurcharge);
  const etaMinutes = Math.max(12, Math.round(14 + distanceKm * 5.5));
  return { fee, etaMinutes };
}

export function mapOpenMeteoWeather(
  weatherCode: number,
  precipitationMm: number
): { labelEn: string; labelBn: string; isRaining: boolean; rainBufferMin: number } {
  const hasPrecip = precipitationMm > 0.2;
  if (weatherCode >= 95) {
    return { labelEn: 'Thunderstorm', labelBn: 'বজ্রবৃষ্টি', isRaining: true, rainBufferMin: 12 };
  }
  if ((weatherCode >= 51 && weatherCode <= 82) || hasPrecip) {
    return { labelEn: 'Rainy', labelBn: 'বৃষ্টি হচ্ছে', isRaining: true, rainBufferMin: 7 };
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return { labelEn: 'Hazy / Fog', labelBn: 'কুয়াশাচ্ছন্ন', isRaining: false, rainBufferMin: 2 };
  }
  if (weatherCode >= 1 && weatherCode <= 3) {
    return { labelEn: 'Partly Cloudy', labelBn: 'আংশিক মেঘলা', isRaining: false, rainBufferMin: 0 };
  }
  return { labelEn: 'Clear Sky', labelBn: 'পরিষ্কার আকাশ', isRaining: false, rainBufferMin: 0 };
}

export function convertBdtToCurrency(amountBdt: number, ratePerBdt: number): number {
  if (!Number.isFinite(amountBdt) || !Number.isFinite(ratePerBdt) || amountBdt <= 0 || ratePerBdt <= 0) {
    return 0;
  }
  return Math.round(amountBdt * ratePerBdt * 100) / 100;
}

export interface VendorAnalyticsOrderInput {
  id: number;
  status: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  restaurantEarnings: number;
  createdAt: string | Date;
  itemsSnapshotJson: Array<{
    foodItemId: number;
    name: string;
    nameBn: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface VendorAnalyticsLedgerInput {
  orderId: number | null;
  entryType: string;
  grossAmount: number;
  netRestaurantAmount: number;
  createdAt: string | Date;
}

export interface VendorAnalyticsMenuItemInput {
  id: number;
  name: string;
  nameBn: string;
  category: string;
  imageUrl?: string;
}

export interface VendorPeriodPoint {
  key: string;
  label: string;
  orders: number;
  grossRevenue: number;
  netRevenue: number;
}

export interface TopSellingFoodItem {
  foodItemId: number;
  name: string;
  nameBn: string;
  category: string;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface VendorAnalyticsSummary {
  dailySeries: VendorPeriodPoint[];
  monthlySeries: VendorPeriodPoint[];
  topSellingItems: TopSellingFoodItem[];
  totalOrders: number;
  deliveredOrders: number;
  grossRevenue: number;
  netVendorRevenue: number;
  avgOrderValue: number;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildVendorAnalytics(
  ordersList: VendorAnalyticsOrderInput[],
  _ledgerList: VendorAnalyticsLedgerInput[] = [],
  menuItems: VendorAnalyticsMenuItemInput[] = []
): VendorAnalyticsSummary {
  const menuMap = new Map<number, VendorAnalyticsMenuItemInput>();
  for (const m of menuItems) {
    menuMap.set(m.id, m);
  }

  const dailyMap = new Map<string, VendorPeriodPoint>();
  const monthlyMap = new Map<string, VendorPeriodPoint>();
  const itemMap = new Map<string, TopSellingFoodItem>();

  let totalOrders = 0;
  let deliveredOrders = 0;
  let grossRevenue = 0;
  let netVendorRevenue = 0;

  for (const order of ordersList) {
    if (order.status === 'cancelled') continue;
    totalOrders += 1;
    if (order.status === 'delivered') deliveredOrders += 1;

    const orderGross = Math.max(0, order.subtotal - (order.discountAmount || 0));
    const orderNet = Math.max(0, order.restaurantEarnings || 0);
    grossRevenue += orderGross;
    netVendorRevenue += orderNet;

    const d = new Date(order.createdAt);
    const validDate = Number.isNaN(d.getTime()) ? new Date() : d;
    const yyyy = validDate.getUTCFullYear();
    const mmNum = validDate.getUTCMonth();
    const ddNum = validDate.getUTCDate();
    const mm = String(mmNum + 1).padStart(2, '0');
    const dd = String(ddNum).padStart(2, '0');

    const dayKey = `${yyyy}-${mm}-${dd}`;
    const dayLabel = `${MONTH_SHORT[mmNum]} ${ddNum}`;
    const dayEntry = dailyMap.get(dayKey) ?? {
      key: dayKey,
      label: dayLabel,
      orders: 0,
      grossRevenue: 0,
      netRevenue: 0,
    };
    dayEntry.orders += 1;
    dayEntry.grossRevenue += orderGross;
    dayEntry.netRevenue += orderNet;
    dailyMap.set(dayKey, dayEntry);

    const monthKey = `${yyyy}-${mm}`;
    const monthLabel = `${MONTH_SHORT[mmNum]} ${String(yyyy).slice(-2)}`;
    const monthEntry = monthlyMap.get(monthKey) ?? {
      key: monthKey,
      label: monthLabel,
      orders: 0,
      grossRevenue: 0,
      netRevenue: 0,
    };
    monthEntry.orders += 1;
    monthEntry.grossRevenue += orderGross;
    monthEntry.netRevenue += orderNet;
    monthlyMap.set(monthKey, monthEntry);

    const seenInOrder = new Set<string>();
    const items = Array.isArray(order.itemsSnapshotJson) ? order.itemsSnapshotJson : [];
    for (const line of items) {
      const qty = Math.max(1, Number(line.quantity) || 1);
      const lineRev = Math.max(0, Number(line.lineTotal) || Number(line.unitPrice || 0) * qty);
      const itemKey = line.foodItemId ? `id:${line.foodItemId}` : `name:${line.name}`;
      const matchedMenu = line.foodItemId ? menuMap.get(line.foodItemId) : undefined;
      const existing = itemMap.get(itemKey) ?? {
        foodItemId: line.foodItemId || 0,
        name: matchedMenu?.name || line.name,
        nameBn: matchedMenu?.nameBn || line.nameBn || line.name,
        category: matchedMenu?.category || 'Menu Item',
        quantitySold: 0,
        revenue: 0,
        orderCount: 0,
      };
      existing.quantitySold += qty;
      existing.revenue += lineRev;
      if (!seenInOrder.has(itemKey)) {
        existing.orderCount += 1;
        seenInOrder.add(itemKey);
      }
      itemMap.set(itemKey, existing);
    }
  }

  const dailySeries = Array.from(dailyMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  const monthlySeries = Array.from(monthlyMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  const topSellingItems = Array.from(itemMap.values()).sort(
    (a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue
  );

  return {
    dailySeries,
    monthlySeries,
    topSellingItems,
    totalOrders,
    deliveredOrders,
    grossRevenue,
    netVendorRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0,
  };
}

export interface LiveRiderEtaResult {
  remainingKm: number;
  etaMinutes: number;
  arrived: boolean;
}

export function calculateLiveRiderEta(
  riderLat: number,
  riderLng: number,
  destLat: number,
  destLng: number,
  status: string = 'on_the_way',
  speedKmPerHour: number = 22
): LiveRiderEtaResult {
  if (status === 'delivered') {
    return { remainingKm: 0, etaMinutes: 0, arrived: true };
  }
  if (
    !Number.isFinite(riderLat) ||
    !Number.isFinite(riderLng) ||
    !Number.isFinite(destLat) ||
    !Number.isFinite(destLng)
  ) {
    return { remainingKm: 0, etaMinutes: 15, arrived: false };
  }
  const remainingKm = haversineDistanceKm(riderLat, riderLng, destLat, destLng);
  const arrived = remainingKm <= 0.12;
  const safeSpeed = Math.max(8, speedKmPerHour);
  const travelMins = (remainingKm / safeSpeed) * 60;
  const etaMinutes = arrived ? 1 : Math.max(2, Math.round(travelMins + 2));
  return { remainingKm, etaMinutes, arrived };
}

export function advanceRiderAlongRoute(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  fraction: number = 0.35
): { lat: number; lng: number } {
  const dist = haversineDistanceKm(currentLat, currentLng, targetLat, targetLng);
  if (dist <= 0.08) {
    return {
      lat: Math.round(targetLat * 1e6) / 1e6,
      lng: Math.round(targetLng * 1e6) / 1e6,
    };
  }
  const step = Math.min(1, Math.max(0.05, fraction));
  const nextLat = currentLat + (targetLat - currentLat) * step;
  const nextLng = currentLng + (targetLng - currentLng) * step;
  return {
    lat: Math.round(nextLat * 1e6) / 1e6,
    lng: Math.round(nextLng * 1e6) / 1e6,
  };
}

export const PRIMARY_SUPER_ADMIN_EMAIL = 'rakibraqkib@gmail.com';

export function canActorModifyUserAccount(params: {
  actorUid: string;
  actorRole: string;
  targetUid: string;
  targetEmail: string;
  currentRole: string;
  nextRole: string;
  nextStatus: string;
}): { allowed: boolean; reason?: string } {
  const { actorUid, actorRole, targetUid, targetEmail, currentRole, nextRole, nextStatus } = params;
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { allowed: false, reason: 'Only authorized Admin accounts can modify user roles.' };
  }
  if (targetEmail.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL) {
    if (nextRole !== 'super_admin' || nextStatus === 'suspended') {
      return {
        allowed: false,
        reason: 'Primary Super Admin account is protected and cannot be demoted or suspended.',
      };
    }
  }
  if (actorUid === targetUid && nextStatus === 'suspended') {
    return { allowed: false, reason: 'You cannot suspend your own active admin account.' };
  }
  const touchesPrivilegedRole =
    currentRole === 'super_admin' ||
    currentRole === 'admin' ||
    nextRole === 'super_admin' ||
    nextRole === 'admin';
  if (touchesPrivilegedRole && actorRole !== 'super_admin') {
    return {
      allowed: false,
      reason: 'Only Super Admin can grant or modify Admin and Super Admin privileges.',
    };
  }
  return { allowed: true };
}

export type BroadcastTargetRole = 'all' | 'customer' | 'restaurant_owner' | 'rider' | 'admin';

export function validateBroadcastNotification(input: {
  targetRole: string;
  title: string;
  message: string;
  type?: string;
}):
  | {
      valid: true;
      targetRole: BroadcastTargetRole;
      title: string;
      message: string;
      type: 'system' | 'promo' | 'order';
    }
  | { valid: false; reason: string } {
  const allowedTargets: BroadcastTargetRole[] = [
    'all',
    'customer',
    'restaurant_owner',
    'rider',
    'admin',
  ];
  if (!allowedTargets.includes(input.targetRole as BroadcastTargetRole)) {
    return { valid: false, reason: 'Invalid broadcast target role.' };
  }
  const title = input.title.trim();
  const message = input.message.trim();
  if (title.length < 3 || title.length > 120) {
    return { valid: false, reason: 'Broadcast title must be between 3 and 120 characters.' };
  }
  if (message.length < 5 || message.length > 500) {
    return { valid: false, reason: 'Broadcast message must be between 5 and 500 characters.' };
  }
  const type = input.type === 'promo' || input.type === 'order' ? input.type : 'system';
  return {
    valid: true,
    targetRole: input.targetRole as BroadcastTargetRole,
    title,
    message,
    type,
  };
}

