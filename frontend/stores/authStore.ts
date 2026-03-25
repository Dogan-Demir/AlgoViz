'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tokenStorage } from '@/lib/auth';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (patch: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'authStore' }
  )
);
