'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthToken {
  email: string;
  timestamp: number;
}

const TOKEN_KEY = 'traders-diary-auth';
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function getAuthToken(): AuthToken | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const parsed: AuthToken = JSON.parse(token);
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return parsed;
  } catch {
    if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function setAuthToken(email: string) {
  const token: AuthToken = { email, timestamp: Date.now() };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    setIsAuth(!!token);
    setIsLoading(false);
  }, []);

  useEffect(checkAuth, [checkAuth]);

  const login = (email: string) => {
    setAuthToken(email);
    setIsAuth(true);
  };

  const logout = () => {
    clearAuthToken();
    setIsAuth(false);
    router.push('/login');
  };

  return { isAuth, isLoading, login, logout, checkAuth };
}
