'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoading, logout } = useAuth();

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
                <button onClick={logout} className="transition hover:text-white">Logout</button>
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
