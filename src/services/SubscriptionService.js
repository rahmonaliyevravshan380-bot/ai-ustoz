/**
 * SubscriptionService.js
 * 
 * Manages subscription plans, quota tracking, and expiry.
 * Supports: Free | Weekly | Monthly | Yearly
 * 
 * Free Plan: 100 AI requests / 7 days, then resets
 */

import UserDataService from './UserDataService';

export const PLANS = {
  free: {
    id: 'free',
    name: 'Bepul',
    nameEn: 'Free',
    price: 0,
    currency: 'UZS',
    period: null,
    aiRequests: 100,
    resetDays: 7,
    features: [
      '100 AI so\'rov / hafta',
      'Barcha asosiy vositalar',
      'O\'quvchilar boshqaruvi',
      'Davomat jurnali',
      'Taqvim',
    ],
    badge: null,
  },
  weekly: {
    id: 'weekly',
    name: 'Haftalik',
    nameEn: 'Weekly',
    price: 10000,
    currency: 'UZS',
    period: 'weekly',
    durationDays: 7,
    aiRequests: Infinity,
    features: [
      'Cheksiz AI so\'rovlar',
      'Barcha premium vositalar',
      'AI Rasm generatsiya',
      'AI Ovoz (STT/TTS)',
      'Prioritet qo\'llab-quvvatlash',
    ],
    badge: '🔥 Ommabop',
  },
  monthly: {
    id: 'monthly',
    name: 'Oylik',
    nameEn: 'Monthly',
    price: 100000,
    currency: 'UZS',
    period: 'monthly',
    durationDays: 30,
    aiRequests: Infinity,
    features: [
      'Cheksiz AI so\'rovlar',
      'Barcha premium vositalar',
      'AI Rasm generatsiya',
      'AI Ovoz (STT/TTS)',
      'Admin panel',
      'Hisobot eksporti',
      'Ustuvor qo\'llab-quvvatlash',
    ],
    badge: '⭐ Tavsiya',
  },
  yearly: {
    id: 'yearly',
    name: 'Yillik',
    nameEn: 'Yearly',
    price: 500000,
    currency: 'UZS',
    period: 'yearly',
    durationDays: 365,
    aiRequests: Infinity,
    features: [
      'Cheksiz AI so\'rovlar',
      'Barcha premium vositalar',
      '1 yil davomida to\'liq kirish',
      'Kelajakdagi barcha yangiliklar',
      'Shaxsiy menejer',
      'API integratsiya',
    ],
    badge: '💎 Premium',
  },
};

export const SubscriptionService = {
  /**
   * Get subscription data for a user.
   * Returns the subscription object with plan, expiry, quota remaining.
   */
  getSubscription(userId) {
    const sub = UserDataService.get(userId, 'subscription', null);
    if (!sub) {
      // Create default free subscription
      const freeSub = this._createFreeSub();
      this.setSubscription(userId, freeSub);
      return freeSub;
    }
    // Auto-reset free quota if resetAt has passed
    if (sub.planId === 'free' && sub.resetAt && new Date() > new Date(sub.resetAt)) {
      const resetSub = { ...sub, aiUsed: 0, resetAt: this._nextResetDate(7) };
      this.setSubscription(userId, resetSub);
      return resetSub;
    }
    return sub;
  },

  setSubscription(userId, sub) {
    UserDataService.set(userId, 'subscription', sub);
  },

  _createFreeSub() {
    return {
      planId: 'free',
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: null, // free never expires
      resetAt: this._nextResetDate(7), // quota resets every 7 days
      aiUsed: 0,
      aiLimit: PLANS.free.aiRequests,
      transactionId: null,
    };
  },

  _nextResetDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  },

  /**
   * Check if user can make an AI request.
   * Returns { allowed: bool, reason: string }
   */
  canUseAI(userId) {
    const sub = this.getSubscription(userId);
    const plan = PLANS[sub.planId];

    if (!plan) return { allowed: false, reason: 'Plan topilmadi.' };

    // Premium plans have unlimited AI
    if (plan.aiRequests === Infinity) {
      if (sub.status !== 'active') return { allowed: false, reason: 'Obuna muddati tugagan.' };
      if (sub.expiresAt && new Date() > new Date(sub.expiresAt)) {
        return { allowed: false, reason: 'Obuna muddati tugagan. Yangilang.' };
      }
      return { allowed: true };
    }

    // Free plan: check quota
    const remaining = sub.aiLimit - (sub.aiUsed || 0);
    if (remaining <= 0) {
      const resetAt = new Date(sub.resetAt);
      return {
        allowed: false,
        reason: `Haftalik AI so'rovlar limiti tugadi (${sub.aiLimit} ta). `,
        resetAt: sub.resetAt,
      };
    }

    return { allowed: true, remaining };
  },

  /**
   * Decrement AI usage by 1.
   */
  consumeAIRequest(userId) {
    const sub = this.getSubscription(userId);
    const plan = PLANS[sub.planId];
    if (!plan || plan.aiRequests === Infinity) return; // no limit for premium

    const updated = { ...sub, aiUsed: (sub.aiUsed || 0) + 1 };
    this.setSubscription(userId, updated);
    return updated;
  },

  /**
   * Activate a subscription after payment.
   */
  activateSubscription(userId, planId, transactionId = null) {
    const plan = PLANS[planId];
    if (!plan) throw new Error(`Noto'g'ri plan: ${planId}`);

    const now = new Date();
    const expiresAt = plan.durationDays
      ? new Date(now.getTime() + plan.durationDays * 86400000).toISOString()
      : null;

    const sub = {
      planId,
      status: 'active',
      startedAt: now.toISOString(),
      expiresAt,
      resetAt: null,
      aiUsed: 0,
      aiLimit: plan.aiRequests,
      transactionId,
    };

    this.setSubscription(userId, sub);
    return sub;
  },

  /**
   * Get human-readable status summary.
   */
  getStatusSummary(userId) {
    const sub = this.getSubscription(userId);
    const plan = PLANS[sub.planId];

    if (!plan) return { label: 'Noma\'lum', color: '#6B7280' };

    if (sub.planId === 'free') {
      const remaining = sub.aiLimit - (sub.aiUsed || 0);
      return {
        label: `Bepul · ${remaining} so'rov qoldi`,
        color: '#10B981',
        remaining,
        planId: 'free',
      };
    }

    if (sub.expiresAt) {
      const daysLeft = Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / 86400000));
      if (daysLeft === 0) {
        return { label: 'Muddat tugagan', color: '#EF4444', planId: sub.planId };
      }
      return {
        label: `${plan.name} · ${daysLeft} kun qoldi`,
        color: '#2563EB',
        daysLeft,
        planId: sub.planId,
      };
    }

    return { label: plan.name, color: '#2563EB', planId: sub.planId };
  },

  formatPrice(price) {
    if (price === 0) return 'Bepul';
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  },
};

export default SubscriptionService;
