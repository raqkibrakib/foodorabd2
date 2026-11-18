import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Bell,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
<<<<<<< HEAD
  KeyRound,
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
  LayoutTemplate,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings,
  Shield,
  Sliders,
  Store,
  Tag,
  Trash2,
  Upload,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { apiFetch, getAuthToken } from '../lib/api';
import { DHAKA_AREAS } from '../lib/i18n';
import {
  canActorModifyUserAccount,
  formatBdt,
  OrderStatus,
  PRIMARY_SUPER_ADMIN_EMAIL,
} from '../lib/marketplace-logic';
import { DEFAULT_STOREFRONT_CONFIG, mergeStorefrontConfig } from '../lib/storefront-config';
import type {
  AppUser,
  AuditLogItem,
  BackendStatusSummary,
  Coupon,
  FoodItem,
  Lang,
  LedgerEntry,
  OrderRecord,
  PayoutRecord,
  PlatformSettings,
  Restaurant,
  RiderRecord,
  StorefrontConfig,
} from '../types/marketplace';

interface AdminUserRow {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

interface AdminDashboardProps {
  lang: Lang;
  currentUser: AppUser;
  onRestaurantsMutated: () => Promise<void>;
  onBack: () => void;
}

interface ProductFormState {
  id?: number;
  restaurantId: number;
  category: string;
  name: string;
  nameBn: string;
  description: string;
  imageUrl: string;
  price: string;
  discountPrice: string;
  inStock: boolean;
  isAvailable: boolean;
  isPopular: boolean;
}

interface RestaurantFormState {
  id?: number;
  name: string;
  nameBn: string;
  cuisine: string;
  area: string;
  address: string;
  description: string;
<<<<<<< HEAD
  logoUrl: string;
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
  coverUrl: string;
  deliveryFee: string;
  minOrder: string;
  discountPct: string;
  openingHours: string;
  deliveryMode: 'platform' | 'restaurant' | 'third_party';
  commissionRate: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  isOpen: boolean;
  isSponsored: boolean;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'confirmed',
  'accepted',
  'preparing',
  'ready',
  'rider_assigned',
  'picked_up',
  'on_the_way',
  'delivered',
  'cancelled',
];

export function AdminDashboard({ lang, currentUser, onRestaurantsMutated, onBack }: AdminDashboardProps) {
  const [tab, setTab] = useState<
    | 'overview'
    | 'frontend'
    | 'backend'
    | 'products'
    | 'restaurants'
    | 'orders'
    | 'finance'
    | 'coupons'
    | 'users'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [riders, setRiders] = useState<RiderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Global Platform Settings Form
  const [platformName, setPlatformName] = useState('Foodora BD');
  const [defaultCommissionPct, setDefaultCommissionPct] = useState('15.00');
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState('49');
  const [serviceFee, setServiceFee] = useState('10');
  const [minOrderDefault, setMinOrderDefault] = useState('150');
  const [savingSettings, setSavingSettings] = useState(false);

<<<<<<< HEAD
  // Admin Panel Security PIN Change Form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState<string | null>(null);

=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
  // Backend Control State
  const [backendStatus, setBackendStatus] = useState<BackendStatusSummary | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<
    'all' | 'customer' | 'restaurant_owner' | 'rider' | 'admin'
  >('all');
  const [broadcastType, setBroadcastType] = useState<'system' | 'promo' | 'order'>('system');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [runningReseed, setRunningReseed] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  // Frontend / Storefront Customization Form
  const [storefrontForm, setStorefrontForm] = useState<StorefrontConfig>(DEFAULT_STOREFRONT_CONFIG);
  const [savingFrontend, setSavingFrontend] = useState(false);

  // Product Catalog Filter & Modal
  const [productSearch, setProductSearch] = useState('');
  const [productRestFilter, setProductRestFilter] = useState<string>('all');
  const [productModal, setProductModal] = useState<ProductFormState | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Restaurant Create / Edit Modal
  const [restaurantModal, setRestaurantModal] = useState<RestaurantFormState | null>(null);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
<<<<<<< HEAD
  const [modalError, setModalError] = useState<string | null>(null);
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04

  // New coupon form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed' | 'free_delivery'>('fixed');
  const [value, setValue] = useState('100');
  const [minOrder, setMinOrder] = useState('350');

  const loadBackendStatus = useCallback(async () => {
    setLoadingBackend(true);
    try {
      const statusRes = await apiFetch<BackendStatusSummary>('/api/admin/backend/status');
      setBackendStatus(statusRes);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load backend status');
    } finally {
      setLoadingBackend(false);
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        restaurants: Restaurant[];
        products: FoodItem[];
        orders: OrderRecord[];
        users: AdminUserRow[];
        ledger: LedgerEntry[];
        payouts: PayoutRecord[];
        coupons: Coupon[];
        riders: RiderRecord[];
        auditLogs: AuditLogItem[];
        settings: PlatformSettings | null;
      }>('/api/admin/workspace');
      setRestaurants(res.restaurants);
      setProducts(res.products || []);
      setOrders(res.orders);
      setUsers(res.users);
      setLedger(res.ledger);
      setPayouts(res.payouts);
      setCoupons(res.coupons);
      setRiders(res.riders);
      setAuditLogs(res.auditLogs || []);
      setSettings(res.settings);
      if (res.settings) {
        setPlatformName(res.settings.platformName);
        setDefaultCommissionPct(String(res.settings.defaultCommissionPct));
        setDefaultDeliveryFee(String(res.settings.defaultDeliveryFee));
        setServiceFee(String(res.settings.serviceFee));
        setMinOrderDefault(String(res.settings.minOrderDefault));
        setStorefrontForm(mergeStorefrontConfig(res.settings.storefrontConfig));
      }
    } catch (err) {
      console.error('Failed to load admin workspace:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  useEffect(() => {
    if (tab === 'backend') {
      loadBackendStatus();
    }
  }, [tab, loadBackendStatus]);

  const restaurantNameMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of restaurants) {
      map.set(r.id, lang === 'bn' ? r.nameBn : r.name);
    }
    return map;
  }, [restaurants, lang]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (productRestFilter !== 'all' && item.restaurantId !== Number(productRestFilter)) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.trim().toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.nameBn.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productRestFilter, productSearch]);

  const handleUploadImage = async (file: File, onUploaded: (url: string) => void) => {
<<<<<<< HEAD
    if (file.size > 4.5 * 1024 * 1024) {
      const msg =
        lang === 'bn'
          ? 'ছবির সাইজ ৪.৫ এমবি-র কম হতে হবে।'
          : 'Image must be smaller than 4.5 MB.';
      setModalError(msg);
      setFeedback(msg);
      return;
    }
    setUploadingPhoto(true);
    setModalError(null);
=======
    setUploadingPhoto(true);
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    setFeedback(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });
      const res = await apiFetch<{ imageUrl: string }>('/api/upload-image', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
      onUploaded(res.imageUrl);
      setFeedback(lang === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে।' : 'Image uploaded successfully.');
    } catch (err: unknown) {
<<<<<<< HEAD
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setModalError(msg);
      setFeedback(msg);
=======
      setFeedback(err instanceof Error ? err.message : 'Image upload failed');
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          platformName: platformName.trim(),
          defaultCommissionPct: defaultCommissionPct.trim(),
          defaultDeliveryFee: Number(defaultDeliveryFee) || 0,
          serviceFee: Number(serviceFee) || 0,
          minOrderDefault: Number(minOrderDefault) || 0,
        }),
      });
      setFeedback(
        lang === 'bn'
          ? 'প্ল্যাটফর্ম সিস্টেম সেটিংস সংরক্ষণ করা হয়েছে।'
          : 'Global system settings saved.'
      );
      await loadAdmin();
      await onRestaurantsMutated();
    } finally {
      setSavingSettings(false);
    }
  };

