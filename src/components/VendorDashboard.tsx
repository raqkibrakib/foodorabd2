import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Store,
  Trash2,
  Upload,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiFetch } from '../lib/api';
import { DHAKA_AREAS } from '../lib/i18n';
import { buildVendorAnalytics, DeliveryMode, formatBdt } from '../lib/marketplace-logic';
import { DhakaMapPicker } from './DhakaMapPicker';
import type {
  AppUser,
  FoodItem,
  Lang,
  LedgerEntry,
  OrderRecord,
  PayoutRecord,
  Restaurant,
} from '../types/marketplace';

interface VendorDashboardProps {
  user: AppUser;
  lang: Lang;
  mapsApiKey: string;
  initialOnboarding?: boolean;
  onRefreshUser: () => Promise<void>;
  onBack: () => void;
}

export function VendorDashboard({
  user,
  lang,
  mapsApiKey,
  initialOnboarding = false,
  onRefreshUser,
  onBack,
}: VendorDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(initialOnboarding);
  const [tab, setTab] = useState<'orders' | 'analytics' | 'menu' | 'settings' | 'earnings'>('orders');
  const [trendRange, setTrendRange] = useState<'daily' | 'monthly'>('daily');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Multi-step onboarding state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ownerName, setOwnerName] = useState(user.fullName);
  const [restName, setRestName] = useState('');
  const [restNameBn, setRestNameBn] = useState('');
  const [cuisine, setCuisine] = useState('Bangladeshi');
  const [area, setArea] = useState(DHAKA_AREAS[0].name);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: DHAKA_AREAS[0].lat, lng: DHAKA_AREAS[0].lng });
  const [phone, setPhone] = useState('+8801712345678');
  const [email, setEmail] = useState(user.email || 'partner@restaurant.bd');
  const [description, setDescription] = useState('');
  const [tradeLicense, setTradeLicense] = useState('TRAD/DSCC/2026-8841');
  const [nidNumber, setNidNumber] = useState('1991269123456');
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('01712345678');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('platform');
  const [regLogoUrl, setRegLogoUrl] = useState('');
  const [regCoverUrl, setRegCoverUrl] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  // Add food item form
  const [newCategory, setNewCategory] = useState('Main Course');
  const [newName, setNewName] = useState('');
  const [newNameBn, setNewNameBn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('350');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Edit food item modal
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [savingEditItem, setSavingEditItem] = useState(false);

  // TheMealDB culinary inspiration search
  const [mealQuery, setMealQuery] = useState('biryani');
  const [mealResults, setMealResults] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      cuisine: string;
      instructions: string;
      thumbUrl: string;
    }>
  >([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

  // Store settings edit
  const [editFee, setEditFee] = useState('49');
  const [editMinOrder, setEditMinOrder] = useState('150');
  const [editHours, setEditHours] = useState('10:00 AM - 11:30 PM');
  const [editMode, setEditMode] = useState<DeliveryMode>('platform');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Payout request
  const [payoutAmt, setPayoutAmt] = useState('500');

  const canAccessVendorApi =
    user.role === 'restaurant_owner' || user.role === 'admin' || user.role === 'super_admin';

  const loadWorkspace = useCallback(async () => {
    if (!canAccessVendorApi) {
      setShowOnboarding(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{
        restaurant: Restaurant | null;
        menuItems: FoodItem[];
        orders: OrderRecord[];
        ledger: LedgerEntry[];
        payouts: PayoutRecord[];
      }>('/api/vendor/workspace');
      setRestaurant(res.restaurant);
      setMenuItems(res.menuItems);
      setOrders(res.orders);
      setLedger(res.ledger);
      setPayouts(res.payouts);
      if (res.restaurant) {
        setEditFee(String(res.restaurant.deliveryFee));
        setEditMinOrder(String(res.restaurant.minOrder));
        setEditHours(res.restaurant.openingHours);
        setEditMode(res.restaurant.deliveryMode);
        setEditLogoUrl(res.restaurant.logoUrl || '');
        setEditCoverUrl(res.restaurant.coverUrl || '');
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Vendor workspace load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [canAccessVendorApi]);

  useEffect(() => {
    setShowOnboarding(initialOnboarding);
  }, [initialOnboarding]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleRegisterRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReg(true);
    setFeedback(null);
    try {
      const res = await apiFetch<{ restaurant: Restaurant }>('/api/restaurants/register', {
        method: 'POST',
        body: JSON.stringify({
          ownerName,
          name: restName,
          nameBn: restNameBn || restName,
          cuisine,
          area,
          address,
          lat: coords.lat,
          lng: coords.lng,
          phone,
          email,
          description: description || `${restName} — Authentic kitchen in ${area}, Dhaka.`,
          tradeLicense,
          nidNumber,
          payoutMethod,
          payoutAccount,
          logoUrl: regLogoUrl.trim(),
          coverUrl: regCoverUrl.trim(),
          deliveryFee: 49,
          minOrder: 150,
          deliveryMode,
        }),
      });
      setRestaurant(res.restaurant);
      setShowOnboarding(false);
      await onRefreshUser();
      setFeedback(
        lang === 'bn'
          ? 'আপনার রেস্টুরেন্ট আবেদন জমা হয়েছে। সুপার অ্যাডমিন অনুমোদনের পর এটি মার্কেটপ্লেসে দৃশ্যমান হবে।'
          : 'Application submitted! Your restaurant is pending Super Admin approval.'
      );
      await loadWorkspace();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleOrderStatus = async (
    orderId: number,
    status: 'accepted' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
  ) => {
    await apiFetch(`/api/vendor/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadWorkspace();
  };

  const uploadProductPhoto = async (file: File, onSuccess: (url: string) => void) => {
    if (file.size > 4.5 * 1024 * 1024) {
      setFeedback(
        lang === 'bn'
          ? 'ছবির সাইজ ৪.৫ এমবি-র কম হতে হবে।'
          : 'Image must be smaller than 4.5 MB.'
      );
      return;
    }
    setUploadingImage(true);
    setFeedback(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read selected image'));
        reader.readAsDataURL(file);
      });
      const res = await apiFetch<{ imageUrl: string }>('/api/upload-image', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      onSuccess(res.imageUrl);
      setFeedback(lang === 'bn' ? 'ছবি আপলোড সম্পন্ন হয়েছে।' : 'Image uploaded successfully.');
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !newName.trim()) return;
    setAddingItem(true);
    try {
      await apiFetch('/api/vendor/menu', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: restaurant.id,
          category: newCategory,
          name: newName.trim(),
          nameBn: newNameBn.trim() || newName.trim(),
          description: newDesc.trim(),
          imageUrl: newImageUrl.trim() || restaurant.coverUrl,
          price: Number(newPrice) || 250,
          discountPrice: newDiscountPrice ? Number(newDiscountPrice) : null,
          isPopular: true,
        }),
      });
      setNewName('');
      setNewNameBn('');
      setNewDesc('');
      setNewDiscountPrice('');
      setNewImageUrl('');
      setFeedback(lang === 'bn' ? 'নতুন খাবার মেনুতে যুক্ত হয়েছে।' : 'New menu item published.');
      await loadWorkspace();
    } finally {
      setAddingItem(false);
    }
  };

  const handleSaveEditedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEditItem(true);
    try {
      await apiFetch(`/api/vendor/menu/${editingItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          category: editingItem.category,
          name: editingItem.name,
          nameBn: editingItem.nameBn,
          description: editingItem.description,
          imageUrl: editingItem.imageUrl,
          price: Number(editingItem.price),
          discountPrice: editingItem.discountPrice ? Number(editingItem.discountPrice) : null,
          isPopular: editingItem.isPopular,
          inStock: editingItem.inStock,
        }),
      });
      setEditingItem(null);
      setFeedback(lang === 'bn' ? 'মেনু আইটেম আপডেট হয়েছে।' : 'Menu item updated.');
      await loadWorkspace();
    } finally {
      setSavingEditItem(false);
    }
  };

  const handleSearchMeals = async () => {
    setLoadingMeals(true);
    try {
      const res = await apiFetch<{
        meals: Array<{
          id: string;
          name: string;
          category: string;
          cuisine: string;
          instructions: string;
          thumbUrl: string;
        }>;
      }>(`/api/free/meals?q=${encodeURIComponent(mealQuery.trim() || 'biryani')}`);
      setMealResults(res.meals);
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleToggleItemStock = async (item: FoodItem) => {
    await apiFetch(`/api/vendor/menu/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ inStock: !item.inStock }),
    });
    await loadWorkspace();
  };

  const handleDeleteItem = async (itemId: number) => {
    await apiFetch(`/api/vendor/menu/${itemId}`, { method: 'DELETE' });
    await loadWorkspace();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setSavingSettings(true);
    setFeedback(null);
    try {
      await apiFetch('/api/vendor/restaurant', {
        method: 'PATCH',
        body: JSON.stringify({
          restaurantId: restaurant.id,
          openingHours: editHours,
          deliveryFee: Number(editFee) || 0,
          minOrder: Number(editMinOrder) || 0,
          deliveryMode: editMode,
          logoUrl: editLogoUrl.trim(),
          coverUrl: editCoverUrl.trim(),
        }),
      });
      setFeedback(lang === 'bn' ? 'স্টোর সেটিংস ও লোগো আপডেট হয়েছে।' : 'Store settings and branding updated.');
      await loadWorkspace();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Failed to save store settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    await apiFetch('/api/vendor/restaurant', {
      method: 'PATCH',
      body: JSON.stringify({
        restaurantId: restaurant.id,
        isOpen: !restaurant.isOpen,
      }),
    });
    await loadWorkspace();
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    await apiFetch('/api/vendor/payouts', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: restaurant.id,
        amount: Number(payoutAmt) || 500,
      }),
    });
    setFeedback(lang === 'bn' ? 'পেআউট অনুরোধ পাঠানো হয়েছে।' : 'Payout request submitted.');
    await loadWorkspace();
  };

  const totalGross = ledger.reduce((s, l) => s + l.grossAmount, 0);
  const totalNet = ledger.reduce((s, l) => s + l.netRestaurantAmount, 0);
  const analytics = useMemo(
    () => buildVendorAnalytics(orders, ledger, menuItems),
    [orders, ledger, menuItems]
  );
  const activeTrendSeries =
    trendRange === 'daily' ? analytics.dailySeries : analytics.monthlySeries;
  const topChartItems = analytics.topSellingItems.slice(0, 6).map((item) => ({
    ...item,
    shortName:
      (lang === 'bn' ? item.nameBn : item.name).length > 18
        ? `${(lang === 'bn' ? item.nameBn : item.name).slice(0, 17)}…`
        : lang === 'bn'
        ? item.nameBn
        : item.name,
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-44 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-sm text-neutral-500">
          {lang === 'bn' ? 'ভেন্ডর ড্যাশবোর্ড লোড হচ্ছে...' : 'Loading Restaurant Partner Hub...'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#E21B70]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'মার্কেটপ্লেসে ফিরুন' : 'Back to Storefront'}</span>
        </button>

        {restaurant && (
          <button
            type="button"
            onClick={() => setShowOnboarding((v) => !v)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-[#E21B70]"
          >
            {showOnboarding
              ? lang === 'bn'
                ? 'ড্যাশবোর্ডে ফিরুন'
                : 'Back to Vendor Dashboard'
              : lang === 'bn'
              ? '+ নতুন রেস্টুরেন্ট আবেদন'
              : '+ Register New Restaurant'}
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {showOnboarding || !restaurant ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#E21B70]">
              {lang === 'bn' ? 'রেস্টুরেন্ট পার্টনার অনবোর্ডিং' : 'Multi-Vendor Onboarding'}
            </p>
            <h1 className="text-2xl font-bold text-[#2E3138] mt-1">
              {lang === 'bn'
                ? 'Foodora BD-তে আপনার রেস্টুরেন্ট যুক্ত করুন'
                : 'Launch Your Restaurant on Foodora BD'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              {lang === 'bn'
                ? 'ট্রেড লাইসেন্স ও এনআইডি তথ্য দিয়ে আবেদন করুন। অনুমোদনের পর সরাসরি অর্ডার নিন।'
                : 'Complete business verification, Dhaka kitchen coordinates, and payout setup.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            {[
              { id: 1 as const, label: lang === 'bn' ? '১. রেস্টুরেন্ট তথ্য' : '1. Business Profile' },
              { id: 2 as const, label: lang === 'bn' ? '২. ঠিকানা ও ম্যাপ পিন' : '2. Location & Delivery' },
              { id: 3 as const, label: lang === 'bn' ? '৩. লাইসেন্স ও পেআউট' : '3. KYC & Payouts' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`py-2.5 px-3 rounded-xl border text-center ${
                  step === s.id
                    ? 'border-[#E21B70] bg-[#FFF0F6] text-[#E21B70]'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegisterRestaurant} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'মালিকের নাম' : 'Owner Full Name'}
                    </label>
                    <input
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'কুইজিন ধরন' : 'Primary Cuisine'}
                    </label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                    >
                      {['Bangladeshi', 'Biriyani', 'Burger', 'Pizza', 'Kabab', 'Chinese', 'Bakery', 'Drinks'].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Restaurant Name (English)
                    </label>
                    <input
                      required
                      value={restName}
                      onChange={(e) => setRestName(e.target.value)}
                      placeholder="e.g. Dhaka Heritage Kitchen"
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      রেস্টুরেন্টের নাম (বাংলা)
                    </label>
                    <input
                      required
                      value={restNameBn}
                      onChange={(e) => setRestNameBn(e.target.value)}
                      placeholder="যেমন: ঢাকা হেরিটেজ কিচেন"
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {lang === 'bn' ? 'রেস্টুরেন্ট বিবরণ' : 'Short Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Authentic charcoal kababs, biriyani & Bengali platters"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'রেস্টুরেন্ট লোগো (ঐচ্ছিক)' : 'Restaurant Logo (Optional)'}
                    </label>
                    <div className="flex items-center gap-2">
                      {regLogoUrl && (
                        <img
                          src={regLogoUrl}
                          alt="Logo preview"
                          className="w-9 h-9 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] text-xs font-semibold shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = '';
                            if (f) uploadProductPhoto(f, (url) => setRegLogoUrl(url));
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={regLogoUrl}
                        onChange={(e) => setRegLogoUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 min-w-0 px-2.5 py-2 text-xs border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'কভার ছবি (ঐচ্ছিক)' : 'Cover Image (Optional)'}
                    </label>
                    <div className="flex items-center gap-2">
                      {regCoverUrl && (
                        <img
                          src={regCoverUrl}
                          alt="Cover preview"
                          className="w-12 h-9 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] text-xs font-semibold shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Cover'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = '';
                            if (f) uploadProductPhoto(f, (url) => setRegCoverUrl(url));
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={regCoverUrl}
                        onChange={(e) => setRegCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 min-w-0 px-2.5 py-2 text-xs border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next: Location'} →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'ঢাকা এলাকা' : 'Dhaka Zone'}
                    </label>
                    <select
                      value={area}
                      onChange={(e) => {
                        const found = DHAKA_AREAS.find((a) => a.name === e.target.value);
                        setArea(e.target.value);
                        if (found) setCoords({ lat: found.lat, lng: found.lng });
                      }}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                    >
                      {DHAKA_AREAS.map((a) => (
                        <option key={a.name} value={a.name}>
                          {a.name} ({a.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'ডেলিভারি মডেল' : 'Delivery Fulfillment Mode'}
                    </label>
                    <select
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="platform">Foodora BD Riders (Platform Fleet)</option>
                      <option value="third_party">Pathao Courier Integration</option>
                      <option value="restaurant">Restaurant Own Fleet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {lang === 'bn' ? 'বিস্তারিত কিচেন ঠিকানা' : 'Full Kitchen Address'}
                  </label>
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={`Road 12, House 8, ${area}, Dhaka`}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>

                <DhakaMapPicker
                  mapsApiKey={mapsApiKey}
                  lang={lang}
                  center={coords}
                  markerLabel={restName || area}
                  interactive
                  heightClass="h-[200px]"
                  onSelectLocation={(c) => {
                    setCoords({ lat: c.lat, lng: c.lng });
                    if (c.areaName) setArea(c.areaName);
                  }}
                />

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                  >
                    ← {lang === 'bn' ? 'পূর্ববর্তী' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'পরবর্তী: লাইসেন্স ও পেআউট' : 'Next: KYC & Payouts'} →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'বিজনেস ফোন' : 'Business Phone'}
                    </label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'ব্যবসায়িক ইমেইল' : 'Business Email'}
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'ট্রেড লাইসেন্স নম্বর' : 'Trade License Number'}
                    </label>
                    <input
                      required
                      value={tradeLicense}
                      onChange={(e) => setTradeLicense(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'মালিকের এনআইডি (NID)' : 'Owner NID Number'}
                    </label>
                    <input
                      required
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'পেআউট মাধ্যম' : 'Payout Method'}
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value as 'bkash' | 'nagad' | 'bank')}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="bkash">bKash Merchant / Personal</option>
                      <option value="nagad">Nagad Merchant</option>
                      <option value="bank">Bank Account (BEFTN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {lang === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Payout Account Number'}
                    </label>
                    <input
                      required
                      value={payoutAccount}
                      onChange={(e) => setPayoutAccount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                  >
                    ← {lang === 'bn' ? 'পূর্ববর্তী' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReg}
                    className="px-6 py-2.5 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {submittingReg
                      ? lang === 'bn'
                        ? 'আবেদন জমা হচ্ছে...'
                        : 'Submitting...'
                      : lang === 'bn'
                      ? 'আবেদন জমা দিন'
                      : 'Submit Partner Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <>
          {/* Vendor Header & KPI Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {restaurant.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-200 bg-white shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] text-[#E21B70] flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#2E3138]">
                    {lang === 'bn' ? restaurant.nameBn : restaurant.name}
                  </h1>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      restaurant.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {restaurant.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {restaurant.area} · {restaurant.cuisine} · Commission: {restaurant.commissionRate}% · Plan:{' '}
                  {restaurant.subscriptionPlan.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleOpen}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  restaurant.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {restaurant.isOpen
                  ? lang === 'bn'
                    ? 'দোকান খোলা আছে (বন্ধ করুন)'
                    : 'Kitchen Open (Click to Pause)'
                  : lang === 'bn'
                  ? 'দোকান বন্ধ আছে (খুলুন)'
                  : 'Kitchen Paused (Click to Open)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</p>
              <p className="text-2xl font-bold text-[#2E3138] mt-1">{orders.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মেনু আইটেম' : 'Menu Items'}</p>
              <p className="text-2xl font-bold text-[#2E3138] mt-1">{menuItems.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট বিক্রি' : 'Settled Gross'}</p>
              <p className="text-2xl font-bold text-[#2E3138] mt-1">{formatBdt(totalGross, lang)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">{lang === 'bn' ? 'নিট আয়' : 'Net Vendor Earnings'}</p>
              <p className="text-2xl font-bold text-[#E21B70] mt-1">{formatBdt(totalNet, lang)}</p>
            </div>
          </div>

          {/* Vendor Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders' as const, labelBn: 'লাইভ অর্ডার', labelEn: 'Orders', icon: ClipboardList },
              { id: 'analytics' as const, labelBn: 'বিক্রয় ও ট্রেন্ড অ্যানালিটিক্স', labelEn: 'Analytics (Charts)', icon: BarChart3 },
              { id: 'menu' as const, labelBn: 'মেনু পরিচালনা', labelEn: 'Menu CRUD', icon: Utensils },
              { id: 'earnings' as const, labelBn: 'কমিশন ও পেআউট', labelEn: 'Ledger & Payouts', icon: Wallet },
              { id: 'settings' as const, labelBn: 'স্টোর সেটিংস', labelEn: 'Store Settings', icon: Settings },
            ].map((tItem) => {
              const Icon = tItem.icon;
              return (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setTab(tItem.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border ${
                    tab === tItem.id
                      ? 'bg-[#E21B70] text-white border-[#E21B70]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? tItem.labelBn : tItem.labelEn}</span>
                </button>
              );
            })}
          </div>

          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-sm text-neutral-500">
                  {lang === 'bn' ? 'এখনও কোনো অর্ডার আসেনি।' : 'No orders received for this kitchen yet.'}
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono-nums text-neutral-500">
                        {ord.orderNumber} · {ord.customerName} ({ord.customerPhone}) · {ord.deliveryMode}
                      </p>
                      <p className="font-bold text-sm text-[#2E3138]">
                        {ord.itemsSnapshotJson
                          .map((i) => `${i.quantity}x ${lang === 'bn' ? i.nameBn : i.name}`)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {ord.deliveryArea} — {ord.deliveryAddress}
                      </p>
                      <p className="text-xs font-semibold text-[#E21B70] uppercase">
                        Status: {ord.status.replace(/_/g, ' ')} · Vendor Net: {formatBdt(ord.restaurantEarnings, lang)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {ord.status === 'confirmed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOrderStatus(ord.id, 'accepted')}
                            className="px-3 py-1.5 rounded-lg bg-[#E21B70] text-white text-xs font-semibold"
                          >
                            {lang === 'bn' ? 'গ্রহণ করুন' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderStatus(ord.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Reject'}
                          </button>
                        </>
                      )}
                      {ord.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatus(ord.id, 'preparing')}
                          className="px-3 py-1.5 rounded-lg bg-[#2E3138] text-white text-xs font-semibold"
                        >
                          {lang === 'bn' ? 'রান্না শুরু' : 'Mark Preparing'}
                        </button>
                      )}
                      {ord.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatus(ord.id, 'ready')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                        >
                          {lang === 'bn' ? 'পিকআপের জন্য প্রস্তুত' : 'Mark Ready'}
                        </button>
                      )}
                      {(ord.status === 'ready' || ord.status === 'rider_assigned' || ord.status === 'picked_up') &&
                        ord.deliveryMode === 'restaurant' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatus(ord.id, 'delivered')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
                          >
                            {lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Mark Delivered'}
                          </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'analytics' && (
            <div className="space-y-6" data-testid="vendor-analytics-panel">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-base text-[#2E3138]">
                    {lang === 'bn'
                      ? 'দৈনিক ও মাসিক অর্ডার, আয় এবং জনপ্রিয় খাবার বিশ্লেষণ'
                      : 'Order Trends, Revenue & Top-Selling Food Analytics'}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {lang === 'bn'
                      ? 'আপনার কিচেনের রিয়েল-টাইম অর্ডার ডেটা থেকে তৈরি চার্ট'
                      : 'Live performance metrics computed from non-cancelled restaurant orders'}
                  </p>
                </div>

                <div className="inline-flex rounded-xl border border-neutral-200 p-1 bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => setTrendRange('daily')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      trendRange === 'daily'
                        ? 'bg-[#E21B70] text-white'
                        : 'text-neutral-600 hover:text-[#2E3138]'
                    }`}
                  >
                    {lang === 'bn' ? 'দৈনিক' : 'Daily View'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendRange('monthly')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      trendRange === 'monthly'
                        ? 'bg-[#E21B70] text-white'
                        : 'text-neutral-600 hover:text-[#2E3138]'
                    }`}
                  >
                    {lang === 'bn' ? 'মাসিক' : 'Monthly View'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
                <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{lang === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}</p>
                  <p className="text-2xl font-bold text-[#2E3138] mt-1">{analytics.totalOrders}</p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{analytics.deliveredOrders}</p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{lang === 'bn' ? 'গড় অর্ডার মূল্য' : 'Avg Order Value'}</p>
                  <p className="text-2xl font-bold text-[#2E3138] mt-1">
                    {formatBdt(analytics.avgOrderValue, lang)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট আয় (নিট)' : 'Net Food Revenue'}</p>
                  <p className="text-2xl font-bold text-[#E21B70] mt-1">
                    {formatBdt(analytics.netVendorRevenue, lang)}
                  </p>
                </div>
              </div>

              {activeTrendSeries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-sm text-neutral-500">
                  {lang === 'bn'
                    ? 'চার্ট দেখার জন্য এখনও কোনো অর্ডার ডেটা নেই।'
                    : 'No order data yet to render revenue trends.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Revenue Trend AreaChart */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5">
                    <h3 className="font-bold text-sm text-[#2E3138] mb-1">
                      {trendRange === 'daily'
                        ? lang === 'bn'
                          ? 'দৈনিক বিক্রয় ও নিট আয় (৳)'
                          : 'Daily Gross Sales vs Net Vendor Revenue (৳)'
                        : lang === 'bn'
                        ? 'মাসিক বিক্রয় ও নিট আয় (৳)'
                        : 'Monthly Gross Sales vs Net Vendor Revenue (৳)'}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      {lang === 'bn' ? 'কমিশন বাদে রেস্টুরেন্টের প্রকৃত আয়' : 'Comparing gross food sales and net vendor payout'}
                    </p>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeTrendSeries.length < 2 ? (
                          <BarChart data={activeTrendSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip
                              formatter={(val: unknown) => [`৳${Number(val || 0).toLocaleString()}`, undefined]}
                              contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                              dataKey="grossRevenue"
                              name={lang === 'bn' ? 'মোট বিক্রয় (৳)' : 'Gross Sales (৳)'}
                              fill="#2E3138"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={72}
                            />
                            <Bar
                              dataKey="netRevenue"
                              name={lang === 'bn' ? 'নিট আয় (৳)' : 'Net Earnings (৳)'}
                              fill="#E21B70"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={72}
                            />
                          </BarChart>
                        ) : (
                          <AreaChart data={activeTrendSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="vendorNetGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E21B70" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#E21B70" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip
                              formatter={(val: unknown) => [`৳${Number(val || 0).toLocaleString()}`, undefined]}
                              contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area
                              type="monotone"
                              dataKey="grossRevenue"
                              name={lang === 'bn' ? 'মোট বিক্রয় (৳)' : 'Gross Sales (৳)'}
                              stroke="#2E3138"
                              strokeWidth={2}
                              fillOpacity={0.08}
                              fill="#2E3138"
                            />
                            <Area
                              type="monotone"
                              dataKey="netRevenue"
                              name={lang === 'bn' ? 'নিট আয় (৳)' : 'Net Earnings (৳)'}
                              stroke="#E21B70"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#vendorNetGrad)"
                            />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Volume BarChart */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5">
                    <h3 className="font-bold text-sm text-[#2E3138] mb-1">
                      {trendRange === 'daily'
                        ? lang === 'bn'
                          ? 'দৈনিক অর্ডার সংখ্যা'
                          : 'Daily Order Volume'
                        : lang === 'bn'
                        ? 'মাসিক অর্ডার সংখ্যা'
                        : 'Monthly Order Volume'}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      {lang === 'bn' ? 'প্রতিদিন বা প্রতি মাসে প্রাপ্ত অর্ডার' : 'Total non-cancelled orders per period'}
                    </p>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeTrendSeries} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', fontSize: 12 }} />
                          <Bar
                            dataKey="orders"
                            name={lang === 'bn' ? 'অর্ডার সংখ্যা' : 'Orders'}
                            fill="#E21B70"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top-Selling Food Items Chart & Table */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-5">
                    <h3 className="font-bold text-sm text-[#2E3138] mb-1">
                      {lang === 'bn' ? 'সবচেয়ে বেশি বিক্রিত খাবার' : 'Top-Selling Food Items (Units Sold)'}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      {lang === 'bn' ? 'পরিমাণ অনুযায়ী সেরা ৬টি আইটেম' : 'Ranked by total portions ordered'}
                    </p>
                    {topChartItems.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-10 text-center">No dish breakdown yet.</p>
                    ) : (
                      <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={topChartItems}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis
                              type="category"
                              dataKey="shortName"
                              width={125}
                              tick={{ fontSize: 11, fill: '#2E3138' }}
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', fontSize: 12 }}
                            />
                            <Bar
                              dataKey="quantitySold"
                              name={lang === 'bn' ? 'বিক্রিত সংখ্যা' : 'Units Sold'}
                              radius={[0, 6, 6, 0]}
                            >
                              {topChartItems.map((_, idx) => (
                                <Cell
                                  key={`cell-${idx}`}
                                  fill={idx === 0 ? '#E21B70' : idx === 1 ? '#C4135E' : '#33373D'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-5 overflow-x-auto">
                    <h3 className="font-bold text-sm text-[#2E3138] mb-3">
                      {lang === 'bn' ? 'শীর্ষ বিক্রিত পণ্যের তালিকা' : 'Top Dish Revenue Breakdown'}
                    </h3>
                    <table className="w-full text-xs text-left tabular-nums">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500">
                          <th className="py-2">#</th>
                          <th className="py-2">Dish</th>
                          <th className="py-2 text-right">Qty Sold</th>
                          <th className="py-2 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topSellingItems.slice(0, 8).map((item, idx) => (
                          <tr key={`${item.foodItemId}-${item.name}`} className="border-b border-neutral-100">
                            <td className="py-2.5 font-bold text-[#E21B70]">{idx + 1}</td>
                            <td className="py-2.5">
                              <p className="font-semibold text-[#2E3138]">
                                {lang === 'bn' ? item.nameBn : item.name}
                              </p>
                              <p className="text-[11px] text-neutral-400">{item.category}</p>
                            </td>
                            <td className="py-2.5 text-right font-semibold">{item.quantitySold}</td>
                            <td className="py-2.5 text-right font-bold text-emerald-700">
                              {formatBdt(item.revenue, lang)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'menu' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleAddFoodItem}
                className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 h-fit"
              >
                <h2 className="font-bold text-sm text-[#2E3138] flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#E21B70]" />
                  <span>{lang === 'bn' ? 'নতুন খাবার যোগ করুন' : 'Add New Menu Item'}</span>
                </h2>

                {/* Free TheMealDB Recipe Inspiration Search */}
                <div className="p-3 rounded-xl bg-[#FFF0F6] border border-[#E21B70]/20 space-y-2">
                  <p className="text-[11px] font-bold text-[#E21B70] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'bn'
                        ? 'রেসিপি আইডিয়া খুঁজুন (TheMealDB)'
                        : 'Recipe Quick-Fill (TheMealDB Free API)'}
                    </span>
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={mealQuery}
                      onChange={(e) => setMealQuery(e.target.value)}
                      placeholder="e.g. biryani, chicken, burger"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E21B70]"
                    />
                    <button
                      type="button"
                      onClick={handleSearchMeals}
                      disabled={loadingMeals}
                      className="px-2.5 py-1.5 rounded-lg bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{loadingMeals ? '...' : lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                    </button>
                  </div>
                  {mealResults.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                      {mealResults.map((meal) => (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => {
                            setNewName(meal.name);
                            setNewCategory(meal.category || 'Main Course');
                            setNewDesc(meal.instructions);
                          }}
                          className="w-full p-2 rounded-lg bg-white hover:border-[#E21B70] border border-neutral-200 flex items-center gap-2 text-left transition-colors"
                        >
                          <img
                            src={meal.thumbUrl}
                            alt={meal.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded object-cover shrink-0 bg-neutral-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#2E3138] truncate">{meal.name}</p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {meal.category} · {meal.cuisine}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <input
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Dish Name (English)</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Chicken Dum Biriyani"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">খাবারের নাম (বাংলা)</label>
                  <input
                    required
                    value={newNameBn}
                    onChange={(e) => setNewNameBn(e.target.value)}
                    placeholder="যেমন: চিকেন দম বিরিয়ানি"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Price (BDT ৳)</label>
                    <input
                      required
                      type="number"
                      min="20"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Offer Price (Optional)
                    </label>
                    <input
                      type="number"
                      min="10"
                      placeholder="e.g. 299"
                      value={newDiscountPrice}
                      onChange={(e) => setNewDiscountPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    {lang === 'bn' ? 'খাবারের ছবি আপলোড / URL' : 'Dish Photo (Upload or URL)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] text-xs font-semibold text-[#2E3138]">
                      <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadProductPhoto(file, (url) => setNewImageUrl(url));
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://... or /uploads/..."
                      className="flex-1 min-w-0 px-2.5 py-2 text-xs border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingItem || uploadingImage}
                  className="w-full py-2.5 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {addingItem
                    ? lang === 'bn'
                      ? 'যোগ হচ্ছে...'
                      : 'Adding...'
                    : lang === 'bn'
                    ? 'মেনুতে যোগ করুন'
                    : 'Publish Menu Item'}
                </button>
              </form>

              <div className="lg:col-span-8 space-y-3">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-100"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] text-neutral-500 uppercase">{item.category}</p>
                        <h3 className="font-bold text-sm text-[#2E3138] truncate">
                          {lang === 'bn' ? item.nameBn : item.name}
                        </h3>
                        <p className="text-xs font-bold text-[#E21B70] tabular-nums">
                          {formatBdt(item.discountPrice ?? item.price, lang)}
                          {item.discountPrice && (
                            <span className="ml-2 text-neutral-400 line-through font-normal">
                              {formatBdt(item.price, lang)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...item })}
                        aria-label={`Edit ${item.name}`}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-[#E21B70] inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleItemStock(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          item.inStock
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.inStock ? (lang === 'bn' ? 'স্টকে আছে' : 'In Stock') : 'Out of Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'earnings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-5 overflow-x-auto">
                <h2 className="font-bold text-sm text-[#2E3138] mb-3">
                  {lang === 'bn' ? 'কমিশন ও নিট আয়ের হিসাব' : 'Immutable Commission Ledger'}
                </h2>
                <table className="w-full text-xs text-left tabular-nums">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-2">Type</th>
                      <th className="py-2">Note</th>
                      <th className="py-2 text-right">Gross</th>
                      <th className="py-2 text-right">Commission</th>
                      <th className="py-2 text-right">Net Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((row) => (
                      <tr key={row.id} className="border-b border-neutral-100">
                        <td className="py-2.5 font-semibold uppercase">{row.entryType.replace('_', ' ')}</td>
                        <td className="py-2.5 text-neutral-600">{row.note}</td>
                        <td className="py-2.5 text-right">{formatBdt(row.grossAmount, lang)}</td>
                        <td className="py-2.5 text-right text-amber-700">{formatBdt(row.commissionAmount, lang)}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">
                          {formatBdt(row.netRestaurantAmount, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <form
                  onSubmit={handleRequestPayout}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3"
                >
                  <h2 className="font-bold text-sm text-[#2E3138]">
                    {lang === 'bn' ? 'পেআউট অনুরোধ করুন' : 'Request Vendor Payout'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {restaurant.payoutMethod.toUpperCase()} · {restaurant.payoutAccount}
                  </p>
                  <input
                    type="number"
                    min="100"
                    value={payoutAmt}
                    onChange={(e) => setPayoutAmt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg tabular-nums"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'পেআউট সাবমিট করুন' : 'Submit Payout Request'}
                  </button>
                </form>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2.5">
                  <h3 className="font-bold text-xs text-neutral-700 uppercase">
                    {lang === 'bn' ? 'সাম্প্রতিক পেআউট' : 'Payout History'}
                  </h3>
                  {payouts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                      <div>
                        <p className="font-semibold text-[#2E3138] tabular-nums">{formatBdt(p.amount, lang)}</p>
                        <p className="text-neutral-500 uppercase">{p.method}</p>
                      </div>
                      <span className="font-bold uppercase text-neutral-700">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <form
              onSubmit={handleSaveSettings}
              className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl space-y-4"
            >
              <h2 className="font-bold text-base text-[#2E3138]">
                {lang === 'bn'
                  ? 'লোগো, ব্র্যান্ডিং ও ডেলিভারি সেটিংস'
                  : 'Restaurant Branding, Logo & Delivery Settings'}
              </h2>

              <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-[#FAFAFB] border border-neutral-200">
                <div className="space-y-1.5 text-xs">
                  <label className="block font-semibold text-neutral-700">
                    {lang === 'bn' ? 'রেস্টুরেন্ট লোগো ছবি (Logo)' : 'Restaurant Logo Image'}
                  </label>
                  <div className="flex items-center gap-2.5">
                    {editLogoUrl ? (
                      <img
                        src={editLogoUrl}
                        alt="Restaurant logo"
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl border border-dashed border-neutral-300 bg-white flex items-center justify-center text-neutral-400 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:border-[#E21B70] font-semibold shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) uploadProductPhoto(f, (url) => setEditLogoUrl(url));
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                      placeholder="https://... or /uploads/..."
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white"
                    />
                    {editLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditLogoUrl('')}
                        aria-label="Clear restaurant logo"
                        className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-semibold text-neutral-700">
                    {lang === 'bn' ? 'রেস্টুরেন্ট কভার ছবি (Cover Banner)' : 'Storefront Cover Image'}
                  </label>
                  <div className="flex items-center gap-2.5">
                    {editCoverUrl && (
                      <img
                        src={editCoverUrl}
                        alt="Restaurant cover"
                        className="w-16 h-12 rounded-lg object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                      />
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:border-[#E21B70] font-semibold shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Cover'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) uploadProductPhoto(f, (url) => setEditCoverUrl(url));
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editCoverUrl}
                      onChange={(e) => setEditCoverUrl(e.target.value)}
                      placeholder="https://... or /uploads/..."
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Opening Hours</label>
                  <input
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Mode</label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as DeliveryMode)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="platform">Foodora Own Rider</option>
                    <option value="third_party">Pathao Courier</option>
                    <option value="restaurant">Restaurant Own Fleet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Fee (BDT ৳)</label>
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Minimum Order (BDT ৳)</label>
                  <input
                    type="number"
                    value={editMinOrder}
                    onChange={(e) => setEditMinOrder(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingSettings || uploadingImage}
                className="px-5 py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold disabled:opacity-50"
              >
                {savingSettings
                  ? lang === 'bn'
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : lang === 'bn'
                  ? 'সেটিংস ও লোগো সংরক্ষণ করুন'
                  : 'Save Settings & Branding'}
              </button>
            </form>
          )}
          {editingItem && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveEditedItem}
                className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#2E3138]">
                    {lang === 'bn' ? 'মেনু আইটেম সম্পাদনা' : 'Edit Menu Item'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    aria-label="Close edit item dialog"
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                    <input
                      required
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Name (EN)</label>
                    <input
                      required
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Name (BN)</label>
                    <input
                      required
                      value={editingItem.nameBn}
                      onChange={(e) => setEditingItem({ ...editingItem, nameBn: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Price (৳)</label>
                    <input
                      required
                      type="number"
                      min="10"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Offer Price (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingItem.discountPrice ?? ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          discountPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isPopular}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, isPopular: e.target.checked })
                        }
                      />
                      <span>Popular Dish</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">Dish Image</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                      <span>Upload New</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadProductPhoto(file, (url) =>
                              setEditingItem((prev) => (prev ? { ...prev, imageUrl: url } : null))
                            );
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingItem.imageUrl}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEditItem}
                    className="px-5 py-2 rounded-xl bg-[#E21B70] text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {savingEditItem ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
