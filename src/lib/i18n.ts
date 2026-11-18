import type { Lang } from '../types/marketplace';

export const copy = {
  bn: {
    partnerCta: 'রেস্টুরেন্ট পার্টনার হোন',
    riderCta: 'রাইডার পোর্টাল',
    adminCta: 'অ্যাডমিন প্যানেল',
    selectAddress: 'আপনার ঠিকানা নির্বাচন করুন',
    login: 'লগইন',
    signup: 'সাইন আপ',
    delivery: 'ডেলিভারি',
    pickup: 'পিক আপ',
    searchPlaceholder: 'রেস্টুরেন্ট, কুইজিন এবং বিভিন্ন প্রকার খাবার খুঁজুন...',
    heroBadge: 'ঢাকা স্পেশাল অফার',
    heroHeadline: 'আপনার প্রথম অর্ডারে ফ্রি ডেলিভারি ও ৫০% ছাড় উপভোগ করুন',
    heroSub: 'ঢাকার সেরা রেস্টুরেন্ট, কাচ্চি বিরিয়ানি, বার্গার ও ঘরোয়া খাবার এখন ৩০ মিনিটেই হাতের নাগালে।',
    heroBtn: 'অর্ডার করুন',
    heroTrust: '৩০ মিনিট গড় ডেলিভারি · বিকাশ ও নগদ পেমেন্ট · লাইভ রাইডার ট্র্যাকিং',
    favCuisines: 'আপনার পছন্দের কুইজিন',
    dailyDeals: 'আপনার প্রতিদিনের ভাউচার ও ডিল',
    allRestaurants: 'সব রেস্টুরেন্ট',
    filters: 'ফিল্টার',
    sortBy: 'সাজান',
    relevance: 'জনপ্রিয়তা',
    rating: 'সেরা রেটিং',
    fastest: 'দ্রুত ডেলিভারি',
    lowFee: 'কম ডেলিভারি ফি',
    offers: 'অফার ও ছাড়',
    hasDiscount: 'ডিসকাউন্ট অফার',
    freeFirstOrder: 'ফ্রি ডেলিভারি অফার',
    priceRange: 'দামের ধরন',
    deliveryFilter: 'ডেলিভারি পার্টনার',
    cuisineFilter: 'কুইজিন',
    clearFilters: 'সব রিসেট করুন',
    sponsored: 'বিজ্ঞাপন',
    newBadge: 'নতুন',
    minFrom: 'মিনিট',
    firstOrderFree: 'ফ্রি ডেলিভারি ডিল',
    discountOff: '% ছাড়',
    noResults: 'কোনো রেস্টুরেন্ট পাওয়া যায়নি',
    cart: 'কার্ট',
    checkout: 'চেকআউট করুন',
    addToCart: 'কার্টে যোগ করুন',
    myOrders: 'আমার অর্ডার',
    myAccount: 'আমার প্রোফাইল',
    minOrderLabel: 'ন্যূনতম অর্ডার',
  },
  en: {
    partnerCta: 'Become a Restaurant Partner',
    riderCta: 'Rider Portal',
    adminCta: 'Super Admin',
    selectAddress: 'Select your delivery address',
    login: 'Log in',
    signup: 'Sign up',
    delivery: 'Delivery',
    pickup: 'Pickup',
    searchPlaceholder: 'Search restaurants, cuisines, and dishes across Dhaka...',
    heroBadge: 'Dhaka Launch Offer',
    heroHeadline: 'Enjoy Free Delivery & 50% Off on your first order',
    heroSub: 'Discover Dhaka’s finest Kacchi Biriyani, gourmet burgers, artisan pizza & home kitchens delivered hot to your door.',
    heroBtn: 'Order Now',
    heroTrust: '30 min avg delivery · bKash & Nagad · Live rider tracking',
    favCuisines: 'Explore by Cuisine',
    dailyDeals: 'Daily Vouchers & Deals',
    allRestaurants: 'All Restaurants',
    filters: 'Filters',
    sortBy: 'Sort by',
    relevance: 'Relevance',
    rating: 'Top Rated',
    fastest: 'Fastest Delivery',
    lowFee: 'Lowest Delivery Fee',
    offers: 'Offers & Deals',
    hasDiscount: 'Active Discounts',
    freeFirstOrder: 'Low / Free Delivery',
    priceRange: 'Price Tier',
    deliveryFilter: 'Delivery Fleet',
    cuisineFilter: 'Cuisines',
    clearFilters: 'Reset all',
    sponsored: 'Sponsored',
    newBadge: 'New',
    minFrom: 'mins',
    firstOrderFree: 'Free delivery deal',
    discountOff: '% off',
    noResults: 'No matching restaurants found',
    cart: 'Cart',
    checkout: 'Proceed to Checkout',
    addToCart: 'Add to Cart',
    myOrders: 'My Orders',
    myAccount: 'My Account',
    minOrderLabel: 'Min order',
  },
} as const;

