'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { tokenStorage } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

export default function AuthInitializer() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((user) => {
        const refresh = tokenStorage.getRefresh() ?? '';
        setAuth(user, token, refresh);
      })
      .catch(() => {
        clearAuth();
      });
  }, [setAuth, clearAuth, setLoading]);

  return null;
}
