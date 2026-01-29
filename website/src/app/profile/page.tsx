'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, Crown, Loader2, LogOut, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { isSubscribed, status, loading } = useSubscription();
  const plan = status?.plan;
  const router = useRouter();
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] dark:bg-[#202124] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your profile</p>
          <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setResetLoading(true);
    setResetError(null);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getTierDisplay = () => {
    if (loading) return { label: 'Loading...', color: 'text-gray-500' };
    if (plan === 'lifetime') return { label: 'Lifetime', color: 'text-emerald-600 dark:text-emerald-400' };
    if (isSubscribed) return { label: 'Pro', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Free', color: 'text-gray-600 dark:text-gray-400' };
  };

  const tierDisplay = getTierDisplay();

  return (
    <div className="min-h-screen bg-[#FAF6F1] dark:bg-[#202124] transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF6F1] dark:bg-[#202124] border-b border-[#E8E0D5] dark:border-gray-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to app</span>
          </Link>
          <Link href="/" className="text-2xl font-serif italic text-gray-800 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Rabona
          </Link>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-gray-900 dark:text-gray-100 mb-8">Profile</h1>

        <div className="space-y-6">
          {/* Email */}
          <div className="bg-white dark:bg-[#2D2E30] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
            </div>
            <p className="text-gray-900 dark:text-gray-100 ml-8">{user.email}</p>
          </div>

          {/* Subscription Tier */}
          <div className="bg-white dark:bg-[#2D2E30] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-1">
              <Crown className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
            </div>
            <div className="flex items-center justify-between ml-8">
              <p className={`font-medium ${tierDisplay.color}`}>{tierDisplay.label}</p>
              {!isSubscribed && plan !== 'lifetime' && (
                <Link
                  href="/pricing"
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* Password Reset */}
          <div className="bg-white dark:bg-[#2D2E30] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-1">
              <Key className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Password</span>
            </div>
            <div className="ml-8">
              {resetSent ? (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                  Password reset email sent! Check your inbox.
                </p>
              ) : (
                <>
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-sm flex items-center gap-2"
                  >
                    {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send password reset email
                  </button>
                  {resetError && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">{resetError}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-white dark:bg-[#2D2E30] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Account Security</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm ml-8">
              {user.providerData?.[0]?.providerId === 'google.com'
                ? 'Signed in with Google'
                : 'Signed in with email and password'}
            </p>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#2D2E30] rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* Support */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help?{' '}
            <a href="mailto:rabona8712@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
