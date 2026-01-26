'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  SubscriptionStatus,
  getSubscriptionStatus,
  createCheckoutSession,
  createPortalSession,
} from '@/lib/api';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, getToken } = useAuth();

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        const subscriptionStatus = await getSubscriptionStatus(token);
        setStatus(subscriptionStatus);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const openCheckout = async (plan: 'monthly' | 'yearly' = 'monthly') => {
    try {
      const token = await getToken();
      if (token) {
        const { url } = await createCheckoutSession(token, plan);
        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const openPortal = async () => {
    try {
      const token = await getToken();
      if (token) {
        const { url } = await createPortalSession(token);
        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  return {
    status,
    loading,
    isSubscribed: status?.isSubscribed ?? false,
    monthlyUsage: status?.monthlyUsage ?? 0,
    limit: status?.limit ?? 5,
    openCheckout,
    openPortal,
    refresh: fetchStatus,
  };
}