<<<<<<< HEAD
  const handleUpdateAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);
    if (newPin.trim().length < 4) {
      setPinMsg(lang === 'bn' ? 'নতুন PIN কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'New PIN must be at least 4 characters.');
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setPinMsg(lang === 'bn' ? 'নতুন PIN দুইবার মিলছে না।' : 'New PIN and confirmation do not match.');
      return;
    }
    setSavingPin(true);
    try {
      await apiFetch('/api/admin/pin', {
        method: 'POST',
        body: JSON.stringify({
          currentPin: currentPin.trim(),
          newPin: newPin.trim(),
        }),
      });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setFeedback(
        lang === 'bn'
          ? 'অ্যাডমিন প্যানেল PIN সফলভাবে পরিবর্তন হয়েছে।'
          : 'Admin Panel security PIN updated successfully.'
      );
      await loadAdmin();
    } catch (err: unknown) {
      setPinMsg(err instanceof Error ? err.message : 'Failed to update Admin PIN');
    } finally {
      setSavingPin(false);
    }
  };

=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
  const handleSaveFrontendConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFrontend(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ storefrontConfig: storefrontForm }),
      });
      setFeedback(
        lang === 'bn'
          ? 'ফ্রন্টএন্ড কন্ট্রোল ও স্টোরফ্রন্ট ডিজাইন লাইভ আপডেট হয়েছে।'
          : 'Frontend storefront controls saved and published live!'
      );
      await loadAdmin();
      await onRestaurantsMutated();
    } finally {
      setSavingFrontend(false);
    }
  };

  const handleResetFrontendConfig = async () => {
    setStorefrontForm(DEFAULT_STOREFRONT_CONFIG);
    setSavingFrontend(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ storefrontConfig: DEFAULT_STOREFRONT_CONFIG }),
      });
      setFeedback(
        lang === 'bn'
          ? 'ফ্রন্টএন্ড ডিফল্ট থিমে রিসেট হয়েছে।'
          : 'Storefront controls reset to defaults.'
      );
      await loadAdmin();
      await onRestaurantsMutated();
    } finally {
      setSavingFrontend(false);
    }
  };

  const handleToggleSetting = async (key: keyof PlatformSettings, val: boolean) => {
    setErrorMsg(null);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ [key]: val }),
      });
      setFeedback(`Updated ${String(key)} to ${val ? 'ON' : 'OFF'}.`);
      await loadAdmin();
      await onRestaurantsMutated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update gateway setting');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);
    setSendingBroadcast(true);
    try {
      await apiFetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          targetRole: broadcastTarget,
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
        }),
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setFeedback(
        lang === 'bn'
          ? 'সার্ভার নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।'
          : `Server notification broadcast sent to "${broadcastTarget}".`
      );
      await loadAdmin();
      await loadBackendStatus();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleVerifySeedData = async () => {
    setErrorMsg(null);
    setFeedback(null);
    setRunningReseed(true);
    try {
      const res = await apiFetch<{ ok: boolean; message: string }>('/api/admin/backend/reseed', {
        method: 'POST',
      });
      setFeedback(
        lang === 'bn'
          ? 'ডাটাবেস সিড ও কনফিগারেশন যাচাই সম্পন্ন হয়েছে।'
          : res.message || 'Database seed integrity verified.'
      );
      await loadAdmin();
      await loadBackendStatus();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Seed verification failed');
    } finally {
      setRunningReseed(false);
    }
  };

  const handleDownloadJsonBackup = async () => {
    setErrorMsg(null);
    setDownloadingBackup(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/backend/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to download backup');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foodora-bd-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback(
        lang === 'bn'
          ? 'স্যানিটাইজড ডাটাবেস ব্যাকআপ (JSON) ডাউনলোড হয়েছে।'
          : 'Sanitized PostgreSQL database backup downloaded.'
      );
      await loadAdmin();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Backup download failed');
    } finally {
      setDownloadingBackup(false);
    }
  };

  const openCreateProductModal = () => {
    const defaultRestId = restaurants[0]?.id || 1;
    setProductModal({
      restaurantId: defaultRestId,
      category: 'Main Course',
      name: '',
      nameBn: '',
      description: '',
      imageUrl: '',
      price: '350',
      discountPrice: '',
      inStock: true,
      isAvailable: true,
      isPopular: true,
    });
  };

  const openEditProductModal = (item: FoodItem) => {
    setProductModal({
      id: item.id,
      restaurantId: item.restaurantId,
      category: item.category,
      name: item.name,
      nameBn: item.nameBn,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      price: String(item.price),
      discountPrice: item.discountPrice ? String(item.discountPrice) : '',
      inStock: item.inStock,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
    });
  };

  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModal) return;
    setSavingProduct(true);
    try {
      const payload = {
        restaurantId: Number(productModal.restaurantId),
        category: productModal.category.trim(),
        name: productModal.name.trim(),
        nameBn: productModal.nameBn.trim() || productModal.name.trim(),
        description: productModal.description.trim(),
        imageUrl: productModal.imageUrl.trim(),
        price: Number(productModal.price) || 100,
        discountPrice: productModal.discountPrice ? Number(productModal.discountPrice) : null,
        inStock: productModal.inStock,
        isAvailable: productModal.isAvailable,
        isPopular: productModal.isPopular,
      };

      if (productModal.id) {
        await apiFetch(`/api/admin/products/${productModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setFeedback(lang === 'bn' ? 'পণ্য আপডেট সম্পন্ন হয়েছে।' : `Updated "${payload.name}".`);
      } else {
        await apiFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback(lang === 'bn' ? 'নতুন পণ্য আপলোড হয়েছে।' : `Uploaded "${payload.name}".`);
      }
      setProductModal(null);
      await loadAdmin();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickProductToggle = async (item: FoodItem, field: 'inStock' | 'isPopular') => {
    await apiFetch(`/api/admin/products/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ [field]: !item[field] }),
    });
    await loadAdmin();
  };

  const handleDeleteProduct = async (item: FoodItem) => {
    await apiFetch(`/api/admin/products/${item.id}`, { method: 'DELETE' });
    setFeedback(lang === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে।' : `Deleted "${item.name}".`);
    await loadAdmin();
  };

  const openCreateRestaurantModal = () => {
<<<<<<< HEAD
    setModalError(null);
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    setRestaurantModal({
      name: '',
      nameBn: '',
      cuisine: 'Bangladeshi',
      area: DHAKA_AREAS[0].name,
      address: '',
      description: '',
<<<<<<< HEAD
      logoUrl: '',
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
      coverUrl: '',
      deliveryFee: '49',
      minOrder: '150',
      discountPct: '15',
      openingHours: '10:00 AM - 11:30 PM',
      deliveryMode: 'platform',
      commissionRate: '15.00',
      subscriptionPlan: 'basic',
      isOpen: true,
      isSponsored: false,
    });
  };

  const openEditRestaurantModal = (r: Restaurant) => {
<<<<<<< HEAD
    setModalError(null);
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    setRestaurantModal({
      id: r.id,
      name: r.name,
      nameBn: r.nameBn,
      cuisine: r.cuisine,
      area: r.area,
      address: r.address,
      description: r.description,
<<<<<<< HEAD
      logoUrl: r.logoUrl || '',
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
      coverUrl: r.coverUrl,
      deliveryFee: String(r.deliveryFee),
      minOrder: String(r.minOrder),
      discountPct: String(r.discountPct),
      openingHours: r.openingHours,
      deliveryMode: r.deliveryMode,
      commissionRate: r.commissionRate,
      subscriptionPlan: r.subscriptionPlan,
      isOpen: r.isOpen,
      isSponsored: r.isSponsored,
    });
  };

  const handleSaveRestaurantModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantModal) return;
    setSavingRestaurant(true);
