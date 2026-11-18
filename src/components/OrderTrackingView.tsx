import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Clock,
  CreditCard,
  LocateFixed,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { calculateLiveRiderEta, formatBdt } from '../lib/marketplace-logic';
import { DhakaMapPicker } from './DhakaMapPicker';
import type { Lang, OrderRecord, Restaurant, RiderLiveLocation } from '../types/marketplace';

interface OrderTrackingViewProps {
  orderId: number;
  lang: Lang;
  mapsApiKey: string;
  onBack: () => void;
}

const STEPS = [
  { key: 'confirmed', labelBn: 'অর্ডার কনফার্মড', labelEn: 'Order Confirmed' },
  { key: 'accepted', labelBn: 'রেস্টুরেন্ট গ্রহণ করেছে', labelEn: 'Accepted by Kitchen' },
  { key: 'preparing', labelBn: 'খাবার তৈরি হচ্ছে', labelEn: 'Preparing Food' },
  { key: 'ready', labelBn: 'পিকআপের জন্য প্রস্তুত', labelEn: 'Ready for Pickup' },
  { key: 'rider_assigned', labelBn: 'রাইডার নির্ধারিত', labelEn: 'Rider Assigned' },
  { key: 'on_the_way', labelBn: 'পথে রয়েছে', labelEn: 'On the Way' },
  { key: 'delivered', labelBn: 'ডেলিভারি সম্পন্ন', labelEn: 'Delivered' },
];

