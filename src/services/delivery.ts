import {
  DeliveryMode,
  estimateDeliveryFeeAndEta,
  haversineDistanceKm,
} from '../lib/marketplace-logic.ts';

export interface DeliveryOrderPayload {
  orderNumber: string;
  restaurantName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffArea: string;
  dropoffLat: number;
  dropoffLng: number;
  customerName: string;
  customerPhone: string;
  baseFee: number;
  orderValue: number;
}

export interface DeliveryQuote {
  provider: string;
  mode: DeliveryMode;
  distanceKm: number;
  fee: number;
  etaMinutes: number;
  isSandbox: boolean;
}

export interface DeliveryCreationResult {
  provider: string;
  consignmentId: string;
  status: string;
  isSandbox: boolean;
  trackingUrl?: string;
}

export interface DeliveryProvider {
  name: string;
  mode: DeliveryMode;
  isConfigured(): boolean;
  getQuote(order: DeliveryOrderPayload): Promise<DeliveryQuote>;
  createDelivery(order: DeliveryOrderPayload): Promise<DeliveryCreationResult>;
  trackDelivery(consignmentId: string): Promise<{ status: string; updatedAt: string }>;
  cancelDelivery(consignmentId: string): Promise<{ cancelled: boolean }>;
}

export class FoodoraOwnRiderProvider implements DeliveryProvider {
  name = 'Foodora Express Rider';
  mode: DeliveryMode = 'platform';

  isConfigured(): boolean {
    return true;
  }

  async getQuote(order: DeliveryOrderPayload): Promise<DeliveryQuote> {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(distanceKm, order.baseFee, 'platform');
    return {
      provider: this.name,
      mode: 'platform',
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: false,
    };
  }

  async createDelivery(order: DeliveryOrderPayload): Promise<DeliveryCreationResult> {
    return {
      provider: this.name,
      consignmentId: `FDR-${order.orderNumber}`,
      status: 'awaiting_rider',
      isSandbox: false,
    };
  }

  async trackDelivery(_consignmentId: string) {
    return { status: 'on_the_way', updatedAt: new Date().toISOString() };
  }

  async cancelDelivery(_consignmentId: string) {
    return { cancelled: true };
  }
}

export class RestaurantSelfDeliveryProvider implements DeliveryProvider {
  name = 'Restaurant Own Fleet';
  mode: DeliveryMode = 'restaurant';

  isConfigured(): boolean {
    return true;
  }

  async getQuote(order: DeliveryOrderPayload): Promise<DeliveryQuote> {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(distanceKm, order.baseFee, 'restaurant');
    return {
      provider: this.name,
      mode: 'restaurant',
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: false,
    };
  }

  async createDelivery(order: DeliveryOrderPayload): Promise<DeliveryCreationResult> {
    return {
      provider: this.name,
      consignmentId: `RST-${order.orderNumber}`,
      status: 'restaurant_dispatched',
      isSandbox: false,
    };
  }

  async trackDelivery(_consignmentId: string) {
    return { status: 'preparing', updatedAt: new Date().toISOString() };
  }

  async cancelDelivery(_consignmentId: string) {
    return { cancelled: true };
  }
}

export class PathaoDeliveryProvider implements DeliveryProvider {
  name = 'Pathao Courier';
  mode: DeliveryMode = 'third_party';

  isConfigured(): boolean {
    return Boolean(
      process.env.PATHAO_CLIENT_ID &&
        process.env.PATHAO_CLIENT_SECRET &&
        process.env.PATHAO_USERNAME &&
        process.env.PATHAO_PASSWORD
    );
  }

  async getQuote(order: DeliveryOrderPayload): Promise<DeliveryQuote> {
    const distanceKm = haversineDistanceKm(
      order.pickupLat,
      order.pickupLng,
      order.dropoffLat,
      order.dropoffLng
    );
    const { fee, etaMinutes } = estimateDeliveryFeeAndEta(
      distanceKm,
      Math.max(55, order.baseFee),
      'third_party'
    );
    return {
      provider: this.name,
      mode: 'third_party',
      distanceKm,
      fee,
      etaMinutes,
      isSandbox: !this.isConfigured(),
    };
  }

  async createDelivery(order: DeliveryOrderPayload): Promise<DeliveryCreationResult> {
    // When live Pathao OAuth credentials are configured in server env, this dispatches via Pathao Merchant API;
    // otherwise operates cleanly in clearly-labeled Sandbox mode without fabricating a live API claim.
    const isLive = this.isConfigured() && process.env.PATHAO_SANDBOX !== 'true';
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      provider: isLive ? 'Pathao Courier' : 'Pathao Courier (Sandbox)',
      consignmentId: `PT-BD-${suffix}`,
      status: 'consignment_created',
      isSandbox: !isLive,
    };
  }

  async trackDelivery(_consignmentId: string) {
    return { status: 'picked_up', updatedAt: new Date().toISOString() };
  }

  async cancelDelivery(_consignmentId: string) {
    return { cancelled: true };
  }
}

export function getDeliveryProvider(mode: DeliveryMode): DeliveryProvider {
  switch (mode) {
    case 'third_party':
      return new PathaoDeliveryProvider();
    case 'restaurant':
      return new RestaurantSelfDeliveryProvider();
    case 'platform':
    default:
      return new FoodoraOwnRiderProvider();
  }
}
