'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Sun, Moon, Search, X, HelpCircle, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Recorder } from '@/components/Recorder';
import { NotesList } from '@/components/NotesList';
import { LocalNotesList } from '@/components/LocalNotesList';
import { AuthModal } from '@/components/AuthModal';

function HomeContent() {
  const { user, loading, getToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { refresh: refreshSubscription } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Handle return from Stripe checkout
  useEffect(() => {
    const subscription = searchParams.get('subscription');
    if (subscription === 'success') {
      // Refresh subscription status after successful payment
      console.log('Returned from Stripe checkout, refreshing subscription...');
      // Give webhook a moment to process, then refresh
      setTimeout(() => {
        refreshSubscription();
      }, 2000);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (user) {
      getToken().then(setToken);
    } else {
      setToken(null);
    }
  }, [user, getToken]);

  const handleNoteCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    refreshSubscription(); // Refresh usage count
  };

  // Don't show full-page loading - let components handle their own loading states
  // This prevents flickering when navigating between pages

  return (
    <div className="min-h-screen bg-[#FAF6F1] dark:bg-[#202124] transition-colors overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF6F1] dark:bg-[#202124] border-b border-[#E8E0D5] dark:border-gray-700/50">
        <div className="flex items-center px-2 sm:px-3 py-2 gap-1 sm:gap-2 max-w-full">
          {/* Mobile hamburger menu - only visible on mobile/tablet */}
          <div ref={mobileMenuRef} className="relative md:hidden flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Dropdown menu with all options */}
            {mobileMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-[#2D2E30] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.email?.split('@')[0]}</span>
                  </Link>
                )}
                <Link
                  href="/tutorial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HelpCircle className="w-4 h-4" />
                  Tutorial
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Pricing
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Logo - hidden on mobile/tablet */}
          <Link href="/" className="hidden md:flex flex-shrink-0 items-center gap-3 px-3">
            <h1 className="text-2xl font-serif italic text-gray-800 dark:text-gray-100">Rabona</h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <div className="flex items-center bg-[#EFEAE3] dark:bg-[#525355] rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 gap-2 sm:gap-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Actions - hidden on mobile/tablet */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <Link
              href="/tutorial"
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Tutorial
            </Link>

            <Link
              href="/pricing"
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Pricing
            </Link>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5" />
                <span className="text-sm max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-10 py-6">
        {/* Recorder */}
        <div className="max-w-xl mx-auto mb-8">
          <Recorder token={token} isLoggedIn={!!user} onNoteCreated={handleNoteCreated} refreshTrigger={refreshTrigger} />
        </div>

        {/* Tutorial Video for non-logged-in users */}
        {!user && (
          <div className="max-w-2xl mx-auto mb-10">
            <h2 className="text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              See how it works
            </h2>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg aspect-video">
              <iframe
                src="https://www.youtube.com/embed/r952ohS07nY"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="mt-4 max-w-5xl mx-auto">
          {/* Show NotesList if logged in (notes state persists in context) */}
          {user ? (
            <NotesList token={token || ''} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
          ) : (
            <LocalNotesList refreshTrigger={refreshTrigger} searchQuery={searchQuery} onNoteDeleted={handleNoteCreated} />
          )}
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1] dark:bg-[#202124]">
        <div className="animate-pulse text-amber-600 dark:text-amber-400 font-serif italic text-xl">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
