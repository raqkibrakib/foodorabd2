import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Navigation,
  PackageCheck,
  Radio,
  Wallet,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { DHAKA_AREAS } from '../lib/i18n';
import { advanceRiderAlongRoute, calculateLiveRiderEta, formatBdt } from '../lib/marketplace-logic';
import { DhakaMapPicker } from './DhakaMapPicker';
import type { AppUser, Lang, OrderRecord, RiderRecord } from '../types/marketplace';

interface RiderDashboardProps {
  user: AppUser;
  lang: Lang;
  mapsApiKey: string;
  onRefreshUser: () => Promise<void>;
  onTrackOrder: (orderId: number) => void;
  onBack: () => void;
}

export function RiderDashboard({
  user,
  lang,
  mapsApiKey,
  onRefreshUser,
  onTrackOrder,
  onBack,
}: RiderDashboardProps) {
  const [rider, setRider] = useState<RiderRecord | null>(null);
  const [availableOrders, setAvailableOrders] = useState<OrderRecord[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Live GPS & availability state
  const [sharingGps, setSharingGps] = useState(false);
  const [syncingLoc, setSyncingLoc] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);
  const [selectedSyncZone, setSelectedSyncZone] = useState<string>(DHAKA_AREAS[0].name);
  const watchIdRef = useRef<number | null>(null);

  // Onboarding form
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState('+8801811000003');
  const [email, setEmail] = useState(user.email || 'rider@foodora.bd');
  const [vehicleType, setVehicleType] = useState<'Motorbike' | 'Bicycle' | 'Scooter'>('Motorbike');
  const [zone, setZone] = useState(DHAKA_AREAS[0].name);
  const [nidNumber, setNidNumber] = useState('1995261199887');
  const [registering, setRegistering] = useState(false);

  const canAccessRiderApi =
    user.role === 'rider' || user.role === 'admin' || user.role === 'super_admin';

  const loadWorkspace = useCallback(
    async (silent = false) => {
      if (!canAccessRiderApi) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      try {
        const res = await apiFetch<{
          rider: RiderRecord | null;
          availableOrders: OrderRecord[];
          assignedOrders: OrderRecord[];
        }>('/api/rider/workspace');
        setRider(res.rider);
        setAvailableOrders(res.availableOrders);
        setAssignedOrders(res.assignedOrders);
      } catch (err) {
        console.error('Failed to load rider workspace:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [canAccessRiderApi]
  );

  useEffect(() => {
    loadWorkspace(false);
    const timer = setInterval(() => loadWorkspace(true), 10000);
    return () => clearInterval(timer);
  }, [loadWorkspace]);

  const persistRiderLocation = useCallback(
    async (
      coords: { lat: number; lng: number; isAvailable?: boolean; zone?: string },
      statusNote?: string
    ) => {
      setSyncingLoc(true);
      try {
        const res = await apiFetch<{ rider: RiderRecord }>('/api/rider/location', {
          method: 'PATCH',
          body: JSON.stringify(coords),
        });
        setRider(res.rider);
        if (statusNote) setGpsStatusMsg(statusNote);
      } catch (err: unknown) {
        setGpsStatusMsg(err instanceof Error ? err.message : 'Failed to update rider location');
      } finally {
        setSyncingLoc(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!sharingGps) {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatusMsg(
        lang === 'bn'
          ? 'এই ব্রাউজারে GPS উপলব্ধ নয় — নিচের ম্যাপ বা বাটন দিয়ে লোকেশন আপডেট করুন।'
          : 'Browser Geolocation unavailable — tap map or use route step controls below.'
      );
      setSharingGps(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        persistRiderLocation(
          { lat: pos.coords.latitude, lng: pos.coords.longitude, isAvailable: true },
          lang === 'bn' ? 'লাইভ GPS সিঙ্ক হয়েছে' : 'Live browser GPS synced'
        );
      },
      () => {
        setGpsStatusMsg(
          lang === 'bn'
            ? 'GPS অনুমতি পাওয়া যায়নি — ম্যাপ বা এলাকা নির্বাচন করে লোকেশন দিন।'
            : 'GPS permission declined — use the interactive map or area quick-sync.'
        );
        setSharingGps(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [sharingGps, persistRiderLocation, lang]);

  const handleRegisterRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await apiFetch<{ rider: RiderRecord }>('/api/riders/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, phone, email, vehicleType, zone, nidNumber }),
      });
      setRider(res.rider);
      await onRefreshUser();
      await loadWorkspace(false);
    } finally {
      setRegistering(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    await apiFetch(`/api/rider/orders/${orderId}/accept`, { method: 'POST' });
    await loadWorkspace(true);
  };

  const handleUpdateStatus = async (orderId: number, status: 'picked_up' | 'on_the_way' | 'delivered') => {
    await apiFetch(`/api/rider/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadWorkspace(true);
  };

  const handleMoveAlongOrderRoute = async (ord: OrderRecord) => {
    if (!rider) return;
    const toRestaurant =
      ord.status === 'rider_assigned' &&
      typeof ord.restaurantLat === 'number' &&
      typeof ord.restaurantLng === 'number';
    const targetLat = toRestaurant && ord.restaurantLat ? ord.restaurantLat : ord.deliveryLat;
    const targetLng = toRestaurant && ord.restaurantLng ? ord.restaurantLng : ord.deliveryLng;

    const next = advanceRiderAlongRoute(rider.currentLat, rider.currentLng, targetLat, targetLng, 0.35);
    await persistRiderLocation(
      { lat: next.lat, lng: next.lng },
      lang === 'bn'
        ? `রাইডার লোকেশন আপডেট: ${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}`
        : `Moved rider toward ${toRestaurant ? ord.restaurantName : ord.deliveryArea} (${next.lat.toFixed(4)}, ${next.lng.toFixed(4)})`
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-44 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-sm text-neutral-500">
          {lang === 'bn' ? 'রাইডার ড্যাশবোর্ড লোড হচ্ছে...' : 'Loading Rider Workspace...'}
        </div>
      </div>
    );
  }

  const activeOrder = assignedOrders.find((o) =>
    ['rider_assigned', 'picked_up', 'on_the_way'].includes(o.status)
  );
  const riderCoords = {
    lat: rider?.currentLat ?? 23.7949,
    lng: rider?.currentLng ?? 90.4043,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#E21B70]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'bn' ? 'মার্কেটপ্লেসে ফিরুন' : 'Back to Storefront'}</span>
      </button>

      {!rider && !canAccessRiderApi ? (
        <form
          onSubmit={handleRegisterRider}
          className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-xl mx-auto space-y-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase text-[#E21B70]">
              {lang === 'bn' ? 'ডেলিভারি পার্টনার নিবন্ধন' : 'Delivery Rider Onboarding'}
            </p>
            <h1 className="text-2xl font-bold text-[#2E3138] mt-1">
              {lang === 'bn' ? 'Foodora BD রাইডার হিসেবে যোগ দিন' : 'Join Foodora BD Delivery Fleet'}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as 'Motorbike' | 'Bicycle' | 'Scooter')}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
              >
                <option value="Motorbike">Motorbike</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Dhaka Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white"
              >
                {DHAKA_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.nameBn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">NID Number</label>
            <input
              required
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={registering}
            className="w-full py-2.5 rounded-xl bg-[#E21B70] text-white text-xs font-semibold"
          >
            {registering
              ? lang === 'bn'
                ? 'নিবন্ধন হচ্ছে...'
                : 'Submitting...'
              : lang === 'bn'
              ? 'রাইডার অ্যাকাউন্ট সক্রিয় করুন'
              : 'Activate Rider Account'}
          </button>
        </form>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] text-[#E21B70] flex items-center justify-center">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#2E3138]">
                    {rider?.fullName || user.fullName}
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      rider?.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {rider?.isAvailable
                      ? lang === 'bn'
                        ? 'অনলাইন'
                        : 'Online'
                      : lang === 'bn'
                      ? 'অফলাইন'
                      : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {rider?.vehicleType || 'Motorbike'} · {rider?.zone || 'Gulshan 2'} ·{' '}
                  <span className="font-mono-nums">
                    GPS {riderCoords.lat.toFixed(4)}, {riderCoords.lng.toFixed(4)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 tabular-nums">
              {rider && (
                <button
                  type="button"
                  disabled={syncingLoc}
                  onClick={() =>
                    persistRiderLocation({
                      lat: rider.currentLat,
                      lng: rider.currentLng,
                      isAvailable: !rider.isAvailable,
                    })
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    rider.isAvailable
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : 'bg-white text-[#2E3138] border-neutral-300 hover:border-[#2E3138]'
                  }`}
                >
                  {rider.isAvailable
                    ? lang === 'bn'
                      ? 'অনলাইন আছেন (অফলাইন করুন)'
                      : 'Online · Go Offline'
                    : lang === 'bn'
                    ? 'অফলাইন আছেন (অনলাইন করুন)'
                    : 'Offline · Go Online'}
                </button>
              )}
              <div>
                <p className="text-xs text-neutral-500">{lang === 'bn' ? 'সম্পন্ন ডেলিভারি' : 'Deliveries'}</p>
                <p className="text-xl font-bold text-[#2E3138]">{rider?.totalDeliveries ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">{lang === 'bn' ? 'মোট আয়' : 'Total Earnings'}</p>
                <p className="text-xl font-bold text-[#E21B70]">
                  {formatBdt(rider?.totalEarnings ?? 0, lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Live GPS Broadcaster & Interactive Map */}
          {rider && (
            <section className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#2E3138] flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${sharingGps ? 'text-emerald-600 animate-pulse' : 'text-[#E21B70]'}`} />
                    <span>
                      {lang === 'bn' ? 'লাইভ রাইডার GPS লোকেশন' : 'Live Rider GPS Broadcast'}
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5 font-mono-nums">
                    {lang === 'bn' ? 'বর্তমান অবস্থান:' : 'Current Position:'}{' '}
                    {riderCoords.lat.toFixed(5)}, {riderCoords.lng.toFixed(5)}
                    {rider.locationUpdatedAt
                      ? ` · ${lang === 'bn' ? 'সর্বশেষ সিঙ্ক' : 'Synced'} ${new Date(
                          rider.locationUpdatedAt
                        ).toLocaleTimeString()}`
                      : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedSyncZone}
                    aria-label="Select Dhaka zone to sync rider GPS"
                    onChange={(e) => setSelectedSyncZone(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white font-semibold"
                  >
                    {DHAKA_AREAS.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.nameBn})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={syncingLoc}
                    onClick={() => {
                      const found = DHAKA_AREAS.find((a) => a.name === selectedSyncZone);
                      if (found) {
                        persistRiderLocation(
                          { lat: found.lat, lng: found.lng, zone: found.name },
                          lang === 'bn'
                            ? `${found.name} লোকেশনে সিঙ্ক হয়েছে`
                            : `Rider location set to ${found.name}`
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-[#E21B70] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-[#E21B70]" />
                    <span>{lang === 'bn' ? 'এলাকায় সিঙ্ক' : 'Sync Area'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSharingGps((v) => !v)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                      sharingGps
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-[#2E3138] text-white hover:bg-black'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>
                      {sharingGps
                        ? lang === 'bn'
                          ? 'লাইভ GPS চালু (বন্ধ করুন)'
                          : 'Live GPS Active · Stop'
                        : lang === 'bn'
                        ? 'লাইভ GPS শেয়ার করুন'
                        : 'Share Live GPS'}
                    </span>
                  </button>
                </div>
              </div>

              {gpsStatusMsg && (
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                  {gpsStatusMsg}
                </div>
              )}

              <DhakaMapPicker
                mapsApiKey={mapsApiKey}
                lang={lang}
                center={
                  activeOrder
                    ? { lat: activeOrder.deliveryLat, lng: activeOrder.deliveryLng }
                    : riderCoords
                }
                markerLabel={
                  activeOrder
                    ? `${activeOrder.deliveryArea} (Dropoff)`
                    : `${rider.fullName} (Position)`
                }
                secondaryPoint={
                  activeOrder &&
                  typeof activeOrder.restaurantLat === 'number' &&
                  typeof activeOrder.restaurantLng === 'number'
                    ? {
                        lat: activeOrder.restaurantLat,
                        lng: activeOrder.restaurantLng,
                        label: activeOrder.restaurantName,
                      }
                    : undefined
                }
                riderPoint={{
                  lat: riderCoords.lat,
                  lng: riderCoords.lng,
                  label: `${rider.fullName} (You)`,
                }}
                interactive
                heightClass="h-[240px]"
                onSelectLocation={(loc) => {
                  persistRiderLocation(
                    {
                      lat: loc.lat,
                      lng: loc.lng,
                      zone: loc.areaName && loc.areaName !== 'Current GPS' ? loc.areaName : undefined,
                    },
                    lang === 'bn'
                      ? `লোকেশন আপডেট হয়েছে (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`
                      : `Rider pin moved to ${loc.areaName || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}`
                  );
                }}
              />
            </section>
          )}

          {/* Available Platform Deliveries */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#2E3138] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#E21B70]" />
              <span>
                {lang === 'bn' ? 'ডেলিভারির জন্য উন্মুক্ত অর্ডার' : 'Available Platform Dispatch Queue'} (
                {availableOrders.length})
              </span>
            </h2>

            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500">
                {lang === 'bn'
                  ? 'এই মুহূর্তে কোনো পেন্ডিং ডেলিভারি নেই।'
                  : 'No unassigned Foodora Rider orders waiting right now.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-500 font-mono-nums">
                        <span>{ord.orderNumber}</span>
                        <span className="font-bold text-[#E21B70]">
                          +{formatBdt(Math.max(40, ord.deliveryFee), lang)} fee
                        </span>
                      </div>
                      <h3 className="font-bold text-[#2E3138] mt-1">{ord.restaurantName}</h3>
                      <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>
                          {ord.deliveryArea} — {ord.deliveryAddress}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(ord.id)}
                      className="w-full py-2 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white text-xs font-semibold"
                    >
                      {lang === 'bn' ? 'ডেলিভারি গ্রহণ করুন' : 'Accept Delivery Job'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Assigned Orders */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#2E3138] flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#2E3138]" />
              <span>
                {lang === 'bn' ? 'আপনার নির্ধারিত ডেলিভারি' : 'Your Assigned Deliveries'} ({assignedOrders.length})
              </span>
            </h2>

            {assignedOrders.map((ord) => {
              const isActive = ['rider_assigned', 'picked_up', 'on_the_way'].includes(ord.status);
              const etaInfo = isActive
                ? calculateLiveRiderEta(
                    riderCoords.lat,
                    riderCoords.lng,
                    ord.deliveryLat,
                    ord.deliveryLng,
                    ord.status
                  )
                : null;
              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono-nums text-neutral-500">
                      {ord.orderNumber} · {ord.customerName} ({ord.customerPhone})
                    </p>
                    <h3 className="font-bold text-sm text-[#2E3138]">
                      {ord.restaurantName} → {ord.deliveryArea}
                    </h3>
                    <p className="text-xs text-neutral-600">{ord.deliveryAddress}</p>
                    <p className="text-xs font-semibold text-[#E21B70] uppercase">
                      Status: {ord.status.replace(/_/g, ' ')} ·{' '}
                      {ord.paymentMethod === 'cod'
                        ? `Collect Cash: ${formatBdt(ord.totalAmount, lang)}`
                        : `Prepaid (${ord.paymentMethod.toUpperCase()})`}
                      {etaInfo ? ` · ${etaInfo.remainingKm.toFixed(2)} km (~${etaInfo.etaMinutes}m)` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isActive && rider && (
                      <button
                        type="button"
                        disabled={syncingLoc}
                        onClick={() => handleMoveAlongOrderRoute(ord)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'রুটে এগিয়ে যান' : 'Move Along Route'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onTrackOrder(ord.id)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold"
                    >
                      {lang === 'bn' ? 'ম্যাপ দেখুন' : 'Route Map'}
                    </button>
                    {ord.status === 'rider_assigned' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'picked_up')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2E3138] text-white text-xs font-semibold"
                      >
                        {lang === 'bn' ? 'পিকআপ সম্পন্ন' : 'Picked Up'}
                      </button>
                    )}
                    {ord.status === 'picked_up' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'on_the_way')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#E21B70] text-white text-xs font-semibold"
                      >
                        {lang === 'bn' ? 'পথে রয়েছি' : 'On The Way'}
                      </button>
                    )}
                    {(ord.status === 'on_the_way' || ord.status === 'picked_up' || ord.status === 'rider_assigned') && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Mark Delivered'}</span>
                      </button>
                    )}
                    {ord.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Wallet className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

