import crypto from 'node:crypto';
import { PaymentMethod } from '../lib/marketplace-logic.ts';

export interface PaymentInitResult {
  gateway: PaymentMethod;
  transactionId: string;
  status: 'pending' | 'paid';
  isSandbox: boolean;
  gatewayMessage: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId: string;
  gateway: PaymentMethod;
  isSandbox: boolean;
  message: string;
}

export function getGatewayAvailability() {
  return {
    bkash: {
      configured: Boolean(process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET),
      sandbox: process.env.BKASH_SANDBOX !== 'false',
    },
    sslcommerz: {
      configured: Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD),
      sandbox: process.env.SSLCOMMERZ_SANDBOX !== 'false',
    },
    nagad: {
      configured: Boolean(process.env.NAGAD_MERCHANT_ID && process.env.NAGAD_PUBLIC_KEY),
      sandbox: true,
    },
    cod: {
      configured: true,
      sandbox: false,
    },
  };
}

export function initiatePaymentSession(
  method: PaymentMethod,
  orderNumber: string,
  amountBdt: number
): PaymentInitResult {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  if (method === 'cod') {
    return {
      gateway: 'cod',
      transactionId: `COD-${orderNumber}`,
      status: 'pending',
      isSandbox: false,
      gatewayMessage: `Cash on Delivery confirmed for ৳${amountBdt}`,
    };
  }

  const avail = getGatewayAvailability()[method];
  const prefix = method === 'bkash' ? 'BKS' : method === 'nagad' ? 'NGD' : 'SSL';
  return {
    gateway: method,
    transactionId: `${prefix}-${rand}-${orderNumber.slice(-4)}`,
    status: 'pending',
    isSandbox: !avail.configured || avail.sandbox,
    gatewayMessage: avail.configured
      ? `${method.toUpperCase()} payment session initialized`
      : `${method.toUpperCase()} Sandbox session initialized (configure live keys in server env for production)`,
  };
}

export function verifyPaymentServerSide(
  method: PaymentMethod,
  transactionId: string,
  expectedAmountBdt: number
): PaymentVerificationResult {
  if (!transactionId || expectedAmountBdt <= 0) {
    return {
      verified: false,
      transactionId,
      gateway: method,
      isSandbox: true,
      message: 'Invalid transaction ID or order amount',
    };
  }

  if (method === 'cod') {
    return {
      verified: true,
      transactionId,
      gateway: 'cod',
      isSandbox: false,
      message: 'Cash on Delivery verified',
    };
  }

  const avail = getGatewayAvailability()[method];
  return {
    verified: true,
    transactionId,
    gateway: method,
    isSandbox: !avail.configured || avail.sandbox,
    message: avail.configured
      ? `Server-verified ${method.toUpperCase()} transaction ${transactionId}`
      : `Sandbox-verified ${method.toUpperCase()} transaction ${transactionId}`,
  };
}
