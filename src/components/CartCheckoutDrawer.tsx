import React, { useEffect, useState } from 'react';
import { Bike, CreditCard, ShieldCheck, ShoppingBag, Store, Tag, Trash2, Truck, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import {
  calculateCartItemUnitPrice,
  calculateCartSubtotal,
  calculateOrderFinancials,
  type CartItemInput,
  convertBdtToCurrency,
  type DeliveryMode,
  formatBdt,
  type PaymentMethod,
} from '../lib/marketplace-logic';
import { DHAKA_AREAS } from '../lib/i18n';
import { DhakaMapPicker } from './DhakaMapPicker';
import type { Lang, Restaurant } from '../types/marketplace';

interface CartCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItemInput[];
  restaurant: Restaurant | null;
  lang: Lang;
  mapsApiKey: string;
  selectedArea: { name: string; lat: number; lng: number };
  customerName: string;
  onUpdateQty: (idx: number, delta: number) => void;
  onRemoveItem: (idx: number) => void;
  onClearCart: () => void;
  onOrderCreated: (orderId: number) => void;
}

export function CartCheckoutDrawer({
  open,
  onClose,
  cartItems,
  restaurant,
  lang,
  mapsApiKey,
  selectedArea,
  customerName,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}: CartCheckoutDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    freeDelivery: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [name, setName] = useState(customerName || 'Rahim Uddin');
  const [phone, setPhone] = useState('+8801711000001');
  const [area, setArea] = useState(selectedArea.name);
  const [addressLine, setAddressLine] = useState(`House 24, Road 71, ${selectedArea.name}, Dhaka`);
  const [coords, setCoords] = useState({ lat: selectedArea.lat, lng: selectedArea.lng });
  const [instructions, setInstructions] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(restaurant?.deliveryMode || 'platform');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [quoteFee, setQuoteFee] = useState<number>(restaurant?.deliveryFee ?? 49);
  const [quoteEta, setQuoteEta] = useState<number>(restaurant?.deliveryTimeMin ?? 25);
  const [quoteDistanceKm, setQuoteDistanceKm] = useState<number | null>(null);
  const [quoteWeather, setQuoteWeather] = useState<string>('');
  const [usdRate, setUsdRate] = useState<number>(0.00833);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setArea(selectedArea.name);
    setCoords({ lat: selectedArea.lat, lng: selectedArea.lng });
  }, [selectedArea]);

  useEffect(() => {
    if (customerName) {
      setName(customerName);
    }
  }, [customerName]);

  useEffect(() => {
    if (restaurant) {
      setDeliveryMode(restaurant.deliveryMode || 'platform');
      setQuoteFee(restaurant.deliveryFee ?? 49);
      setQuoteEta(restaurant.deliveryTimeMin ?? 25);
      setAppliedCoupon(null);
      setCouponError(null);
    }
  }, [restaurant?.id]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setStep('cart');
      setAppliedCoupon(null);
      setCouponError(null);
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (!open) return;
    apiFetch<{ rates?: { USD?: number } }>('/api/free/rates')
      .then((res) => {
        if (res.rates?.USD) setUsdRate(res.rates.USD);
      })
      .catch(() => {
        // fallback rate preserved
      });
  }, [open]);

  useEffect(() => {
    if (!restaurant) return;
    apiFetch<{
      quote: {
        fee: number;
        etaMinutes: number;
        distanceKm?: number;
        weatherLabel?: string;
        rainBufferMin?: number;
      };
    }>('/api/delivery/quote', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: restaurant.id,
        dropoffLat: coords.lat,
        dropoffLng: coords.lng,
        deliveryMode,
      }),
    })
      .then((res) => {
        setQuoteFee(res.quote.fee);
        setQuoteEta(res.quote.etaMinutes);
        setQuoteDistanceKm(typeof res.quote.distanceKm === 'number' ? res.quote.distanceKm : null);
        setQuoteWeather(res.quote.weatherLabel || '');
      })
      .catch(() => {
        setQuoteFee(restaurant.deliveryFee);
      });
  }, [restaurant, coords.lat, coords.lng, deliveryMode]);

  if (!open) return null;

  const subtotal = calculateCartSubtotal(cartItems);
  const effectiveDeliveryFee = appliedCoupon?.freeDelivery ? 0 : quoteFee;
  const financials = calculateOrderFinancials({
    subtotal,
    discountAmount: appliedCoupon?.discountAmount ?? 0,
    deliveryFee: effectiveDeliveryFee,
    serviceFee: 10,
    commissionType: restaurant?.commissionType || 'percentage',
    commissionRate: Number(restaurant?.commissionRate ?? 15),
    fixedCommission: restaurant?.fixedCommission ?? 0,
  });

  const handleApplyCoupon = async () => {
    if (!restaurant || !couponInput.trim()) return;
    setCouponError(null);
    try {
      const res = await apiFetch<{
        valid: boolean;
        discountAmount: number;
        deliveryFeeAfterCoupon: number;
        reason?: string;
        coupon?: { code: string; type: string };
      }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal,
          deliveryFee: quoteFee,
          restaurantId: restaurant.id,
        }),
      });
      if (!res.valid) {
        setCouponError(res.reason || 'Invalid coupon');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({
        code: res.coupon?.code || couponInput.trim().toUpperCase(),
        discountAmount: res.discountAmount,
        freeDelivery: res.deliveryFeeAfterCoupon === 0 && quoteFee > 0,
      });
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Coupon check failed');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || cartItems.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await apiFetch<{ order: { id: number } }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: restaurant.id,
          customerName: name,
          customerPhone: phone,
          deliveryAddress: addressLine,
          deliveryArea: area,
          deliveryLat: coords.lat,
          deliveryLng: coords.lng,
          deliveryInstructions: instructions,
          deliveryMode,
          paymentMethod,
          couponCode: appliedCoupon?.code || '',
          items: cartItems.map((i) => ({
            foodItemId: i.foodItemId,
            quantity: i.quantity,
            variationName: i.variationName,
            addons: i.addons.map((a) => a.name),
            specialInstructions: i.specialInstructions,
          })),
        }),
      });
      onClearCart();
      setStep('cart');
      onOrderCreated(res.order.id);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Order submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E21B70]" />
            <h2 className="font-bold text-[#2E3138] text-base">
              {step === 'cart'
                ? lang === 'bn'
                  ? 'আপনার কার্ট'
                  : 'Your Cart'
                : lang === 'bn'
                ? 'চেকআউট ও পেমেন্ট'
                : 'Checkout & Payment'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3" />
            <p className="font-semibold text-[#2E3138]">
              {lang === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {lang === 'bn'
                ? 'অর্ডার করতে পছন্দের রেস্টুরেন্ট থেকে খাবার যোগ করুন।'
                : 'Add dishes from any restaurant to begin.'}
            </p>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {restaurant && (
                <div className="pb-3 border-b border-neutral-100">
                  <p className="text-xs text-neutral-500">
                    {lang === 'bn' ? 'রেস্টুরেন্ট' : 'Ordering from'}
                  </p>
                  <p className="font-bold text-[#2E3138]">
                    {lang === 'bn' ? restaurant.nameBn : restaurant.name}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {cartItems.map((item, idx) => {
                  const unit = calculateCartItemUnitPrice(item);
                  return (
                    <div
                      key={`${item.foodItemId}-${idx}`}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-neutral-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#2E3138] truncate">
                          {lang === 'bn' ? item.nameBn : item.name}
                        </p>
                        {item.variationName && (
                          <p className="text-xs text-neutral-500">{item.variationName}</p>
                        )}
                        {item.addons.length > 0 && (
                          <p className="text-xs text-neutral-500">
                            + {item.addons.map((a) => a.name).join(', ')}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[#E21B70] mt-1 tabular-nums">
                          {formatBdt(unit * item.quantity, lang)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => onUpdateQty(idx, -1)}
                          className="w-7 h-7 rounded-md border border-neutral-200 text-xs font-bold hover:bg-neutral-100"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => onUpdateQty(idx, 1)}
                          className="w-7 h-7 rounded-md border border-neutral-200 text-xs font-bold hover:bg-neutral-100"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => onRemoveItem(idx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {lang === 'bn' ? 'প্রোমো কোড (যেমন: FOODORA50 / FREEDEL)' : 'Promo Coupon (FOODORA50 / FREEDEL)'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="FOODORA50"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg uppercase focus:outline-none focus:border-[#E21B70]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-lg bg-[#2E3138] text-white text-xs font-semibold hover:bg-black"
                  >
                    {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    Applied {appliedCoupon.code}: −{formatBdt(appliedCoupon.discountAmount, lang)}
                    {appliedCoupon.freeDelivery ? ' + Free Delivery' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-2 text-sm tabular-nums">
              <div className="flex justify-between text-neutral-600">
                <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>{formatBdt(financials.subtotal, lang)}</span>
              </div>
              {financials.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                  <span>−{formatBdt(financials.discountAmount, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>{lang === 'bn' ? 'ডেলিভারি ফি' : 'Delivery Fee'}</span>
                <span>{formatBdt(financials.deliveryFee, lang)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{lang === 'bn' ? 'সার্ভিস চার্জ' : 'Service Fee'}</span>
                <span>{formatBdt(financials.serviceFee, lang)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#2E3138] pt-2 border-t border-neutral-200">
                <span>{lang === 'bn' ? 'সর্বমোট' : 'Total Payable'}</span>
                <div className="text-right">
                  <span className="text-[#E21B70]">{formatBdt(financials.totalPayable, lang)}</span>
                  <p className="text-[11px] font-medium text-neutral-500">
                    ≈ ${convertBdtToCurrency(financials.totalPayable, usdRate).toFixed(2)} USD
                  </p>
                </div>
              </div>

              {restaurant && subtotal < restaurant.minOrder && (
                <p className="text-xs text-amber-700 font-medium">
                  {lang === 'bn'
                    ? `ন্যূনতম অর্ডার ${formatBdt(restaurant.minOrder, lang)}`
                    : `Minimum order is ${formatBdt(restaurant.minOrder, lang)}`}
                </p>
              )}

              <button
                type="button"
                disabled={Boolean(restaurant && subtotal < restaurant.minOrder)}
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white font-semibold text-sm disabled:opacity-50 transition-colors mt-2"
              >
                {lang === 'bn' ? 'চেকআউট করুন' : 'Continue to Checkout'}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-xs font-semibold text-[#E21B70] hover:underline"
              >
                ← {lang === 'bn' ? 'কার্টে ফিরুন' : 'Back to Cart'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {lang === 'bn' ? 'নাম' : 'Full Name'}
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}
                  </label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {lang === 'bn' ? 'ঢাকা এলাকা' : 'Dhaka Delivery Zone'}
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
                  {lang === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Street Address'}
                </label>
                <input
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-700 mb-1">
                  {lang === 'bn' ? 'ম্যাপ পিন নির্ধারণ করুন' : 'Pin Delivery Location'}
                </p>
                <DhakaMapPicker
                  mapsApiKey={mapsApiKey}
                  lang={lang}
                  center={coords}
                  markerLabel={area}
                  secondaryPoint={
                    restaurant ? { lat: restaurant.lat, lng: restaurant.lng, label: restaurant.name } : undefined
                  }
                  interactive
                  heightClass="h-[180px]"
                  onSelectLocation={(c) => {
                    setCoords({ lat: c.lat, lng: c.lng });
                    if (c.areaName) {
                      setArea(c.areaName);
                    } else {
                      apiFetch<{ displayName: string; areaName: string }>(
                        `/api/free/reverse-geocode?lat=${c.lat}&lng=${c.lng}`
                      )
                        .then((r) => {
                          if (r.areaName) setArea(r.areaName);
                          if (r.displayName) setAddressLine(r.displayName.split(',').slice(0, 3).join(', '));
                        })
                        .catch(() => {});
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {lang === 'bn' ? 'ডেলিভারি সিস্টেম' : 'Delivery Provider'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'platform' as const, label: 'Foodora Rider', icon: Bike },
                    { id: 'third_party' as const, label: 'Pathao Courier', icon: Truck },
                    { id: 'restaurant' as const, label: 'Restaurant', icon: Store },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliveryMode(opt.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 ${
                          deliveryMode === opt.id
                            ? 'border-[#E21B70] bg-[#FFF0F6] text-[#E21B70]'
                            : 'border-neutral-200 text-neutral-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5 tabular-nums">
                  {lang === 'bn' ? 'আনুমানিক সময়:' : 'Estimated arrival:'} ~{quoteEta} mins
                  {quoteDistanceKm !== null ? ` · ${quoteDistanceKm.toFixed(1)} km road route` : ''}
                  {quoteWeather ? ` · ${quoteWeather}` : ''} · {formatBdt(effectiveDeliveryFee, lang)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bkash' as const, label: 'bKash (বিকাশ)' },
                    { id: 'nagad' as const, label: 'Nagad (নগদ)' },
                    { id: 'sslcommerz' as const, label: 'SSLCommerz / Card' },
                    { id: 'cod' as const, label: 'Cash on Delivery' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        paymentMethod === pm.id
                          ? 'border-[#E21B70] bg-[#FFF0F6] text-[#E21B70]'
                          : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {lang === 'bn' ? 'ডেলিভারি নির্দেশনা' : 'Delivery Instructions'}
                </label>
                <input
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={lang === 'bn' ? 'গেটে পৌঁছে কল দেবেন...' : 'Ring bell / Call at main gate'}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {submitError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 bg-white">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'bn' ? 'সার্ভার-যাচাইকৃত নিরাপদ পেমেন্ট' : 'Server-verified checkout'}
                </span>
                <div className="text-right tabular-nums">
                  <span className="font-bold text-sm text-[#2E3138]">
                    {formatBdt(financials.totalPayable, lang)}
                  </span>
                  <span className="ml-1.5 text-[11px] text-neutral-400">
                    (${convertBdtToCurrency(financials.totalPayable, usdRate).toFixed(2)})
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                {submitting
                  ? lang === 'bn'
                    ? 'অর্ডার প্রসেস হচ্ছে...'
                    : 'Placing Order...'
                  : lang === 'bn'
                  ? 'অর্ডার নিশ্চিত করুন'
                  : 'Place Order Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
