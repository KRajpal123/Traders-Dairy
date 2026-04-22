'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTrades } from '@/context/TradesContext';

function parsePnLValue(pnl: string) {
  return Number(pnl.replace(/[^0-9.-]/g, '')) || 0;
}

function formatCurrency(value: number) {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}₹${Math.abs(value).toLocaleString()}`;
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}-${month}-${year}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getWeekKey(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    key: `${date.getFullYear()}-W${String(weekNo).padStart(2, '0')}`,
    label: `W${weekNo} ${date.getFullYear()}`,
  };
}

function EmptyAnalyticsState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
      <h2 className="text-2xl font-semibold text-white">No analytics yet</h2>
      <p className="mx-auto mt-3 max-w-2xl text-slate-400">
        Add a few trades and this page will start showing your daily, weekly, and monthly performance trends.
      </p>
      <Link
        href="/trades"
        className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
      >
        Add your first trade
      </Link>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.9)]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const { trades } = useTrades();

  const analytics = useMemo(() => {
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, { label: string; value: number }>();
    const monthlyMap = new Map<string, { label: string; value: number }>();
    const symbolMap = new Map<string, number>();

    let totalPnL = 0;
    let bestTrade = Number.NEGATIVE_INFINITY;
    let worstTrade = Number.POSITIVE_INFINITY;
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    for (const trade of trades) {
      const pnlValue = parsePnLValue(trade.pnl);
      totalPnL += pnlValue;
      bestTrade = Math.max(bestTrade, pnlValue);
      worstTrade = Math.min(worstTrade, pnlValue);

      if (pnlValue >= 0) {
        wins += 1;
        grossProfit += pnlValue;
      } else {
        losses += 1;
        grossLoss += Math.abs(pnlValue);
      }

      dailyMap.set(trade.date, (dailyMap.get(trade.date) ?? 0) + pnlValue);

      const week = getWeekKey(trade.date);
      const existingWeek = weeklyMap.get(week.key);
      weeklyMap.set(week.key, {
        label: week.label,
        value: (existingWeek?.value ?? 0) + pnlValue,
      });

      const monthDate = new Date(`${trade.date}T00:00:00`);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const existingMonth = monthlyMap.get(monthKey);
      monthlyMap.set(monthKey, {
        label: formatMonthLabel(monthDate),
        value: (existingMonth?.value ?? 0) + pnlValue,
      });

      symbolMap.set(trade.symbol, (symbolMap.get(trade.symbol) ?? 0) + pnlValue);
    }

    const dailyData = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        label: formatDisplayDate(date),
        value,
      }));

    const weeklyData = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);

    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);

    const topSymbols = Array.from(symbolMap.entries())
      .map(([symbol, value]) => ({ symbol, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    const averageTrade = trades.length ? totalPnL / trades.length : 0;

    return {
      dailyData,
      weeklyData,
      monthlyData,
      topSymbols,
      totalPnL,
      averageTrade,
      bestTrade: trades.length ? bestTrade : 0,
      worstTrade: trades.length ? worstTrade : 0,
      wins,
      losses,
      profitFactor,
    };
  }, [trades]);

  const winLossData = [
    { name: 'Wins', value: analytics.wins, color: '#22c55e' },
    { name: 'Losses', value: analytics.losses, color: '#ef4444' },
  ].filter((entry) => entry.value > 0);

  return (
    <ProtectedRoute redirectMessage="Please login to access analytics.">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-300">
              Analytics
            </span>
            <h1 className="mt-4 text-4xl font-bold text-white">Trading performance analytics</h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              Track your daily, weekly, and monthly P&amp;L, spot strong symbols, and understand whether your edge is improving.
            </p>
          </div>
          <Link
            href="/trades"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-primary-500 hover:text-white"
          >
            Add another trade
          </Link>
        </div>

        {trades.length === 0 ? (
          <EmptyAnalyticsState />
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Total P&amp;L</p>
                <p className={`mt-3 text-3xl font-bold ${analytics.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(analytics.totalPnL)}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Average trade</p>
                <p className={`mt-3 text-3xl font-bold ${analytics.averageTrade >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(analytics.averageTrade)}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Best trade</p>
                <p className="mt-3 text-3xl font-bold text-emerald-400">{formatCurrency(analytics.bestTrade)}</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Worst trade</p>
                <p className="mt-3 text-3xl font-bold text-red-400">{formatCurrency(analytics.worstTrade)}</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400">Profit factor</p>
                <p className="mt-3 text-3xl font-bold text-slate-100">{analytics.profitFactor.toFixed(2)}</p>
              </div>
            </section>

            <div className="grid gap-8 xl:grid-cols-2">
              <SectionCard title="Daily P&L" subtitle="See how each trading day performed.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 16 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {analytics.dailyData.map((entry) => (
                          <Cell key={entry.label} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Weekly P&L" subtitle="Compare consistency from week to week.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 16 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {analytics.weeklyData.map((entry) => (
                          <Cell key={entry.label} fill={entry.value >= 0 ? '#38bdf8' : '#f97316'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
              <SectionCard title="Monthly P&L" subtitle="Zoom out and monitor bigger trends.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 16 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" fill="#a855f7" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Win/Loss Split" subtitle="A quick read on trade quality.">
                <div className="flex h-80 flex-col items-center justify-center gap-4">
                  {winLossData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="75%">
                        <PieChart>
                          <Pie
                            data={winLossData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {winLossData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#020617', border: '1px solid #334155', borderRadius: 16 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
                        {winLossData.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}: {entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400">Add more trades to see the split.</p>
                  )}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Top Symbols" subtitle="See which instruments are contributing the most.">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {analytics.topSymbols.map((symbol) => (
                  <div key={symbol.symbol} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{symbol.symbol}</p>
                    <p className={`mt-3 text-2xl font-semibold ${symbol.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(symbol.value)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
