'use client';

import { useState, useEffect } from 'react';
import { Mic, FileText, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Recorder } from '@/components/Recorder';
import { Dashboard } from '@/components/Dashboard';
import { AuthModal } from '@/components/AuthModal';

type Tab = 'record' | 'notes';

export default function Home() {
  const { user, loading, signOut, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VoiceNote Pro</h1>
              <p className="text-xs text-gray-400">AI-Powered Voice Notes</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 px-4 py-4 space-y-2">
            {user ? (
              <>
                <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Landing for non-authenticated users */}
        {!user && (
          <div className="text-center py-16 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Transform Your Voice Into
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Brilliant Text
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Record your thoughts, ideas, and notes. Our AI transforms them into polished,
                professional content with personality and wit.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Get Started Free
              </button>
              <a
                href="#features"
                className="px-8 py-4 border border-gray-700 hover:border-purple-500 rounded-xl text-white font-medium transition-colors"
              >
                Learn More
              </a>
            </div>

            {/* Features */}
            <div id="features" className="grid md:grid-cols-3 gap-6 pt-16">
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Voice Recording</h3>
                <p className="text-gray-400">
                  Capture your thoughts naturally with our easy-to-use voice recorder. Works on any device.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Enhancement</h3>
                <p className="text-gray-400">
                  Our AI adds facts, humor, and polish to make your notes memorable and professional.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Multiple Tones</h3>
                <p className="text-gray-400">
                  Professional, casual, email, meeting notes - choose the perfect tone for any situation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* App for authenticated users */}
        {user && token && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1 mb-8">
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'record'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>Record</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'notes'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>My Notes</span>
              </button>
            </div>

            {/* Content */}
            <div className="bg-gray-900/30 rounded-2xl border border-gray-800 p-6">
              {activeTab === 'record' && (
                <Recorder token={token} onNoteCreated={handleNoteCreated} />
              )}
              {activeTab === 'notes' && (
                <Dashboard token={token} refreshTrigger={refreshTrigger} />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2024 VoiceNote Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
