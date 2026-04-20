'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import ProfitLossLineChart from '../../components/charts/ProfitLossLineChart';
import WinLossPieChart from '../../components/charts/WinLossPieChart';
import MonthlyPerformanceBarChart from '../../components/charts/MonthlyPerformanceBarChart';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('desc');
const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const authValue = typeof window !== 'undefined' ? localStorage.getItem('traderDairyAuth') === 'true' : false;
    setIsAuthenticated(authValue);

    if (authValue) {
      const storedTrades = JSON.parse(localStorage.getItem('traderDairyTrades') || '[]');
      // Sort by timestamp descending (most recent first)
      storedTrades.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTrades(storedTrades);
    }
  }, []);

  // Calculate real data from trades
  const chartData = useMemo(() => {
    if (!trades.length) {
      return {
        profitLossData: [],
        winLossData: [
          { name: 'Wins', value: 0, color: '#4ade80' },
          { name: 'Losses', value: 0, color: '#f87171' },
        ],
        monthlyData: [],
      };
    }

    // Calculate P&L for each trade
    const tradesWithPnL = trades.map((trade: any) => {
      const tradeType = (trade.tradeType || '').toLowerCase();
      const pnl = tradeType === 'buy'
        ? (parseFloat(trade.exitPrice) - parseFloat(trade.entryPrice)) * parseFloat(trade.quantity)
        : (parseFloat(trade.entryPrice) - parseFloat(trade.exitPrice)) * parseFloat(trade.quantity);
      return { ...trade, pnl };
    });

    // Profit/Loss Line Chart - cumulative P&L over time
    const profitLossData = tradesWithPnL
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .reduce((acc: any[], trade, index) => {
        const cumulativePnL = acc.length > 0 ? acc[acc.length - 1].profit + trade.pnl : trade.pnl;
        const date = trade.tradeDate || new Date(trade.timestamp).toISOString().slice(0, 10);
        acc.push({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profit: Math.round(cumulativePnL * 100) / 100,
        });
        return acc;
      }, []);

    // Win/Loss Pie Chart
    const wins = tradesWithPnL.filter(trade => trade.pnl > 0).length;
    const losses = tradesWithPnL.filter(trade => trade.pnl < 0).length;
    const winLossData = [
      { name: 'Wins', value: wins, color: '#4ade80' },
      { name: 'Losses', value: losses, color: '#f87171' },
    ];

    // Monthly Performance Bar Chart
    const monthlyPnL = tradesWithPnL.reduce((acc: { [key: string]: { label: string; profit: number } }, trade) => {
      const tradeDateValue = trade.tradeDate ? new Date(trade.tradeDate) : new Date(trade.timestamp);
      const monthKey = `${tradeDateValue.getFullYear()}-${String(tradeDateValue.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = tradeDateValue.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[monthKey] = {
        label: monthLabel,
        profit: (acc[monthKey]?.profit || 0) + trade.pnl,
      };
      return acc;
    }, {});

    const monthlyData = Object.entries(monthlyPnL)
      .map(([monthKey, data]) => ({
        month: data.label,
        profit: Math.round(data.profit * 100) / 100,
        monthKey,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return { profitLossData, winLossData, monthlyData };
  }, [trades]);

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a: any, b: any) => {
      const aDate = a.tradeDate ? new Date(a.tradeDate) : new Date(a.timestamp);
      const bDate = b.tradeDate ? new Date(b.tradeDate) : new Date(b.timestamp);
      return dateSortOrder === 'desc'
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();
    });
  }, [trades, dateSortOrder]);

  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const paginatedTrades = sortedTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (tradeId: string) => {
    if (confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      const updatedTrades = trades.filter(trade => trade.id !== tradeId);
      localStorage.setItem('traderDairyTrades', JSON.stringify(updatedTrades));
      setTrades(updatedTrades);
      // Reset to page 1 if current page is no longer valid
      if (currentPage > Math.ceil(updatedTrades.length / itemsPerPage)) {
        setCurrentPage(1);
      }
    }
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!trades.length) {
      return {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
      };
    }

    const tradesWithPnL = trades.map((trade: any) => {
      const tradeType = (trade.tradeType || '').toLowerCase();
      const pnl = tradeType === 'buy'
        ? (parseFloat(trade.exitPrice) - parseFloat(trade.entryPrice)) * parseFloat(trade.quantity)
        : (parseFloat(trade.entryPrice) - parseFloat(trade.exitPrice)) * parseFloat(trade.quantity);
      return { ...trade, pnl };
    });

    const totalPnL = tradesWithPnL.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = tradesWithPnL.filter(trade => trade.pnl > 0).length;
    const winRate = tradesWithPnL.length > 0 ? Math.round((wins / tradesWithPnL.length) * 100) : 0;

    return {
      totalPnL: Math.round(totalPnL * 100) / 100,
      winRate,
      totalTrades: trades.length,
    };
  }, [trades]);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-950 text-slate-100" />;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/95 p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
          <h1 className="text-4xl font-semibold text-white">Dashboard access restricted</h1>
          <p className="mt-4 text-slate-400">
            You must be logged in to view the trading dashboard. Sign in to unlock your profit analytics,
            trade performance, and journal metrics.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              Go to Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-primary-400 hover:text-primary-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] lg:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary-300">Trading dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Portfolio performance overview</h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Track total profit/loss, win rate, recent trades, and P&L momentum from one secure dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-4 text-right">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Trades</p>
              <p className="mt-2 text-3xl font-semibold text-white">{summaryStats.totalTrades}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card-dark p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Profit / Loss</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  $
                </span>
                <div>
                  <p className="text-3xl font-semibold text-white">${summaryStats.totalPnL.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-slate-400">{summaryStats.totalTrades} total trades</p>
                </div>
              </div>
            </div>

            <div className="card-dark p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Win Rate</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-300">
                  %
                </span>
                <div>
                  <p className="text-3xl font-semibold text-white">{summaryStats.winRate}%</p>
                  <p className="mt-1 text-sm text-slate-400">Based on {summaryStats.totalTrades} trades</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Profit momentum</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">P&L line chart</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">All time</span>
            </div>

            <div className="h-72 w-full">
              <ProfitLossLineChart data={chartData.profitLossData} />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card-dark p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Win/Loss ratio</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Trading performance</h2>
            </div>
            <div className="h-72 w-full">
              <WinLossPieChart data={chartData.winLossData} />
            </div>
          </div>

          <div className="card-dark p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Monthly performance</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Profit by month</h2>
            </div>
            <div className="h-72 w-full">
              <MonthlyPerformanceBarChart data={chartData.monthlyData} />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Recent trades</h2>
              <p className="mt-2 text-sm text-slate-400">Latest positions and realized performance from your trading history.</p>
            </div>
            <Link
              href="/trades"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-primary-400 hover:text-primary-300"
            >
              Go to trades page
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/80 text-left text-xs uppercase tracking-[0.25em] text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-6 py-4 cursor-pointer select-none"
                      onClick={() => setDateSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                    >
                      Date {dateSortOrder === 'desc' ? '↓' : '↑'}
                    </th>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">P&L</th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {paginatedTrades.map((trade: any, idx: number) => {
                    const tradeType = (trade.tradeType || '').toLowerCase();
                    const pnl = tradeType === 'buy'
                      ? (parseFloat(trade.exitPrice) - parseFloat(trade.entryPrice)) * parseFloat(trade.quantity)
                      : (parseFloat(trade.entryPrice) - parseFloat(trade.exitPrice)) * parseFloat(trade.quantity);
                    const pnlFormatted = pnl.toFixed(2);
                    const isPositive = pnl >= 0;
                    const tradeTypeLabel = trade.tradeType || 'Trade';
                    const isBuy = tradeTypeLabel.toLowerCase() === 'buy';
                    return (
                      <tr key={trade.id || idx} className="hover:bg-slate-950/80 transition-colors">
                        <td className="px-6 py-4 text-slate-400">{trade.tradeDate || new Date(trade.timestamp).toISOString().slice(0, 10)}</td>
                        <td className="px-6 py-4 font-semibold text-white">{trade.symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${isBuy ? 'bg-emerald-500/10 text-emerald-300' : 'bg-sky-500/10 text-sky-300'}`}>
                            {tradeTypeLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">${trade.entryPrice}</td>
                        <td className="px-6 py-4 text-slate-400">{trade.quantity}</td>
                        <td className={`px-6 py-4 font-semibold ${isPositive ? 'profit-text' : 'loss-text'}`}>${pnlFormatted}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(trade.id || '')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {paginatedTrades.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No trades found.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-3 py-2 text-sm text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
