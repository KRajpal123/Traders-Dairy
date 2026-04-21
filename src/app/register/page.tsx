'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const initialErrors = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState(initialErrors);
  const [success, setSuccess] = useState('');

  const router = useRouter();

  const validate = () => {
    const nextErrors = { ...initialErrors };

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);

    return !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validate()) {
      setErrors(initialErrors);
      router.push('/login');
    } else {
      setSuccess('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)] lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-primary-500 hover:text-primary-300">
            ← Back to home
          </Link>
          <p className="text-sm text-slate-400">
            Already have an account? <Link href="/login" className="font-semibold text-primary-300 hover:text-primary-200">Login</Link>
          </p>
        </div>

        <div className="grid gap-10 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <section className="space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary-600/15 px-3 py-1 text-sm font-medium text-primary-300">
                Start your journal
              </span>
              <div>
                <h1 className="text-4xl font-semibold text-white sm:text-5xl">Create an account</h1>
                <p className="mt-3 max-w-xl text-slate-400">
                  Register and start capturing trades, managing risk, and measuring performance with clarity.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-slate-950/90 p-6 sm:p-8">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="you@example.com"
                />
                {errors.email ? <p className="text-sm text-red-400">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Create a strong password"
                />
                {errors.password ? <p className="text-sm text-red-400">{errors.password}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Repeat your password"
                />
                {errors.confirmPassword ? <p className="text-sm text-red-400">{errors.confirmPassword}</p> : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition duration-200 hover:-translate-y-0.5 hover:bg-primary-400"
              >
                Create account
              </button>

              {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p> : null}
            </form>
          </section>

          <aside className="hidden rounded-[1.75rem] bg-slate-950 p-8 sm:block">
            <div className="mb-8 rounded-[1.5rem] bg-slate-900/90 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Journal every trade</p>
              <h2 className="mt-5 text-2xl font-semibold text-white">Capture market moves with precision.</h2>
              <p className="mt-4 text-slate-400">
                Benefit from a secure platform built for traders and analysts who need focus and fast access to trade history.
              </p>
            </div>

            <div className="space-y-5 rounded-[1.5rem] border border-slate-800 bg-slate-950/95 p-6">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-4">
                <span className="text-sm text-slate-400">Journal entries</span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Organized</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 p-4">
                <span className="text-sm text-slate-400">Risk control</span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Built-in</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