export function t(lang: Lang, key: keyof (typeof copy)['bn']): string {
  return copy[lang][key];
}

export function localizeCouponTitle(code: string, dbTitle: string, lang: Lang): string {
  const upper = code.trim().toUpperCase();
  if (lang === 'en') {
    if (upper === 'FOODORA50') return '50% off on your 1st order (up to ৳150)';
    if (upper === 'DHAKA15') return 'Flat 15% off across all Dhaka restaurants';
    if (upper === 'FREEDEL') return 'Free delivery on orders of ৳200+';
  }
  return dbTitle;
}

export const DHAKA_AREAS = [
  { name: 'Gulshan 2', nameBn: 'গুলশান ২', lat: 23.7949, lng: 90.4144 },
  { name: 'Banani', nameBn: 'বনানী', lat: 23.7937, lng: 90.4066 },
  { name: 'Dhanmondi 27', nameBn: 'ধানমন্ডি ২৭', lat: 23.7518, lng: 90.3712 },
  { name: 'Gulshan 1', nameBn: 'গুলশান ১', lat: 23.7811, lng: 90.4167 },
  { name: 'Uttara Sector 7', nameBn: 'উত্তরা সেক্টর ৭', lat: 23.8682, lng: 90.3991 },
  { name: 'Mirpur 10', nameBn: 'মিরপুর ১০', lat: 23.8069, lng: 90.3687 },
  { name: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আবাসিক এলাকা', lat: 23.8191, lng: 90.4526 },
  { name: 'Motijheel', nameBn: 'মতিঝিল', lat: 23.7272, lng: 90.4198 },
];

export const CUISINE_CATEGORIES = [
  { id: 'All', labelBn: 'সবগুলো', labelEn: 'All', img: '/src/assets/images/hero_dhaka_feast_1794831374659.jpg' },
  { id: 'Biriyani', labelBn: 'বিরিয়ানি', labelEn: 'Biriyani', img: '/src/assets/images/food_kacchi_biriyani_1794831373742.jpg' },
  { id: 'Pizza', labelBn: 'পিৎজা', labelEn: 'Pizza', img: '/src/assets/images/food_artisan_pizza_1794831375026.jpg' },
  { id: 'Burger', labelBn: 'বার্গার', labelEn: 'Burger', img: '/src/assets/images/food_gourmet_burger_1794831375029.jpg' },
  { id: 'Bangladeshi', labelBn: 'বাংলাদেশী', labelEn: 'Bangladeshi', img: '/src/assets/images/food_bangla_platter_1794831377030.jpg' },
  { id: 'Kabab', labelBn: 'কাবাব', labelEn: 'Kabab', img: '/src/assets/images/food_tandoori_kabab_1794831377175.jpg' },
  { id: 'Chinese', labelBn: 'চাইনিজ ও মোমো', labelEn: 'Chinese & Momos', img: '/src/assets/images/food_asian_momos_1794831375934.jpg' },
  { id: 'Bakery', labelBn: 'কেক ও বেকারি', labelEn: 'Bakery & Cakes', img: '/src/assets/images/food_cafe_dessert_1794831375892.jpg' },
  { id: 'Drinks', labelBn: 'কফি ও পানীয়', labelEn: 'Coffee & Drinks', img: '/src/assets/images/food_cafe_dessert_1794831375892.jpg' },
];
