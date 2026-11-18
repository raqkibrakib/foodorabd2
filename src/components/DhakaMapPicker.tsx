import React, { useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Bike, LocateFixed, MapPin } from 'lucide-react';
import { DHAKA_AREAS } from '../lib/i18n';
import { haversineDistanceKm } from '../lib/marketplace-logic';
import type { Lang } from '../types/marketplace';

interface DhakaMapPickerProps {
  mapsApiKey: string;
  lang: Lang;
  center: { lat: number; lng: number };
  markerLabel?: string;
  secondaryPoint?: { lat: number; lng: number; label: string };
  riderPoint?: { lat: number; lng: number; label: string };
  interactive?: boolean;
  heightClass?: string;
  onSelectLocation?: (coords: { lat: number; lng: number; areaName?: string }) => void;
}

interface MapPolylineLike {
  setMap: (map: unknown) => void;
  setOptions: (opts: Record<string, unknown>) => void;
}

function RouteOverlay({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<MapPolylineLike[]>([]);

  useEffect(() => {
    if (!map || !routesLib) return;
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const request = {
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    };

    const RouteCls = (routesLib as unknown as { Route?: { computeRoutes: (req: unknown) => Promise<{ routes: any[] }> } }).Route;
    if (!RouteCls || typeof RouteCls.computeRoutes !== 'function') return;

    RouteCls.computeRoutes(request)
      .then(({ routes }) => {
        if (!routes || routes.length === 0) return;
        const primary = routes[0];
        if (typeof primary.createPolylines === 'function') {
          const lines = primary.createPolylines() as MapPolylineLike[];
          lines.forEach((p) => {
            p.setOptions({ strokeColor: '#E21B70', strokeWeight: 5 });
            p.setMap(map);
          });
          polylinesRef.current = lines;
        }
        if (primary.viewport) {
          map.fitBounds(primary.viewport);
        }
      })
      .catch(() => {
        // Fallback silently if routes API quota/network unavailable
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, origin, destination]);

  return null;
}

function GoogleMapInner({
  center,
  markerLabel,
  secondaryPoint,
  riderPoint,
  interactive,
  heightClass,
  onSelectLocation,
}: Omit<DhakaMapPickerProps, 'mapsApiKey' | 'lang'>) {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <FallbackDhakaMap
        center={center}
        markerLabel={markerLabel}
        secondaryPoint={secondaryPoint}
        riderPoint={riderPoint}
        interactive={interactive}
        heightClass={heightClass}
        onSelectLocation={onSelectLocation}
      />
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-neutral-200 ${heightClass || 'h-[260px]'}`}>
      <GoogleMap
        defaultCenter={center}
        center={center}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        clickableIcons={false}
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
        onClick={(ev) => {
          if (interactive && ev.detail.latLng && onSelectLocation) {
            onSelectLocation({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng });
          }
        }}
      >
        <AdvancedMarker position={center} title={markerLabel || 'Selected Location'}>
          <Pin background="#E21B70" borderColor="#9E0B52" glyphColor="#FFFFFF" />
        </AdvancedMarker>
        {secondaryPoint && (
          <AdvancedMarker position={{ lat: secondaryPoint.lat, lng: secondaryPoint.lng }} title={secondaryPoint.label}>
            <Pin background="#2E3138" borderColor="#111827" glyphColor="#FFFFFF" />
          </AdvancedMarker>
        )}
        {riderPoint && (
          <AdvancedMarker position={{ lat: riderPoint.lat, lng: riderPoint.lng }} title={riderPoint.label}>
            <div className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-lg border-2 border-white">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping absolute -top-0.5 -right-0.5" />
              <Bike className="w-3.5 h-3.5 shrink-0" />
              <span>{riderPoint.label}</span>
            </div>
          </AdvancedMarker>
        )}
        {secondaryPoint && (
          <RouteOverlay
            origin={{ lat: secondaryPoint.lat, lng: secondaryPoint.lng }}
            destination={center}
          />
        )}
      </GoogleMap>
    </div>
  );
}

function FallbackDhakaMap({
  center,
  markerLabel,
  secondaryPoint,
  riderPoint,
  interactive,
  heightClass,
  onSelectLocation,
}: Omit<DhakaMapPickerProps, 'mapsApiKey' | 'lang'>) {
  const distance = secondaryPoint
    ? haversineDistanceKm(center.lat, center.lng, secondaryPoint.lat, secondaryPoint.lng)
    : null;

  // Map Dhaka bounds lat [23.70..23.90], lng [90.34..90.47] to 0..100%
  const toXY = (lat: number, lng: number) => {
    const x = Math.min(92, Math.max(8, ((lng - 90.34) / (90.47 - 90.34)) * 100));
    const y = Math.min(90, Math.max(10, (1 - (lat - 23.71) / (23.89 - 23.71)) * 100));
    return { x, y };
  };

  const p1 = toXY(center.lat, center.lng);
  const p2 = secondaryPoint ? toXY(secondaryPoint.lat, secondaryPoint.lng) : null;
  const pRider = riderPoint ? toXY(riderPoint.lat, riderPoint.lng) : null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-[#F8FAFC] ${heightClass || 'h-[260px]'}`}
    >
      {/* Subtle Dhaka arterial grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="dhakaGrid" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
            <path d="M 12.5 0 L 0 0 0 12.5" fill="none" stroke="#E2E8F0" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dhakaGrid)" />
        {/* Hatirjheel & Gulshan Lake water accent */}
        <path
          d="M 55 48 Q 62 52 68 46 Q 74 42 78 50"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {p2 && (
          <line
            x1={p2.x}
            y1={p2.y}
            x2={p1.x}
            y2={p1.y}
            stroke="#E21B70"
            strokeWidth="1.2"
            strokeDasharray="2.5 1.5"
          />
        )}
        {pRider && (
          <line
            x1={pRider.x}
            y1={pRider.y}
            x2={p1.x}
            y2={p1.y}
            stroke="#059669"
            strokeWidth="1.4"
            strokeDasharray="1.8 1.2"
          />
        )}
      </svg>

      {/* Clickable Dhaka Area Pins */}
      {interactive &&
        DHAKA_AREAS.map((area) => {
          const pos = toXY(area.lat, area.lng);
          const isClose =
            Math.abs(area.lat - center.lat) < 0.008 && Math.abs(area.lng - center.lng) < 0.008;
          return (
            <button
              key={area.name}
              type="button"
              onClick={() =>
                onSelectLocation?.({ lat: area.lat, lng: area.lng, areaName: area.name })
              }
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isClose
                  ? 'bg-[#E21B70] text-white shadow-sm z-20'
                  : 'bg-white/95 text-[#2E3138] border border-neutral-200 hover:border-[#E21B70] z-10'
              }`}
            >
              {area.name}
            </button>
          );
        })}

      {/* Primary Pin */}
      <div
        style={{ left: `${p1.x}%`, top: `${p1.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-none"
      >
        <span className="px-2 py-0.5 rounded bg-[#E21B70] text-white text-[10px] font-semibold shadow-sm whitespace-nowrap mb-0.5">
          {markerLabel || 'Delivery Pin'}
        </span>
        <MapPin className="w-5 h-5 text-[#E21B70] fill-[#E21B70]/20" />
      </div>

      {/* Restaurant / Origin Pin */}
      {p2 && secondaryPoint && (
        <div
          style={{ left: `${p2.x}%`, top: `${p2.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-none"
        >
          <span className="px-2 py-0.5 rounded bg-[#2E3138] text-white text-[10px] font-semibold shadow-sm whitespace-nowrap mb-0.5">
            {secondaryPoint.label}
          </span>
          <MapPin className="w-5 h-5 text-[#2E3138] fill-[#2E3138]/20" />
        </div>
      )}

      {/* Rider Live Marker */}
      {pRider && riderPoint && (
        <div
          style={{ left: `${pRider.x}%`, top: `${pRider.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md border border-white"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
          <Bike className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{riderPoint.label}</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 bg-white/95 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-600">
        <span className="font-mono-nums truncate">
          {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          {distance !== null ? ` · ${distance} km` : ''}
          {riderPoint ? ` · Rider ${riderPoint.lat.toFixed(4)}, ${riderPoint.lng.toFixed(4)}` : ''}
        </span>
        {interactive && (
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) =>
                    onSelectLocation?.({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      areaName: 'Current GPS',
                    }),
                  () =>
                    onSelectLocation?.({
                      lat: 23.7949,
                      lng: 90.4144,
                      areaName: 'Gulshan 2',
                    })
                );
              }
            }}
            className="inline-flex items-center gap-1 text-[#E21B70] font-semibold hover:underline whitespace-nowrap shrink-0"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>GPS</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function DhakaMapPicker(props: DhakaMapPickerProps) {
  const [useFallback] = useState(false);

  if (!props.mapsApiKey || useFallback) {
    return (
      <FallbackDhakaMap
        center={props.center}
        markerLabel={props.markerLabel}
        secondaryPoint={props.secondaryPoint}
        riderPoint={props.riderPoint}
        interactive={props.interactive}
        heightClass={props.heightClass}
        onSelectLocation={props.onSelectLocation}
      />
    );
  }

  return (
    <APIProvider apiKey={props.mapsApiKey} language={props.lang} region="BD">
      <GoogleMapInner
        center={props.center}
        markerLabel={props.markerLabel}
        secondaryPoint={props.secondaryPoint}
        riderPoint={props.riderPoint}
        interactive={props.interactive}
        heightClass={props.heightClass}
        onSelectLocation={props.onSelectLocation}
      />
    </APIProvider>
  );
}