export function OrderTrackingView({ orderId, lang, mapsApiKey, onBack }: OrderTrackingViewProps) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [riderLocation, setRiderLocation] = useState<RiderLiveLocation | null>(null);
  const [history, setHistory] = useState<Array<{ id: number; status: string; note: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [routeEstimate, setRouteEstimate] = useState<{ distanceKm: number; drivingMinutes: number } | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const res = await apiFetch<{
        order: OrderRecord;
        restaurant: Restaurant | null;
        riderLocation?: RiderLiveLocation | null;
        history: Array<{ id: number; status: string; note: string; createdAt: string }>;
      }>(`/api/orders/${orderId}`);
      setOrder(res.order);
      setRestaurant(res.restaurant);
      setRiderLocation(res.riderLocation ?? null);
      setHistory(res.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const isTerminal = order?.status === 'delivered' || order?.status === 'cancelled';

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (isTerminal) return;
    const timer = setInterval(loadOrder, 4000);
    return () => clearInterval(timer);
  }, [loadOrder, isTerminal]);

  useEffect(() => {
    if (!order || !restaurant) return;
    apiFetch<{ route: { distanceKm: number; drivingMinutes: number } }>(
      `/api/free/route?fromLat=${restaurant.lat}&fromLng=${restaurant.lng}&toLat=${order.deliveryLat}&toLng=${order.deliveryLng}`
    )
      .then((res) => setRouteEstimate(res.route))
      .catch(() => {});
  }, [order, restaurant]);

  const handleVerifyPayment = async () => {
    if (!order) return;
    setVerifying(true);
    try {
      const res = await apiFetch<{ order: OrderRecord }>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          transactionId: order.paymentTxId || `TX-${order.orderNumber}`,
        }),
      });
      setOrder(res.order);
      await loadOrder();
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !comment.trim()) return;
    await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: order.restaurantId,
        orderId: order.id,
        rating,
        foodRating: rating,
        comment: comment.trim(),
      }),
    });
    setReviewSubmitted(true);
  };

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#E21B70]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'মার্কেটপ্লেসে ফিরুন' : 'Back to Storefront'}</span>
        </button>

        <button
          type="button"
          onClick={loadOrder}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#E21B70] px-3 py-1.5 rounded-lg border border-neutral-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'আপডেট করুন' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Order Header & Online Payment Verification Action */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono-nums text-neutral-500">
              {order.orderNumber} · {order.deliveryProvider}
              {order.consignmentId ? ` (${order.consignmentId})` : ''}
            </p>
            <h1 className="text-2xl font-bold text-[#2E3138] mt-1">
              {order.restaurantName}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              {lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Delivering to:'} {order.deliveryAddress}
            </p>
          </div>

          <div className="text-right tabular-nums">
            <p className="text-xl font-bold text-[#E21B70]">{formatBdt(order.totalAmount, lang)}</p>
            <p className="text-xs font-medium text-neutral-600 mt-0.5">
              {order.paymentMethod.toUpperCase()} ·{' '}
              <span
                className={
                  order.paymentStatus === 'paid'
                    ? 'text-emerald-700 font-semibold'
                    : order.paymentStatus === 'refunded'
                    ? 'text-red-600 font-semibold'
                    : 'text-amber-700 font-semibold'
                }
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        {order.paymentMethod !== 'cod' && order.paymentStatus === 'pending' && !isCancelled && (
          <div className="mt-4 p-4 rounded-xl bg-[#FFF0F6] border border-[#E21B70]/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-[#2E3138]">
              <CreditCard className="w-4 h-4 text-[#E21B70]" />
              <span>
                {lang === 'bn'
                  ? `${order.paymentMethod.toUpperCase()} স্যান্ডবক্স পেমেন্ট সম্পন্ন ও যাচাই করুন (${order.paymentTxId})`
                  : `Verify ${order.paymentMethod.toUpperCase()} Sandbox Payment (${order.paymentTxId})`}
              </span>
            </div>
            <button
              type="button"
              disabled={verifying}
              onClick={handleVerifyPayment}
              className="px-4 py-2 rounded-lg bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {verifying
                  ? lang === 'bn'
                    ? 'যাচাই হচ্ছে...'
                    : 'Verifying...'
                  : lang === 'bn'
                  ? 'পেমেন্ট যাচাই করুন'
                  : 'Complete & Verify Payment'}
              </span>
            </button>
          </div>
        )}

        {/* Status Timeline */}
        {isCancelled ? (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {lang === 'bn' ? 'অর্ডার বাতিল করা হয়েছে:' : 'Order Cancelled:'} {order.cancelReason}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STEPS.map((st, idx) => {
              const reached = idx <= currentIdx || (order.status === 'picked_up' && idx <= 5);
              return (
                <div
                  key={st.key}
                  className={`p-3 rounded-xl border text-xs ${
                    reached
                      ? 'border-[#E21B70] bg-[#FFF0F6] text-[#2E3138]'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {reached ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E21B70] shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="font-semibold">0{idx + 1}</span>
                  </div>
                  <p className="font-medium leading-tight">{lang === 'bn' ? st.labelBn : st.labelEn}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Map + Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#2E3138] flex items-center gap-2">
              <span>{lang === 'bn' ? 'লাইভ ডেলিভারি রুট ও রাইডার ট্র্যাকিং' : 'Live Delivery Route & Rider GPS'}</span>
              {riderLocation && !isTerminal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE GPS
                </span>
              )}
            </h2>
            {routeEstimate && (
              <span className="text-xs font-medium text-neutral-500 tabular-nums">
                {routeEstimate.distanceKm.toFixed(1)} km road route · ~{routeEstimate.drivingMinutes} min drive
              </span>
            )}
          </div>

          <DhakaMapPicker
            mapsApiKey={mapsApiKey}
            lang={lang}
            center={{ lat: order.deliveryLat, lng: order.deliveryLng }}
            markerLabel={order.deliveryArea}
            secondaryPoint={
              restaurant
                ? { lat: restaurant.lat, lng: restaurant.lng, label: restaurant.name }
                : undefined
            }
            riderPoint={
              riderLocation
                ? {
                    lat: riderLocation.lat,
                    lng: riderLocation.lng,
                    label: `${riderLocation.fullName} (Live)`,
                  }
                : undefined
            }
            heightClass="h-[280px]"
          />

          {/* Live Rider Telemetry Card */}
          {riderLocation ? (
            (() => {
              const goingToRestaurant = order.status === 'rider_assigned' && Boolean(restaurant);
              const targetLat = goingToRestaurant && restaurant ? restaurant.lat : order.deliveryLat;
              const targetLng = goingToRestaurant && restaurant ? restaurant.lng : order.deliveryLng;
              const liveEta = calculateLiveRiderEta(
                riderLocation.lat,
                riderLocation.lng,
                targetLat,
                targetLng,
                order.status
              );
              return (
                <div
                  data-testid="live-rider-card"
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-[#2E3138]">{riderLocation.fullName}</p>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800">
                          {riderLocation.vehicleType} · {riderLocation.zone}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 font-mono-nums flex items-center gap-1.5 mt-0.5">
                        <LocateFixed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span>
                          {lang === 'bn' ? 'আপডেট:' : 'Updated'}{' '}
                          {new Date(riderLocation.locationUpdatedAt).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isTerminal && (
                      <div className="text-right tabular-nums">
                        <p className="text-xs font-bold text-emerald-800">
                          {liveEta.remainingKm.toFixed(2)} km {goingToRestaurant ? (lang === 'bn' ? 'রেস্টুরেন্টের পথে' : 'to pickup') : (lang === 'bn' ? 'দূরে' : 'away')}
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          {lang === 'bn' ? `প্রায় ${liveEta.etaMinutes} মিনিট বাকি` : `~${liveEta.etaMinutes} min live ETA`}
                        </p>
                      </div>
                    )}
                    {riderLocation.phone && (
                      <a
                        href={`tel:${riderLocation.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কল করুন' : 'Call Rider'}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()
          ) : order.deliveryMode === 'third_party' ? (
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3 text-xs text-neutral-700">
              <Truck className="w-4 h-4 text-[#E21B70] shrink-0" />
              <span>
                {lang === 'bn'
                  ? `Pathao Courier দ্বারা ডেলিভারি চলছে (${order.consignmentId || order.orderNumber})।`
                  : `Tracked via ${order.deliveryProvider} (${order.consignmentId || order.orderNumber}).`}
              </span>
            </div>
          ) : null}

          <div className="pt-1 space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-start justify-between text-xs text-neutral-600">
                <span>
                  <strong className="text-[#2E3138] uppercase">{h.status.replace('_', ' ')}</strong> — {h.note}
                </span>
                <span className="font-mono-nums text-neutral-400 shrink-0 ml-2">
                  {new Date(h.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-sm font-bold text-[#2E3138] mb-3">
              {lang === 'bn' ? 'অর্ডার রসিদ' : 'Order Summary'}
            </h2>
            <div className="space-y-2.5 text-sm">
              {order.itemsSnapshotJson.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-2">
                  <span className="text-neutral-700">
                    {item.quantity}x {lang === 'bn' ? item.nameBn : item.name}
                    {item.variation ? ` (${item.variation})` : ''}
                  </span>
                  <span className="font-semibold tabular-nums">{formatBdt(item.lineTotal, lang)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs text-neutral-600 tabular-nums">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span>{formatBdt(order.subtotal, lang)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                    <span>−{formatBdt(order.discountAmount, lang)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ডেলিভারি ফি' : 'Delivery Fee'}</span>
                  <span>{formatBdt(order.deliveryFee, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'সার্ভিস চার্জ' : 'Service Fee'}</span>
                  <span>{formatBdt(order.serviceFee, lang)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#2E3138] pt-2 border-t border-neutral-100">
                  <span>{lang === 'bn' ? 'মোট' : 'Total'}</span>
                  <span className="text-[#E21B70]">{formatBdt(order.totalAmount, lang)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.status === 'delivered' && !reviewSubmitted && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
              <h2 className="text-sm font-bold text-[#2E3138]">
                {lang === 'bn' ? 'রেস্টুরেন্টকে রেটিং দিন' : 'Rate Your Experience'}
              </h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        n <= rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={lang === 'bn' ? 'খাবারের মান কেমন ছিল লিখুন...' : 'Share your feedback...'}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#2E3138] text-white text-xs font-semibold hover:bg-black"
              >
                {lang === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Verified Review'}
              </button>
            </form>
          )}

          {reviewSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              {lang === 'bn' ? 'ধন্যবাদ! আপনার রিভিউ প্রকাশিত হয়েছে।' : 'Thank you! Your verified review has been published.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
