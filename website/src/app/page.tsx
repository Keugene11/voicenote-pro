'use client';

import { useState, useEffect } from 'react';
import { Mic, Sparkles, LogOut, User, Sun, Moon, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Recorder } from '@/components/Recorder';
import { NotesList } from '@/components/NotesList';
import { AuthModal } from '@/components/AuthModal';

export default function Home() {
  const { user, loading, signOut, getToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      getToken().then(setToken);
    } else {
      setToken(null);
    }
  }, [user, getToken]);

  const handleNoteCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-amber-600 dark:text-amber-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--background)]/80 border-b border-amber-200/50 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-serif text-gray-900 dark:text-white">Rabona</h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section - only for non-logged in users */}
        {!user && (
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white leading-tight">
              Your voice, <br />
              <span className="italic">perfectly written.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              Turn your voice into polished text. Record, transcribe, and refine with AI.
            </p>
          </div>
        )}

        {/* Recorder Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-amber-200/50 dark:border-gray-800 shadow-sm">
          <Recorder token={token} onNoteCreated={handleNoteCreated} />
        </div>

        {/* Sign in prompt for non-logged in users */}
        {!user && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-3">
              Sign in to save your notes
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Notes List for logged in users */}
        {user && token && (
          <NotesList token={token} refreshTrigger={refreshTrigger} />
        )}

        {/* Features - only show when not logged in */}
        {!user && (
          <div className="grid grid-cols-3 gap-4 pt-8 pb-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Record</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Speak naturally</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Polish</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI cleans it up</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Copy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Copy</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use anywhere</p>
            </div>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
