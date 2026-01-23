'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const localTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Clear cached token when user changes
      localTokenRef.current = null;
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localTokenRef.current = null;
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;

    // Return cached local token if we have one
    if (localTokenRef.current) {
      return localTokenRef.current;
    }

    // Get Firebase ID token
    const firebaseToken = await user.getIdToken();

    // Exchange for local JWT
    try {
      const response = await fetch(`${API_URL}/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: firebaseToken }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localTokenRef.current = data.token;
        return data.token;
      }
    } catch (error) {
      console.error('Token exchange error:', error);
    }

    return null;
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    getToken,
  };
}
