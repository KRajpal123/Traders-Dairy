'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectMessage: string;
}

export default function ProtectedRoute({ children, redirectMessage }: ProtectedRouteProps) {
  const { isAuth, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuth) {
      router.replace(`/login?message=${encodeURIComponent(redirectMessage)}`);
    }
  }, [isAuth, isLoading, redirectMessage, router]);

  if (isLoading || !isAuth) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300 shadow-lg shadow-slate-950/30">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-primary-500" />
          <span>Checking your session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
