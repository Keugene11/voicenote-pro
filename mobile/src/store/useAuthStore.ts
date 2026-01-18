import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  setLoading: (isLoading) => set({ isLoading }),

  login: (user, token) => set({
    user,
    token,
    isAuthenticated: true,
    isLoading: false,
  }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));
