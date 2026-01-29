'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  SubscriptionStatus,
  getSubscriptionStatus,
  createCheckoutSession,
  createPortalSession,
} from '@/lib/api';

const SUBSCRIPTION_CACHE_KEY = 'rabona_subscription_cache';

function getCachedSubscription(): SubscriptionStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function setCachedSubscription(status: SubscriptionStatus | null) {
  if (typeof window === 'undefined') return;
  try {
    if (status) {
      localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(status));
    } else {
      localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function useSubscription() {
  // Initialize with cached status for instant display
  const [status, setStatus] = useState<SubscriptionStatus | null>(() => getCachedSubscription());
  const [loading, setLoading] = useState(true);
  const [statusForUserId, setStatusForUserId] = useState<string | null>(null);
  const { user, getToken } = useAuth();

  const fetchStatus = useCallback(async () => {
    // User is logged out
    if (!user) {
      setStatus(null);
      setCachedSubscription(null);
      setLoading(false);
      setStatusForUserId(null);
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        const subscriptionStatus = await getSubscriptionStatus(token);
        setStatus(subscriptionStatus);
        setCachedSubscription(subscriptionStatus);
        setStatusForUserId(user.uid); // Mark that we have status for this user
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

  const openCheckout = async (plan: 'monthly' | 'yearly' | 'lifetime' = 'monthly') => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        alert('Please sign in to upgrade');
        return;
      }

      const response = await createCheckoutSession(token, plan);
      console.log('Checkout response:', response);

      if (response.url) {
        window.location.href = response.url;
      } else {
        console.error('No checkout URL in response:', response);
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to connect to payment server. Please try again.');
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

  // Consider status valid if:
  // 1. We have fetched for current user, OR
  // 2. We have cached status and user is logged in (cache will be validated by background fetch)
  const hasValidStatus = user !== null && (statusForUserId === user.uid || status !== null);

  // Return isSubscribed based on status - cached or fetched
  const isSubscribed = hasValidStatus && status?.isSubscribed === true;

  return {
    status,
    loading,
    hasFetchedOnce: hasValidStatus,
    isSubscribed,
    monthlyUsage: hasValidStatus ? (status?.monthlyUsage ?? 0) : 0,
    limit: hasValidStatus ? (status?.limit ?? 5) : 5,
    openCheckout,
    openPortal,
    refresh: fetchStatus,
  };
}
