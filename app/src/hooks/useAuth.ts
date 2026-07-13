import { useCallback } from 'react';
import { trpc } from '@/providers/trpc';

const LOCAL_TOKEN_KEY = 'tusfinanzas_auth_token';

export function useAuth(_opts?: { redirectOnUnauthenticated?: boolean }) {
  const utils = trpc.useUtils();

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    enabled: !!getLocalToken(),
  });

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    utils.invalidate();
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }, [utils]);

  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    logout,
    isAdmin: user?.role === 'admin',
  };
}

export function getLocalToken(): string | null {
  return localStorage.getItem(LOCAL_TOKEN_KEY);
}

export function setLocalToken(token: string) {
  localStorage.setItem(LOCAL_TOKEN_KEY, token);
}

export function removeLocalToken() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
}