<<<<<<< HEAD
    setModalError(null);
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    try {
      const payload = {
        name: restaurantModal.name.trim(),
        nameBn: restaurantModal.nameBn.trim() || restaurantModal.name.trim(),
        cuisine: restaurantModal.cuisine.trim(),
        area: restaurantModal.area.trim(),
        address: restaurantModal.address.trim(),
        description: restaurantModal.description.trim(),
<<<<<<< HEAD
        logoUrl: restaurantModal.logoUrl.trim(),
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
        coverUrl: restaurantModal.coverUrl.trim(),
        deliveryFee: Number(restaurantModal.deliveryFee) || 0,
        minOrder: Number(restaurantModal.minOrder) || 0,
        discountPct: Number(restaurantModal.discountPct) || 0,
        openingHours: restaurantModal.openingHours.trim(),
        deliveryMode: restaurantModal.deliveryMode,
        commissionRate: restaurantModal.commissionRate.trim(),
        subscriptionPlan: restaurantModal.subscriptionPlan,
        isOpen: restaurantModal.isOpen,
        isSponsored: restaurantModal.isSponsored,
      };
      if (restaurantModal.id) {
        await apiFetch(`/api/admin/restaurants/${restaurantModal.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setFeedback(`Updated restaurant "${payload.name}".`);
      } else {
        await apiFetch('/api/admin/restaurants', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFeedback(`Created restaurant "${payload.name}".`);
      }
      setRestaurantModal(null);
      await loadAdmin();
      await onRestaurantsMutated();
<<<<<<< HEAD
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save restaurant');
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleUpdateRestaurant = async (
    id: number,
    patch: Partial<{
      status: 'pending' | 'approved' | 'rejected' | 'suspended';
      commissionRate: string;
      subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
      isSponsored: boolean;
      isOpen: boolean;
    }>
  ) => {
    await apiFetch(`/api/admin/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setFeedback(lang === 'bn' ? 'রেস্টুরেন্ট তথ্য আপডেট হয়েছে।' : 'Restaurant configuration saved.');
    await loadAdmin();
    await onRestaurantsMutated();
  };

  const handleOrderOverride = async (
    orderId: number,
    patch: { status: OrderStatus; riderUid?: string | null }
  ) => {
    await apiFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setFeedback(`Order #${orderId} updated.`);
    await loadAdmin();
  };

  const handleRefundOrder = async (orderId: number) => {
    await apiFetch(`/api/admin/orders/${orderId}/refund`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: 'Cancelled & refunded by Super Admin' }),
    });
    setFeedback(
      lang === 'bn'
        ? 'অর্ডার বাতিল ও কমিশন রিভার্সাল সম্পন্ন হয়েছে।'
        : 'Order cancelled and commission reversed in ledger.'
    );
    await loadAdmin();
  };

  const handlePayoutDecision = async (id: number, status: 'paid' | 'rejected') => {
    await apiFetch(`/api/admin/payouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadAdmin();
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    await apiFetch('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        type: couponType,
        value: Number(value) || 0,
        minOrder: Number(minOrder) || 0,
        maxDiscount: 300,
      }),
    });
    setCode('');
    setTitle('');
    setFeedback(lang === 'bn' ? 'নতুন কুপন প্রকাশিত হয়েছে।' : 'Promo coupon published.');
    await loadAdmin();
  };

  const handleToggleCoupon = async (c: Coupon) => {
    await apiFetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    await loadAdmin();
  };

  const handleDeleteCoupon = async (id: number) => {
    await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    await loadAdmin();
  };

  const handleUpdateUser = async (
    u: AdminUserRow,
    patch: Partial<{ role: string; status: string }>
  ) => {
    setErrorMsg(null);
    const nextRole = patch.role ?? u.role;
    const nextStatus = patch.status ?? u.status;
    const decision = canActorModifyUserAccount({
      actorUid: currentUser.uid,
      actorRole: currentUser.role,
      targetUid: u.uid,
      targetEmail: u.email,
      currentRole: u.role,
      nextRole,
      nextStatus,
    });
    if (!decision.allowed) {
      setErrorMsg(decision.reason || 'Role change is restricted.');
      return;
    }
    try {
      await apiFetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setFeedback(`Updated user ${u.email}.`);
      await loadAdmin();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleUpdateRider = async (
    r: RiderRecord,
    patch: Partial<{ status: string; isAvailable: boolean }>
  ) => {
    setErrorMsg(null);
    try {
      await apiFetch(`/api/admin/riders/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setFeedback(`Updated rider ${r.fullName}.`);
      await loadAdmin();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update rider');
    }
  };

  const gmv = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.totalAmount, 0);
  const netCommission = ledger.reduce((s, l) => s + l.commissionAmount, 0);
  const pendingCount = restaurants.filter((r) => r.status === 'pending').length;

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

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/export/project-zip"
            download="foodora-bd-project.zip"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রোজেক্ট ZIP ডাউনলোড' : 'Download Project ZIP'}</span>
          </a>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2E3138] text-white text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-[#E21B70]" />
            <span>
              {currentUser.role === 'super_admin'
                ? lang === 'bn'
                  ? 'সুপার অ্যাডমিন কন্ট্রোল'
                  : 'Super Admin Control'
                : lang === 'bn'
                ? 'অ্যাডমিন কন্ট্রোল'
                : 'Admin Control'}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss notification"
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center justify-between gap-2"
        >
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            aria-label="Dismiss error"
            className="text-red-700 hover:text-red-950"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Platform KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 tabular-nums">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট GMV' : 'Gross Merchandise Value'}</p>
          <p className="text-2xl font-bold text-[#2E3138] mt-1">{formatBdt(gmv, lang)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{lang === 'bn' ? 'প্ল্যাটফর্ম কমিশন' : 'Net Commission'}</p>
          <p className="text-2xl font-bold text-[#E21B70] mt-1">{formatBdt(netCommission, lang)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট পণ্য (মেনু)' : 'Total Menu Products'}</p>
          <p className="text-2xl font-bold text-[#2E3138] mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approvals'}</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500">{lang === 'bn' ? 'সক্রিয় রাইডার' : 'Active Riders'}</p>
          <p className="text-2xl font-bold text-[#2E3138] mt-1">{riders.length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview' as const, labelBn: 'সিস্টেম কন্ট্রোল ও এক্সপোর্ট', labelEn: 'System Control & Export', icon: Sliders },
          { id: 'frontend' as const, labelBn: 'ফ্রন্টএন্ড কন্ট্রোল', labelEn: 'Frontend Control', icon: LayoutTemplate },
          { id: 'backend' as const, labelBn: 'ব্যাকএন্ড কন্ট্রোল', labelEn: 'Backend Control', icon: Server },
          { id: 'products' as const, labelBn: 'প্রোডাক্ট আপলোড ও এডিট', labelEn: 'Products & Catalog', icon: Package },
          { id: 'restaurants' as const, labelBn: 'রেস্টুরেন্ট ও অনুমোদন', labelEn: 'Restaurants', icon: Store },
          { id: 'orders' as const, labelBn: 'অর্ডার ও ডিসপ্যাচ', labelEn: 'Orders & Dispatch', icon: RotateCcw },
          { id: 'finance' as const, labelBn: 'কমিশন ও পেআউট', labelEn: 'Ledger & Payouts', icon: Wallet },
          { id: 'coupons' as const, labelBn: 'কুপন ম্যানেজমেন্ট', labelEn: 'Coupons', icon: Tag },
          { id: 'users' as const, labelBn: 'ইউজার ও রাইডার', labelEn: 'Users & Riders', icon: Users },
        ].map((tItem) => {
          const Icon = tItem.icon;
          return (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setTab(tItem.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${
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

      {loading ? (
        <div className="h-44 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-sm text-neutral-500">
          {lang === 'bn' ? 'অ্যাডমিন সিস্টেম লোড হচ্ছে...' : 'Loading Whole-System Admin Control...'}
        </div>
      ) : tab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Global Numeric & Brand Config */}
          <form
            onSubmit={handleSaveGlobalSettings}
            className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#E21B70]" />
                <span>
                  {lang === 'bn' ? 'গ্লোবাল প্ল্যাটফর্ম সিস্টেম সেটিংস' : 'Global Platform Parameters'}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Platform Brand Name</label>
                <input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Default Commission (%)</label>
                <input
                  value={defaultCommissionPct}
                  onChange={(e) => setDefaultCommissionPct(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Default Delivery Fee (৳)</label>
                <input
                  type="number"
                  value={defaultDeliveryFee}
                  onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Platform Service Fee (৳)</label>
                <input
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Default Minimum Order (৳)</label>
                <input
                  type="number"
                  value={minOrderDefault}
                  onChange={(e) => setMinOrderDefault(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : lang === 'bn' ? 'সিস্টেম সেটিংস সেভ করুন' : 'Save System Settings'}
            </button>
          </form>

          {/* Payment Gateways, Couriers & Clean ZIP Export */}
          <div className="lg:col-span-6 space-y-6">
<<<<<<< HEAD
            {currentUser.role === 'super_admin' && (
              <form
                onSubmit={handleUpdateAdminPin}
                className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3"
              >
                <h2 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#E21B70]" />
                  <span>
                    {lang === 'bn'
                      ? 'অ্যাডমিন প্যানেল সিকিউরিটি PIN পরিবর্তন'
                      : 'Admin Panel Security PIN'}
                  </span>
                </h2>
                {pinMsg && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {pinMsg}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Current PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      minLength={4}
                      maxLength={16}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">New PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      minLength={4}
                      maxLength={16}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="4–16 chars"
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Confirm PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      minLength={4}
                      maxLength={16}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Repeat PIN"
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingPin}
                  className="px-4 py-2 rounded-xl bg-[#2E3138] hover:bg-black text-white text-xs font-semibold disabled:opacity-50"
                >
                  {savingPin
                    ? 'Updating...'
                    : lang === 'bn'
                    ? 'নতুন PIN সংরক্ষণ করুন'
                    : 'Update Admin PIN'}
                </button>
              </form>
            )}
=======
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h2 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E21B70]" />
                <span>
                  {lang === 'bn'
                    ? 'পেমেন্ট গেটওয়ে ও ডেলিভারি কুরিয়ার কন্ট্রোল'
                    : 'Payment Gateways & Pathao Courier Toggles'}
                </span>
              </h2>
              {settings && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    { key: 'pathaoEnabled' as const, label: 'Pathao Courier Dispatch' },
                    { key: 'pathaoSandbox' as const, label: 'Pathao Sandbox Mode' },
                    { key: 'bkashEnabled' as const, label: 'bKash Tokenized Checkout' },
                    { key: 'bkashSandbox' as const, label: 'bKash Sandbox Mode' },
                    { key: 'sslcommerzEnabled' as const, label: 'SSLCommerz Cards/MFS' },
                    { key: 'sslcommerzSandbox' as const, label: 'SSLCommerz Sandbox Mode' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200"
                    >
                      <span className="font-semibold text-[#2E3138]">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSetting(item.key, !settings[item.key])}
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          settings[item.key]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {settings[item.key] ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#2E3138] text-white rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF7EB3]">
                    Portable Source Bundle
                  </p>
                  <h3 className="font-bold text-base mt-0.5">
                    {lang === 'bn'
                      ? 'সম্পূর্ণ প্রোজেক্ট ZIP ডাউনলোড ও অন্য অ্যাকাউন্টে ওপেন'
                      : 'Export Clean Project ZIP (Error-Free)'}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    Downloads full TypeScript frontend + Express backend + Drizzle schema without node_modules or secret keys.
                  </p>
                </div>
                <a
                  href="/api/export/project-zip"
                  download="foodora-bd-project.zip"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ZIP</span>
                </a>
              </div>
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-neutral-200 p-5 overflow-x-auto">
            <h2 className="font-bold text-sm text-[#2E3138] mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E21B70]" />
              <span>{lang === 'bn' ? 'সিস্টেম অডিট লগ' : 'Live System Audit Trail'}</span>
            </h2>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-neutral-500">No admin mutations logged yet.</p>
            ) : (
              <table className="w-full text-xs text-left tabular-nums">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2">Action</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Actor</th>
                    <th className="py-2">Details</th>
                    <th className="py-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="border-b border-neutral-100">
                      <td className="py-2 font-bold uppercase text-[#E21B70]">{log.action}</td>
                      <td className="py-2 text-neutral-700">
                        {log.targetType} #{log.targetId}
                      </td>
                      <td className="py-2 text-neutral-500">{log.actorUid}</td>
                      <td className="py-2 text-neutral-600 max-w-md truncate">{log.details}</td>
                      <td className="py-2 text-right text-neutral-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : tab === 'backend' ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base text-[#2E3138] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#E21B70]" />
                <span>
                  {lang === 'bn'
                    ? 'ব্যাকএন্ড, ডাটাবেস ও সার্ভার কন্ট্রোল সেন্টার'
                    : 'Backend, Database & Server Control Center'}
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {lang === 'bn'
                  ? 'সরাসরি PostgreSQL/Supabase হেলথ, API ইন্টিগ্রেশন, পেমেন্ট গেটওয়ে মোড, নোটিফিকেশন ব্রডকাস্ট ও ডাটাবেস ব্যাকআপ নিয়ন্ত্রণ করুন।'
                  : 'Inspect live PostgreSQL/Supabase health, API integrations, server fee rules, notification broadcasts, and database backups.'}
              </p>
            </div>
            <button
              type="button"
              onClick={loadBackendStatus}
              disabled={loadingBackend}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 hover:border-[#E21B70] text-xs font-semibold text-[#2E3138] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBackend ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'হেলথ চেক রিফ্রেশ' : 'Refresh DB Health'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Database & Runtime Inspector */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#E21B70]" />
                  <span>
                    {lang === 'bn'
                      ? 'ডাটাবেস কানেকশন ও টেবিল রেকর্ডস'
                      : 'PostgreSQL / Supabase Runtime & Table Counts'}
                  </span>
                </h3>
                {backendStatus && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold tabular-nums">
                    Connected · {backendStatus.latencyMs}ms
                  </span>
                )}
              </div>

              {loadingBackend && !backendStatus ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Running live backend diagnostics...
                </div>
              ) : backendStatus ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <p className="text-[11px] text-neutral-500">Runtime Engine</p>
                      <p className="font-bold text-[#2E3138] mt-0.5">
                        {backendStatus.runtime === 'vercel-serverless'
                          ? 'Vercel Serverless'
                          : 'Node.js Express'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <p className="text-[11px] text-neutral-500">DB Driver</p>
                      <p className="font-bold text-[#2E3138] mt-0.5">
                        {backendStatus.databaseProvider === 'supabase-or-external-url'
                          ? 'Supabase / External PG'
                          : backendStatus.databaseProvider === 'cloudsql-pg'
                          ? 'Cloud SQL PG'
                          : 'Local Postgres'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <p className="text-[11px] text-neutral-500">SSL Mode</p>
                      <p className="font-bold text-[#2E3138] mt-0.5">
                        {backendStatus.sslActive ? 'TLS / SSL Active' : 'Private Socket'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <p className="text-[11px] text-neutral-500">Checked At</p>
                      <p className="font-bold text-[#2E3138] mt-0.5 tabular-nums">
                        {new Date(backendStatus.checkedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 text-xs tabular-nums pt-1">
                    {[
                      { label: 'Users', count: backendStatus.tableCounts.users },
                      { label: 'Restaurants', count: backendStatus.tableCounts.restaurants },
                      { label: 'Menu Items', count: backendStatus.tableCounts.foodItems },
                      { label: 'Orders', count: backendStatus.tableCounts.orders },
                      { label: 'Riders', count: backendStatus.tableCounts.riders },
                      { label: 'Coupons', count: backendStatus.tableCounts.coupons },
                      { label: 'Notifications', count: backendStatus.tableCounts.notifications },
                      { label: 'Ledger', count: backendStatus.tableCounts.commissionLedger },
                      { label: 'Audit Logs', count: backendStatus.tableCounts.auditLogs },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="p-2.5 rounded-xl border border-neutral-200 bg-white text-center"
                      >
                        <p className="text-base font-bold text-[#2E3138]">{row.count}</p>
                        <p className="text-[11px] text-neutral-500">{row.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-neutral-500">Could not load backend runtime metrics.</p>
              )}
            </div>

            {/* Env Integration Readiness Matrix */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h3 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E21B70]" />
                <span>
                  {lang === 'bn'
                    ? 'API ও এনভায়রনমেন্ট কনফিগ স্ট্যাটাস'
                    : 'Server Environment Readiness'}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                Secret values remain hidden on the server; only connection readiness is shown.
              </p>

              {backendStatus && (
                <div className="space-y-2 text-xs">
                  {[
                    {
                      label: 'PostgreSQL / Supabase Connection',
                      ready: backendStatus.integrations.databaseConfigured,
                      fallbackText: 'Not Configured',
                    },
                    {
                      label: 'Supabase Auth (Google OAuth & JWT)',
                      ready: backendStatus.integrations.supabaseAuthConfigured,
                      fallbackText: 'Client Verify Mode',
                    },
                    {
                      label: 'Google Maps Platform API Key',
                      ready: backendStatus.integrations.googleMapsConfigured,
                      fallbackText: 'Interactive Fallback Map',
                    },
                    {
                      label: 'bKash Live Merchant Credentials',
                      ready: backendStatus.integrations.bkashLiveConfigured,
                      fallbackText: 'Sandbox Simulation',
                    },
                    {
                      label: 'SSLCommerz Live Store Credentials',
                      ready: backendStatus.integrations.sslcommerzLiveConfigured,
                      fallbackText: 'Sandbox Simulation',
                    },
                    {
                      label: 'Pathao Courier API Credentials',
                      ready: backendStatus.integrations.pathaoLiveConfigured,
                      fallbackText: 'Sandbox Simulation',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200"
                    >
                      <span className="font-medium text-[#2E3138]">{item.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.ready
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.ready ? 'Configured' : item.fallbackText}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Server Notification Broadcast Engine */}
            <form
              onSubmit={handleSendBroadcast}
              className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3"
            >
              <h3 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#E21B70]" />
                <span>
                  {lang === 'bn'
                    ? 'সার্ভার নোটিফিকেশন ব্রডকাস্ট'
                    : 'Server Broadcast Notification Engine'}
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Push live notifications directly to customer, vendor, rider, or all accounts via the backend.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Target Audience</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) =>
                      setBroadcastTarget(
                        e.target.value as 'all' | 'customer' | 'restaurant_owner' | 'rider' | 'admin'
                      )
                    }
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="all">All Users (Global Broadcast)</option>
                    <option value="customer">Customers Only</option>
                    <option value="restaurant_owner">Restaurant Partners</option>
                    <option value="rider">Delivery Riders</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Notification Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e) =>
                      setBroadcastType(e.target.value as 'system' | 'promo' | 'order')
                    }
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="system">System Alert</option>
                    <option value="promo">Promo Offer</option>
                    <option value="order">Dispatch Notice</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Title</label>
                  <input
                    required
                    minLength={3}
                    maxLength={120}
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Eid Flash Free Delivery Tonight!"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={2}
                    minLength={5}
                    maxLength={500}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Message stored in PostgreSQL notifications table..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingBroadcast}
                className="px-5 py-2.5 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold disabled:opacity-50"
              >
                {sendingBroadcast
                  ? 'Sending...'
                  : lang === 'bn'
                  ? 'ব্রডকাস্ট পাঠান'
                  : 'Send Server Broadcast'}
              </button>
            </form>

            {/* Gateway Modes + Super Admin DB Backup & Seed Repair */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                <h3 className="font-bold text-sm text-[#2E3138] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#E21B70]" />
                  <span>
                    {lang === 'bn'
                      ? 'ব্যাকএন্ড পেমেন্ট ও কুরিয়ার গেটওয়ে কন্ট্রোল'
                      : 'Backend Payment & Courier Gateway Toggles'}
                  </span>
                </h3>
                {settings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { key: 'pathaoEnabled' as const, label: 'Pathao Courier Dispatch' },
                      { key: 'pathaoSandbox' as const, label: 'Pathao Sandbox Mode' },
                      { key: 'bkashEnabled' as const, label: 'bKash Tokenized API' },
                      { key: 'bkashSandbox' as const, label: 'bKash Sandbox Mode' },
                      { key: 'sslcommerzEnabled' as const, label: 'SSLCommerz MFS/Card' },
                      { key: 'sslcommerzSandbox' as const, label: 'SSLCommerz Sandbox Mode' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200"
                      >
                        <span className="font-semibold text-[#2E3138]">{item.label}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSetting(item.key, !settings[item.key])}
                          className={`px-2.5 py-1 rounded-lg font-semibold ${
                            settings[item.key]
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {settings[item.key] ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#2E3138] text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF7EB3]">
                      Super Admin Maintenance
                    </p>
                    <h3 className="font-bold text-sm mt-0.5">
                      {lang === 'bn'
                        ? 'ডাটাবেস ব্যাকআপ ও সিড মেইনটেন্যান্স'
                        : 'Database Backup, Seed Check & Supabase Export'}
                    </h3>
                  </div>
                  {currentUser.role !== 'super_admin' && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-semibold">
                      Super Admin Only
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300">
                  Safely verify seed defaults (without erasing live orders), export sanitized PostgreSQL data as JSON, or download clean React + Node.js source for Vercel/Supabase.
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={runningReseed || currentUser.role !== 'super_admin'}
                    onClick={handleVerifySeedData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{runningReseed ? 'Checking...' : 'Verify Seed Integrity'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={downloadingBackup || currentUser.role !== 'super_admin'}
                    onClick={handleDownloadJsonBackup}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-40"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{downloadingBackup ? 'Exporting...' : 'Export JSON Backup'}</span>
                  </button>
                  <a
                    href="/api/export/project-zip"
                    download="foodora-bd-project.zip"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Project ZIP</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'frontend' ? (
        <form onSubmit={handleSaveFrontendConfig} className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base text-[#2E3138]">
                {lang === 'bn'
                  ? 'সম্পূর্ণ ফ্রন্টএন্ড ও স্টোরফ্রন্ট কন্ট্রোল সেন্টার'
                  : 'Complete Frontend & Storefront Control Center'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {lang === 'bn'
                  ? 'যেকোনো সময় হোমপেজের ব্র্যান্ডিং, হিরো ব্যানার, সেকশন ভিজিবিলিটি, অ্যানাউন্সমেন্ট বার ও ফুটার পরিবর্তন করুন।'
                  : 'Control storefront branding, hero banner, section visibility toggles, announcement bar, promo ticket, and footer live.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetFrontendConfig}
                disabled={savingFrontend}
                className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 text-xs font-semibold text-neutral-700"
              >
                {lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}
              </button>
              <button
                type="submit"
                disabled={savingFrontend}
                className="px-4 py-2 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-bold disabled:opacity-50"
              >
                {savingFrontend
                  ? 'Publishing...'
                  : lang === 'bn'
                  ? 'সেভ ও পাবলিশ করুন'
                  : 'Save & Publish to Frontend'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Brand, Theme Color & Section Visibility */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#2E3138]">
                {lang === 'bn' ? 'ব্র্যান্ডিং ও সেকশন অন/অফ' : 'Brand Identity & Section Toggles'}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Brand Prefix</label>
                  <input
                    value={storefrontForm.brandPrefix}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, brandPrefix: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Brand Suffix</label>
                  <input
                    value={storefrontForm.brandSuffix}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, brandSuffix: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <label className="block font-semibold text-neutral-700">Primary Theme Accent Color</label>
                <div className="flex flex-wrap items-center gap-2">
                  {['#E21B70', '#C4135E', '#059669', '#2563EB', '#EA580C', '#111827'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setStorefrontForm({ ...storefrontForm, accentColor: hex })}
                      style={{ backgroundColor: hex }}
                      className={`w-7 h-7 rounded-lg border-2 ${
                        storefrontForm.accentColor.toUpperCase() === hex.toUpperCase()
                          ? 'border-[#2E3138] scale-110'
                          : 'border-white'
                      }`}
                      title={hex}
                    />
                  ))}
                  <input
                    type="text"
                    value={storefrontForm.accentColor}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, accentColor: e.target.value })}
                    className="w-24 px-2.5 py-1.5 border border-neutral-200 rounded-lg font-mono-nums text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                <p className="font-bold text-neutral-700">Storefront Sections Visibility</p>
                {[
                  { key: 'showTopPartnerBar' as const, label: 'Top Partner / Rider / Admin Bar' },
                  { key: 'announcementBarEnabled' as const, label: 'Top Flash Announcement Bar' },
                  { key: 'showPickupTab' as const, label: 'Pickup Tab in Sub-Navigation' },
                  { key: 'showHero' as const, label: 'Homepage Hero Promotional Banner' },
                  { key: 'showPromoTicket' as const, label: 'Left Sidebar Promo Code Card' },
                  { key: 'showCuisineRibbon' as const, label: 'Explore by Cuisine Tiles' },
                  { key: 'showDailyDeals' as const, label: 'Daily Vouchers & Deals Row' },
                  { key: 'maintenanceMode' as const, label: 'Maintenance Notice Banner' },
                ].map((toggle) => {
                  const enabled = Boolean(storefrontForm[toggle.key]);
                  return (
                    <div
                      key={toggle.key}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200"
                    >
                      <span className="font-medium text-[#2E3138]">{toggle.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setStorefrontForm({ ...storefrontForm, [toggle.key]: !enabled })
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          enabled ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {enabled ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Banner, Announcement, Promo Ticket & Footer Editor */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#2E3138]">
                  {lang === 'bn' ? 'হিরো ব্যানার কন্ট্রোল' : 'Hero Banner Content & Image'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Badge (EN)</label>
                    <input
                      value={storefrontForm.heroBadgeEn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroBadgeEn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Badge (বাংলা)</label>
                    <input
                      value={storefrontForm.heroBadgeBn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroBadgeBn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Headline (EN)</label>
                    <input
                      value={storefrontForm.heroTitleEn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroTitleEn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Headline (বাংলা)</label>
                    <input
                      value={storefrontForm.heroTitleBn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroTitleBn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Subtitle (EN)</label>
                    <textarea
                      rows={2}
                      value={storefrontForm.heroSubEn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroSubEn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Subtitle (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={storefrontForm.heroSubBn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroSubBn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero CTA Button (EN)</label>
                    <input
                      value={storefrontForm.heroBtnEn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroBtnEn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Hero CTA Button (বাংলা)</label>
                    <input
                      value={storefrontForm.heroBtnBn}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroBtnBn: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">Hero Banner Image</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={storefrontForm.heroImageUrl}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, heroImageUrl: e.target.value })}
                        className="flex-1 min-w-[200px] px-3 py-2 border border-neutral-200 rounded-lg"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 hover:border-[#E21B70] cursor-pointer font-semibold">
                        <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                        <span>{uploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleUploadImage(f, (url) =>
                                setStorefrontForm((prev) => ({ ...prev, heroImageUrl: url }))
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#2E3138]">
                  {lang === 'bn'
                    ? 'অ্যানাউন্সমেন্ট বার, প্রোমো কার্ড ও ফুটার কন্ট্রোল'
                    : 'Announcement Bar, Sidebar Promo, Section Titles & Footer'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Announcement Ticker (EN)</label>
                    <input
                      value={storefrontForm.announcementTextEn}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, announcementTextEn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Announcement Ticker (বাংলা)</label>
                    <input
                      value={storefrontForm.announcementTextBn}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, announcementTextBn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Sidebar Promo Code</label>
                    <input
                      value={storefrontForm.promoCode}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, promoCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Sidebar Promo Text (EN)</label>
                    <input
                      value={storefrontForm.promoDescEn}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, promoDescEn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Restaurants Heading (EN)</label>
                    <input
                      value={storefrontForm.restaurantsHeadingEn}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, restaurantsHeadingEn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Daily Deals Heading (EN)</label>
                    <input
                      value={storefrontForm.dailyDealsTitleEn}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, dailyDealsTitleEn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Dhaka Zones Line 1</label>
                    <input
                      value={storefrontForm.footerZonesLine1}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, footerZonesLine1: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Dhaka Zones Line 2</label>
                    <input
                      value={storefrontForm.footerZonesLine2}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, footerZonesLine2: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Footer Copyright</label>
                    <input
                      value={storefrontForm.footerCopyright}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, footerCopyright: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Maintenance Notice Text</label>
                    <input
                      value={storefrontForm.maintenanceMessage}
                      onChange={(e) =>
                        setStorefrontForm({ ...storefrontForm, maintenanceMessage: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : tab === 'products' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'পণ্য বা ক্যাটাগরি খুঁজুন...' : 'Search product name or category...'}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl"
                />
              </div>
              <select
                value={productRestFilter}
                onChange={(e) => setProductRestFilter(e.target.value)}
                aria-label="Filter products by restaurant"
                className="px-3 py-2 text-xs border border-neutral-200 rounded-xl bg-white"
              >
                <option value="all">{lang === 'bn' ? 'সব রেস্টুরেন্ট' : 'All Restaurants'}</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {lang === 'bn' ? r.nameBn : r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={openCreateProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন পণ্য আপলোড করুন' : 'Upload / Add Product'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((item) => (
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate">
                        {restaurantNameMap.get(item.restaurantId) || `Rest #${item.restaurantId}`}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#2E3138] truncate mt-0.5">
                      {lang === 'bn' ? item.nameBn : item.name}
                    </h3>
                    <p className="text-xs font-bold text-[#E21B70] tabular-nums">
                      {formatBdt(item.discountPrice ?? item.price, lang)}
                      {item.discountPrice && (
                        <span className="ml-1.5 text-neutral-400 line-through font-normal">
                          {formatBdt(item.price, lang)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditProductModal(item)}
                    aria-label={`Edit product ${item.name}`}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-[#E21B70] text-xs font-semibold text-neutral-700 inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickProductToggle(item, 'inStock')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                      item.inStock
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.inStock ? 'In Stock' : 'Out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(item)}
                    aria-label={`Delete product ${item.name}`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'restaurants' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCreateRestaurantModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন রেস্টুরেন্ট যুক্ত করুন' : 'Create Restaurant'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
<<<<<<< HEAD
                  <div className="relative shrink-0">
                    <img
                      src={rest.coverUrl}
                      alt={rest.name}
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-100"
                    />
                    {rest.logoUrl && (
                      <img
                        src={rest.logoUrl}
                        alt={`${rest.name} logo`}
                        className="w-6 h-6 rounded-lg object-cover border-2 border-white shadow-xs bg-white absolute -bottom-1 -right-1"
                      />
                    )}
                  </div>
=======
                  <img
                    src={rest.coverUrl}
                    alt={rest.name}
                    className="w-14 h-14 rounded-xl object-cover bg-neutral-100 shrink-0"
                  />
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-[#2E3138]">
                        {rest.name} ({rest.nameBn})
                      </h3>
                      <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                          rest.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : rest.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {rest.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {rest.area} · {rest.cuisine} · Fee ৳{rest.deliveryFee} · Min ৳{rest.minOrder} · Mode:{' '}
                      {rest.deliveryMode}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditRestaurantModal(rest)}
                    aria-label={`Edit restaurant ${rest.name}`}
                    className="px-2.5 py-1 rounded border border-neutral-200 hover:border-[#E21B70] font-semibold inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <label className="inline-flex items-center gap-1 text-neutral-600">
                    <span>Comm %</span>
                    <input
                      type="text"
                      defaultValue={rest.commissionRate}
                      onBlur={(e) => {
                        if (e.target.value !== rest.commissionRate) {
                          handleUpdateRestaurant(rest.id, { commissionRate: e.target.value });
                        }
                      }}
                      className="w-14 px-2 py-1 border border-neutral-200 rounded text-center tabular-nums"
                    />
                  </label>

                  <select
                    value={rest.subscriptionPlan}
                    onChange={(e) =>
                      handleUpdateRestaurant(rest.id, {
                        subscriptionPlan: e.target.value as 'free' | 'basic' | 'premium' | 'enterprise',
                      })
                    }
                    aria-label={`Plan for ${rest.name}`}
                    className="px-2 py-1 border border-neutral-200 rounded bg-white"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleUpdateRestaurant(rest.id, { isSponsored: !rest.isSponsored })}
                    className={`px-2.5 py-1 rounded border font-semibold ${
                      rest.isSponsored
                        ? 'border-[#E21B70] bg-[#FFF0F6] text-[#E21B70]'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {rest.isSponsored ? 'Sponsored' : 'Sponsor'}
                  </button>

                  {rest.status !== 'approved' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateRestaurant(rest.id, { status: 'approved' })}
                      className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold"
                    >
                      {lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateRestaurant(rest.id, { status: 'suspended' })}
                      className="px-3 py-1 rounded border border-red-200 text-red-600 font-semibold"
                    >
                      {lang === 'bn' ? 'স্থগিত করুন' : 'Suspend'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 overflow-x-auto">
          <table className="w-full text-xs text-left tabular-nums">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2">Order</th>
                <th className="py-2">Restaurant</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Status Control</th>
                <th className="py-2">Assign Rider</th>
                <th className="py-2 text-right">Total</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100">
                  <td className="py-2.5 font-mono-nums font-semibold">
                    {o.orderNumber}
                    <div className="text-[11px] text-neutral-400">
                      {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                    </div>
                  </td>
                  <td className="py-2.5">{o.restaurantName}</td>
                  <td className="py-2.5">
                    {o.customerName}
                    <div className="text-neutral-400">{o.deliveryArea}</div>
                  </td>
                  <td className="py-2.5">
                    <select
                      value={o.status}
                      aria-label={`Order status for ${o.orderNumber}`}
                      onChange={(e) =>
                        handleOrderOverride(o.id, { status: e.target.value as OrderStatus })
                      }
                      className="px-2 py-1 border border-neutral-200 rounded bg-white font-semibold text-[#2E3138]"
                    >
                      {ORDER_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5">
                    <select
                      value={o.riderUid || ''}
                      aria-label={`Assign rider for ${o.orderNumber}`}
                      onChange={(e) =>
                        handleOrderOverride(o.id, {
                          status: o.status === 'ready' && e.target.value ? 'rider_assigned' : o.status,
                          riderUid: e.target.value || null,
                        })
                      }
                      className="px-2 py-1 border border-neutral-200 rounded bg-white"
                    >
                      <option value="">Unassigned</option>
                      {riders.map((r) => (
                        <option key={r.uid} value={r.uid}>
                          {r.fullName} ({r.zone})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 text-right font-semibold">{formatBdt(o.totalAmount, lang)}</td>
                  <td className="py-2.5 text-right">
                    {o.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleRefundOrder(o.id)}
                        className="px-2.5 py-1 rounded border border-red-200 text-red-600 font-semibold hover:bg-red-50"
                      >
                        {lang === 'bn' ? 'রিফান্ড ও রিভার্স' : 'Cancel & Refund'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'finance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 overflow-x-auto">
            <h2 className="font-bold text-sm text-[#2E3138] mb-3">
              {lang === 'bn' ? 'প্ল্যাটফর্ম কমিশন লেজার' : 'Platform Commission Ledger'}
            </h2>
            <table className="w-full text-xs text-left tabular-nums">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2">Entry</th>
                  <th className="py-2">Note</th>
                  <th className="py-2 text-right">Commission</th>
                  <th className="py-2 text-right">Vendor Net</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l) => (
                  <tr key={l.id} className="border-b border-neutral-100">
                    <td className="py-2 font-semibold uppercase">{l.entryType.replace('_', ' ')}</td>
                    <td className="py-2 text-neutral-600">{l.note}</td>
                    <td
                      className={`py-2 text-right font-bold ${
                        l.commissionAmount < 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatBdt(l.commissionAmount, lang)}
                    </td>
                    <td className="py-2 text-right">{formatBdt(l.netRestaurantAmount, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <h2 className="font-bold text-sm text-[#2E3138]">
              {lang === 'bn' ? 'রেস্টুরেন্ট পেআউট অনুমোদন' : 'Restaurant Payout Queue'}
            </h2>
            {payouts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-[#2E3138]">{p.restaurantName}</p>
                  <p className="text-neutral-500 tabular-nums">
                    {formatBdt(p.amount, lang)} · {p.method.toUpperCase()} ({p.accountNumber})
                  </p>
                </div>
                {p.status === 'pending' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePayoutDecision(p.id, 'paid')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold"
                    >
                      Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePayoutDecision(p.id, 'rejected')}
                      className="px-2.5 py-1 rounded border border-red-200 text-red-600 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="font-bold uppercase text-neutral-600">{p.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'coupons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateCoupon}
            className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 h-fit"
          >
            <h2 className="font-bold text-sm text-[#2E3138]">
              {lang === 'bn' ? 'নতুন প্রোমো কুপন তৈরি করুন' : 'Create Marketplace Coupon'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Code (e.g. EID100)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg uppercase"
              />
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as 'percentage' | 'fixed' | 'free_delivery')}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
              >
                <option value="fixed">Fixed BDT Off</option>
                <option value="percentage">Percentage Off</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            <input
              required
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
              <input
                type="number"
                placeholder="Min Order"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold"
            >
              {lang === 'bn' ? 'কুপন প্রকাশ করুন' : 'Publish Coupon'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 space-y-2.5">
            <h3 className="font-bold text-sm text-[#2E3138]">
              Marketplace Coupons ({coupons.length})
            </h3>
            {coupons.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-neutral-100 pb-2.5"
              >
                <div>
                  <span className="font-mono-nums font-bold text-[#E21B70]">{c.code}</span> — {c.title}
                  <p className="text-[11px] text-neutral-400 tabular-nums">
                    Type: {c.type} · Value: {c.value} · Min ৳{c.minOrder}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c)}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c.id)}
                    aria-label={`Delete coupon ${c.code}`}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Admin & Super Admin Governance Policy */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#E21B70] shrink-0" />
              <div>
                <p className="font-bold text-[#2E3138]">
                  {lang === 'bn'
                    ? 'সুপার অ্যাডমিন ও রোল অ্যাক্সেস কন্ট্রোল'
                    : 'Admin & Super Admin Access Governance'}
                </p>
                <p className="text-neutral-600 mt-0.5">
                  {lang === 'bn'
                    ? `পাবলিক সাইট থেকে কেউ সুপার অ্যাডমিন হতে পারবে না। শুধুমাত্র যাচাইকৃত সুপার অ্যাডমিন (${PRIMARY_SUPER_ADMIN_EMAIL}) অ্যাডমিন/সুপার অ্যাডমিন রোল নিয়ন্ত্রণ করবেন।`
                    : `Public role-switching to Super Admin is locked. Only verified Super Admins can assign or modify Admin & Super Admin roles, and ${PRIMARY_SUPER_ADMIN_EMAIL} is protected.`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#2E3138] text-white font-semibold">
              {currentUser.email} ({currentUser.role})
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h2 className="font-bold text-sm text-[#2E3138]">Platform Users & Roles ({users.length})</h2>
              {users.map((u) => {
                const isPrimaryOwner = u.email.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL;
                const canManagePrivileged = currentUser.role === 'super_admin';
                const rowLocked =
                  isPrimaryOwner ||
                  (!canManagePrivileged && (u.role === 'super_admin' || u.role === 'admin'));
                return (
                  <div
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-neutral-100 pb-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-[#2E3138]">{u.fullName}</p>
                        {isPrimaryOwner && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FFF0F6] text-[#E21B70] text-[10px] font-bold">
                            PRIMARY OWNER
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={rowLocked}
                        aria-label={`Role for ${u.email}`}
                        onChange={(e) => handleUpdateUser(u, { role: e.target.value })}
                        className="px-2 py-1 border border-neutral-200 rounded bg-white font-semibold disabled:opacity-50"
                      >
                        <option value="customer">customer</option>
                        <option value="restaurant_owner">restaurant_owner</option>
                        <option value="rider">rider</option>
                        {canManagePrivileged && <option value="admin">admin</option>}
                        {canManagePrivileged && <option value="super_admin">super_admin</option>}
                        {!canManagePrivileged && (u.role === 'admin' || u.role === 'super_admin') && (
                          <option value={u.role}>{u.role}</option>
                        )}
                      </select>
                      <button
                        type="button"
                        disabled={isPrimaryOwner || currentUser.uid === u.uid || rowLocked}
                        onClick={() =>
                          handleUpdateUser(u, { status: u.status === 'suspended' ? 'active' : 'suspended' })
                        }
                        className={`px-2.5 py-1 rounded border font-semibold disabled:opacity-40 ${
                          u.status === 'suspended'
                            ? 'border-emerald-200 text-emerald-700'
                            : 'border-red-200 text-red-600'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h2 className="font-bold text-sm text-[#2E3138]">
                Registered Riders & Live GPS ({riders.length})
              </h2>
              {riders.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-neutral-100 pb-2.5"
                >
                  <div>
                    <p className="font-semibold text-[#2E3138]">
                      {r.fullName} · {r.vehicleType}
                    </p>
                    <p className="text-neutral-500">
                      {r.zone} · {r.phone} · {r.totalDeliveries} trips ({formatBdt(r.totalEarnings, lang)})
                    </p>
                    <p className="text-[11px] font-mono-nums text-emerald-700 mt-0.5">
                      GPS: {Number(r.currentLat).toFixed(4)}, {Number(r.currentLng).toFixed(4)}
                      {r.locationUpdatedAt
                        ? ` · ${new Date(r.locationUpdatedAt).toLocaleTimeString()}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      aria-label={`Status for rider ${r.fullName}`}
                      onChange={(e) => handleUpdateRider(r, { status: e.target.value })}
                      className="px-2 py-1 border border-neutral-200 rounded bg-white font-semibold"
                    >
                      <option value="approved">approved</option>
                      <option value="pending">pending</option>
                      <option value="suspended">suspended</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleUpdateRider(r, { isAvailable: !r.isAvailable })}
                      className={`px-2.5 py-1 rounded font-semibold ${
                        r.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {r.isAvailable ? 'Online' : 'Offline'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload / Edit Product Modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProductModal}
            className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#2E3138]">
                {productModal.id
                  ? lang === 'bn'
                    ? 'পণ্য সম্পাদনা করুন'
                    : 'Edit Product'
                  : lang === 'bn'
                  ? 'নতুন পণ্য আপলোড করুন'
                  : 'Upload New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModal(null)}
                aria-label="Close product modal"
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Restaurant</label>
                <select
                  value={productModal.restaurantId}
                  onChange={(e) =>
                    setProductModal({ ...productModal, restaurantId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                <input
                  required
                  value={productModal.category}
                  onChange={(e) => setProductModal({ ...productModal, category: e.target.value })}
                  placeholder="e.g. Biriyani, Burgers, Drinks"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Product Name (English)</label>
                <input
                  required
                  value={productModal.name}
                  onChange={(e) => setProductModal({ ...productModal, name: e.target.value })}
                  placeholder="e.g. Royal Mutton Kacchi"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">পণ্যের নাম (বাংলা)</label>
                <input
                  required
                  value={productModal.nameBn}
                  onChange={(e) => setProductModal({ ...productModal, nameBn: e.target.value })}
                  placeholder="যেমন: রয়েল মাটন কাচ্চি"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Price (BDT ৳)</label>
                <input
                  required
                  type="number"
                  min="10"
                  value={productModal.price}
                  onChange={(e) => setProductModal({ ...productModal, price: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Discount Price (Optional ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 299"
                  value={productModal.discountPrice}
                  onChange={(e) =>
                    setProductModal({ ...productModal, discountPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-neutral-700">
                Product Photo (File Upload or URL)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] font-semibold">
                  <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleUploadImage(f, (url) =>
                          setProductModal((prev) => (prev ? { ...prev, imageUrl: url } : null))
                        );
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={productModal.imageUrl}
                  onChange={(e) => setProductModal({ ...productModal, imageUrl: e.target.value })}
                  placeholder="https://... or leave blank for restaurant cover"
                  className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                />
              </div>
              {productModal.imageUrl && (
                <img
                  src={productModal.imageUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl object-cover border border-neutral-200 mt-1"
                />
              )}
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={productModal.description}
                onChange={(e) => setProductModal({ ...productModal, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productModal.inStock}
                  onChange={(e) => setProductModal({ ...productModal, inStock: e.target.checked })}
                />
                <span>In Stock</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productModal.isAvailable}
                  onChange={(e) =>
                    setProductModal({ ...productModal, isAvailable: e.target.checked })
                  }
                />
                <span>Visible on Menu</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productModal.isPopular}
                  onChange={(e) =>
                    setProductModal({ ...productModal, isPopular: e.target.checked })
                  }
                />
                <span>Popular Item</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductModal(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProduct || uploadingPhoto}
                className="px-5 py-2 rounded-xl bg-[#E21B70] text-white text-xs font-semibold disabled:opacity-50"
              >
                {savingProduct
                  ? 'Saving...'
                  : productModal.id
                  ? 'Save Product Changes'
                  : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Restaurant Modal */}
      {restaurantModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRestaurantModal}
            className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#2E3138]">
                {restaurantModal.id ? 'Edit Restaurant' : 'Create Approved Restaurant'}
              </h3>
              <button
                type="button"
                onClick={() => setRestaurantModal(null)}
                aria-label="Close restaurant modal"
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Name (EN)</label>
                <input
                  required
                  value={restaurantModal.name}
                  onChange={(e) => setRestaurantModal({ ...restaurantModal, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Name (BN)</label>
                <input
                  required
                  value={restaurantModal.nameBn}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, nameBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Cuisine</label>
                <input
                  required
                  value={restaurantModal.cuisine}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, cuisine: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dhaka Area</label>
                <select
                  value={restaurantModal.area}
                  onChange={(e) => setRestaurantModal({ ...restaurantModal, area: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
                >
                  {DHAKA_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Address</label>
                <input
                  required
                  value={restaurantModal.address}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Delivery Fee (৳)</label>
                <input
                  type="number"
                  value={restaurantModal.deliveryFee}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, deliveryFee: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Minimum Order (৳)</label>
                <input
                  type="number"
                  value={restaurantModal.minOrder}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, minOrder: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Discount Badge (%)</label>
                <input
                  type="number"
                  value={restaurantModal.discountPct}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, discountPct: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Opening Hours</label>
                <input
                  value={restaurantModal.openingHours}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, openingHours: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>
            </div>

<<<<<<< HEAD
            {modalError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {modalError}
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-neutral-700">
                {lang === 'bn' ? 'রেস্টুরেন্ট লোগো ছবি (Logo)' : 'Restaurant Logo Image'}
              </label>
              <div className="flex items-center gap-2.5">
                {restaurantModal.logoUrl ? (
                  <img
                    src={restaurantModal.logoUrl}
                    alt="Restaurant logo preview"
                    className="w-11 h-11 rounded-xl object-cover border border-neutral-200 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] font-semibold shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (f) {
                        handleUploadImage(f, (url) =>
                          setRestaurantModal((prev) => (prev ? { ...prev, logoUrl: url } : null))
                        );
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={restaurantModal.logoUrl}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, logoUrl: e.target.value })
                  }
                  placeholder="https://... or /uploads/..."
                  className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                />
                {restaurantModal.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setRestaurantModal({ ...restaurantModal, logoUrl: '' })}
                    aria-label="Clear logo"
                    className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-neutral-700">
                {lang === 'bn' ? 'কভার ব্যানার ছবি (Cover Image)' : 'Cover Image'}
              </label>
              <div className="flex items-center gap-2.5">
                {restaurantModal.coverUrl && (
                  <img
                    src={restaurantModal.coverUrl}
                    alt="Restaurant cover preview"
                    className="w-16 h-11 rounded-lg object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] font-semibold shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
=======
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-neutral-700">Cover Image</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-[#E21B70] font-semibold">
                  <Upload className="w-3.5 h-3.5 text-[#E21B70]" />
                  <span>Upload Cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
                      if (f) {
                        handleUploadImage(f, (url) =>
                          setRestaurantModal((prev) => (prev ? { ...prev, coverUrl: url } : null))
                        );
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={restaurantModal.coverUrl}
                  onChange={(e) =>
                    setRestaurantModal({ ...restaurantModal, coverUrl: e.target.value })
                  }
                  placeholder="https://... or /uploads/..."
                  className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestaurantModal(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingRestaurant || uploadingPhoto}
                className="px-5 py-2 rounded-xl bg-[#E21B70] text-white text-xs font-semibold disabled:opacity-50"
              >
                {savingRestaurant ? 'Saving...' : 'Save Restaurant'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
