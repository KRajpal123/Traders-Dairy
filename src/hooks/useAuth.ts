'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

interface AuthToken {
  email: string;
  timestamp: number;
}

const TOKEN_KEY = 'traders-diary-auth';
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const AUTH_CHANGE_EVENT = 'traders-diary-auth-change';

function parseAuthToken(token: string | null): AuthToken | null {
  if (!token) return null;

  try {
    const parsed = JSON.parse(token) as AuthToken;

    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getAuthToken(): AuthToken | null {
  if (typeof window === 'undefined') return null;

  return parseAuthToken(localStorage.getItem(TOKEN_KEY));
}

export function setAuthToken(email: string) {
  const token: AuthToken = { email, timestamp: Date.now() };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener('storage', callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function getServerSnapshot() {
  return null;
}

function getAuthSnapshot() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function useAuth() {
  const router = useRouter();
  const tokenSnapshot = useSyncExternalStore(subscribe, getAuthSnapshot, getServerSnapshot);
  const token = useMemo(() => parseAuthToken(tokenSnapshot), [tokenSnapshot]);

  const login = (email: string) => {
    setAuthToken(email);
  };

  const logout = () => {
    clearAuthToken();
    router.push('/login');
  };

  return {
    isAuth: !!token,
    isLoading: false,
    login,
    logout,
    checkAuth: getAuthToken,
    token,
  };
}
