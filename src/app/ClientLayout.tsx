'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { getAuthToken } from '@/hooks/useAuth';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading, logout } = useAuth();
  const token = getAuthToken();
  const [showProfile, setShowProfile] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold text-white transition hover:text-primary-300">
              Trader&apos;s Diary
            </Link>
            <div />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-white transition hover:text-primary-300">
            Trader's Diary
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
              <Link href="/trades" className="transition hover:text-white">Trades</Link>
{isAuth ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 transition hover:text-white"
                  >
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 -7z" />
                    </svg>
                    <span className="font-medium">{token?.email}</span>
                  </button>
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4 -4 4 4M5 16l-4 -4 4 -4M15.01 17h-15.02M18.99 7h-15" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="transition hover:text-white">Login</Link>
                  <Link href="/register" className="transition hover:text-white">Register</Link>
                </>
              )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
