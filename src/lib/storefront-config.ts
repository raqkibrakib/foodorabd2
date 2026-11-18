import type { StorefrontConfig } from '../types/marketplace';

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  brandPrefix: 'foodora',
  brandSuffix: 'bd',
  accentColor: '#E21B70',
  showTopPartnerBar: true,
  showPickupTab: true,
  announcementBarEnabled: false,
  announcementTextEn: 'Flash Offer: Free Dhaka delivery on orders above ৳499 with code DHAKA50!',
  announcementTextBn: 'ফ্ল্যাশ অফার: ৪৯৯৳+ অর্ডারে ফ্রি ঢাকা ডেলিভারি (কোড: DHAKA50)!',
  showHero: true,
  heroBadgeEn: 'Dhaka Launch Offer',
  heroBadgeBn: 'ঢাকা লঞ্চ অফার',
  heroTitleEn: 'Enjoy Free Delivery & 50% Off on your first order',
  heroTitleBn: 'প্রথম অর্ডারে ফ্রি ডেলিভারি ও ৫০% ছাড় উপভোগ করুন',
  heroSubEn:
    'Discover Dhaka’s finest Kacchi Biriyani, gourmet burgers, artisan pizza & home kitchens delivered hot to your door.',
  heroSubBn:
    'ঢাকার সেরা কাচ্চি বিরিয়ানি, বার্গার, পিৎজা ও ঘরোয়া খাবার এখন মুহূর্তেই আপনার দরজায়।',
  heroTrustEn: '30 min avg delivery · bKash & Nagad · Live rider tracking',
  heroTrustBn: 'গড়ে ৩০ মিনিটে ডেলিভারি · বিকাশ ও নগদ · লাইভ রাইডার ট্র্যাকিং',
  heroBtnEn: 'Order Now',
  heroBtnBn: 'এখনই অর্ডার করুন',
  heroImageUrl: '/src/assets/images/hero_e21b70_feast_1794846866285.jpg',
  showPromoTicket: true,
  promoCode: 'FOODORA50',
  promoDescEn: 'Unlock 50% off & free Dhaka delivery on your first order.',
  promoDescBn: 'প্রথম অর্ডারে ৫০% ছাড় ও ফ্রি ডেলিভারি আনলক করুন।',
  showCuisineRibbon: true,
  showDailyDeals: true,
  dailyDealsTitleEn: 'Daily Vouchers & Deals',
  dailyDealsTitleBn: 'দৈনিক ভাউচার ও ডিল',
  restaurantsHeadingEn: 'All Restaurants',
  restaurantsHeadingBn: 'সকল রেস্টুরেন্ট',
  footerDescEn: 'Bangladesh’s full-stack multi-vendor food delivery marketplace.',
  footerDescBn: 'বাংলাদেশের আধুনিক মাল্টি-ভেন্ডর ফুড ডেলিভারি মার্কেটপ্লেস।',
  footerZonesLine1: 'Gulshan 1 & 2 · Banani · Dhanmondi',
  footerZonesLine2: 'Uttara · Mirpur · Bashundhara R/A · Motijheel',
  footerCopyright: '© 2026 Foodora BD',
  maintenanceMode: false,
  maintenanceMessage:
    'Scheduled kitchen & courier maintenance is in progress. Ordering will resume shortly.',
};

export function mergeStorefrontConfig(
  raw?: Partial<StorefrontConfig> | null
): StorefrontConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STOREFRONT_CONFIG };
  }
  const merged = { ...DEFAULT_STOREFRONT_CONFIG };
  for (const key of Object.keys(DEFAULT_STOREFRONT_CONFIG) as Array<keyof StorefrontConfig>) {
    const val = raw[key];
    if (val === undefined || val === null) continue;
    if (typeof DEFAULT_STOREFRONT_CONFIG[key] === 'boolean') {
      (merged as Record<string, unknown>)[key] = Boolean(val);
    } else if (typeof val === 'string') {
      (merged as Record<string, unknown>)[key] = val.trim() ? val : DEFAULT_STOREFRONT_CONFIG[key];
    }
  }
  return merged;
}
