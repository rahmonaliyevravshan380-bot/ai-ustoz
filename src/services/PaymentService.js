/**
 * PaymentService.js
 * 
 * Abstract payment architecture.
 * Supports Click, Payme, Stripe, PayPal via adapters.
 * Demo mode enabled — no real payments yet.
 * 
 * To add a new provider, create an adapter implementing:
 *   { createOrder, processPayment, verifyPayment, refund }
 * and register it in ADAPTERS.
 */

import UserDataService from './UserDataService';
import { SubscriptionService } from './SubscriptionService';

// ── Payment Statuses ───────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// ── Payment Providers ───────────────────────────────────────────────────
export const PAYMENT_PROVIDERS = {
  DEMO: 'demo',
  CLICK: 'click',
  PAYME: 'payme',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
};

// ── Provider Adapters (interface only; providers to be wired in future) ──
const createDemoAdapter = () => ({
  name: 'Demo',
  async createOrder({ planId, userId, amount }) {
    return {
      orderId: `DEMO_${Date.now()}`,
      paymentUrl: null, // no redirect needed in demo
      amount,
      currency: 'UZS',
      status: PAYMENT_STATUS.PROCESSING,
    };
  },
  async processPayment({ orderId, planId, userId }) {
    // Simulate a 1.5s payment process
    await new Promise(r => setTimeout(r, 1500));
    return {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      status: PAYMENT_STATUS.PAID,
      paidAt: new Date().toISOString(),
    };
  },
  async verifyPayment({ transactionId }) {
    return { verified: true, status: PAYMENT_STATUS.PAID };
  },
  async refund({ transactionId }) {
    return { success: true, status: PAYMENT_STATUS.REFUNDED };
  },
});

const createClickAdapter = () => ({
  name: 'Click',
  async createOrder({ planId, userId, amount }) {
    // TODO: Integrate with real Click API
    throw new Error('Click integration not configured. Please set VITE_CLICK_MERCHANT_ID.');
  },
  async processPayment() { throw new Error('Click not configured.'); },
  async verifyPayment() { throw new Error('Click not configured.'); },
  async refund() { throw new Error('Click not configured.'); },
});

const createPaymeAdapter = () => ({
  name: 'Payme',
  async createOrder() { throw new Error('Payme integration not configured.'); },
  async processPayment() { throw new Error('Payme not configured.'); },
  async verifyPayment() { throw new Error('Payme not configured.'); },
  async refund() { throw new Error('Payme not configured.'); },
});

const createStripeAdapter = () => ({
  name: 'Stripe',
  async createOrder() { throw new Error('Stripe integration not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.'); },
  async processPayment() { throw new Error('Stripe not configured.'); },
  async verifyPayment() { throw new Error('Stripe not configured.'); },
  async refund() { throw new Error('Stripe not configured.'); },
});

// ── Active Adapters Registry ───────────────────────────────────────────
const ADAPTERS = {
  [PAYMENT_PROVIDERS.DEMO]: createDemoAdapter(),
  [PAYMENT_PROVIDERS.CLICK]: createClickAdapter(),
  [PAYMENT_PROVIDERS.PAYME]: createPaymeAdapter(),
  [PAYMENT_PROVIDERS.STRIPE]: createStripeAdapter(),
};

// ── PaymentService ─────────────────────────────────────────────────────
export const PaymentService = {
  /**
   * Get or create transaction history for a user.
   */
  getTransactions(userId) {
    return UserDataService.get(userId, 'transactions', []);
  },

  addTransaction(userId, txn) {
    const existing = this.getTransactions(userId);
    const updated = [txn, ...existing];
    UserDataService.set(userId, 'transactions', updated);
    return txn;
  },

  /**
   * Purchase a plan.
   * provider: 'demo' | 'click' | 'payme' | 'stripe' | 'paypal'
   */
  async purchasePlan({ userId, planId, provider = PAYMENT_PROVIDERS.DEMO }) {
    const adapter = ADAPTERS[provider] || ADAPTERS[PAYMENT_PROVIDERS.DEMO];
    const { PLANS } = await import('./SubscriptionService');
    const plan = PLANS[planId];
    if (!plan) throw new Error(`Noto'g'ri plan ID: ${planId}`);

    // 1. Create order
    const order = await adapter.createOrder({
      planId,
      userId,
      amount: plan.price,
      currency: 'UZS',
    });

    // 2. Process payment
    const result = await adapter.processPayment({
      orderId: order.orderId,
      planId,
      userId,
    });

    // 3. Generate invoice
    const invoice = this._generateInvoice({ userId, planId, order, result, plan });

    // 4. Save transaction
    const txn = {
      id: result.transactionId || `TXN_${Date.now()}`,
      orderId: order.orderId,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: 'UZS',
      provider,
      status: result.status,
      paidAt: result.paidAt || new Date().toISOString(),
      invoiceId: invoice.id,
    };

    this.addTransaction(userId, txn);

    // 5. Activate subscription if paid
    if (result.success && result.status === PAYMENT_STATUS.PAID) {
      SubscriptionService.activateSubscription(userId, planId, txn.id);
    }

    return { success: result.success, transaction: txn, invoice };
  },

  _generateInvoice({ userId, planId, order, result, plan }) {
    const invoice = {
      id: `INV_${Date.now()}`,
      userId,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: 'UZS',
      status: result.status,
      issuedAt: new Date().toISOString(),
      paidAt: result.paidAt || null,
      orderId: order.orderId,
      transactionId: result.transactionId,
      lineItems: [
        {
          description: `${plan.name} obuna - AI Ustoz`,
          amount: plan.price,
          period: plan.period,
        },
      ],
    };

    const invoices = UserDataService.get(userId, 'invoices', []);
    UserDataService.set(userId, 'invoices', [invoice, ...invoices]);
    return invoice;
  },

  getInvoices(userId) {
    return UserDataService.get(userId, 'invoices', []);
  },

  /**
   * Cancel a subscription.
   */
  cancelSubscription(userId) {
    const sub = SubscriptionService.getSubscription(userId);
    const updated = { ...sub, status: 'cancelled' };
    SubscriptionService.setSubscription(userId, updated);
    return updated;
  },
};

export default PaymentService;
