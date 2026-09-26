import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionService } from '../services/SubscriptionService';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);

  const refresh = useCallback(() => {
    if (!user?.id) {
      setSubscription(null);
      setStatusSummary(null);
      return;
    }
    const sub = SubscriptionService.getSubscription(user.id);
    const summary = SubscriptionService.getStatusSummary(user.id);
    setSubscription(sub);
    setStatusSummary(summary);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Check if user can make an AI request.
   */
  const canUseAI = useCallback(() => {
    if (!user?.id) return { allowed: false, reason: 'Tizimga kiring.' };
    return SubscriptionService.canUseAI(user.id);
  }, [user?.id]);

  /**
   * Consume one AI request. Call after every successful AI request.
   */
  const consumeRequest = useCallback(() => {
    if (!user?.id) return;
    SubscriptionService.consumeAIRequest(user.id);
    refresh();
  }, [user?.id, refresh]);

  /**
   * Activate a plan after payment.
   */
  const activatePlan = useCallback((planId, txnId) => {
    if (!user?.id) return;
    SubscriptionService.activateSubscription(user.id, planId, txnId);
    refresh();
  }, [user?.id, refresh]);

  const isPremium = subscription && subscription.planId !== 'free' && subscription.status === 'active';
  const isExpired = subscription?.status !== 'active';

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      statusSummary,
      isPremium,
      isExpired,
      canUseAI,
      consumeRequest,
      activatePlan,
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
