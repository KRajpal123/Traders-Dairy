'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/hooks/useAuth';

interface Trade {
  symbol: string;
  action: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  date: string;
  notes?: string;
  pnl: string;
  points: string;
  isPositive: boolean;
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }
  }, [router]);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 5;

  useEffect(() => {
    const savedTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    setTrades(savedTrades);
  }, []);

  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);

  const totalPnL = useMemo(() => {
    return trades.reduce((sum, trade) => {
      const pnlValue = trade.pnl.replace(/[+$₹]/g, '');
      return sum + parseFloat(pnlValue);
    }, 0);
  }, [trades]);

  const winRate = useMemo(() => {
    if (trades.length === 0) return 0;
    const wins = trades.filter(trade => trade.pnl.startsWith('+')).length;
    return (wins / trades.length) * 100;
  }, [trades]);

  const renderTrades = () => {
    if (trades.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-12 text-center py-20">
            <div className="text-slate-400">
              <p className="text-xl mb-4">No trades yet</p>
              <p className="mb-6">Please login to check the data</p>
              <a href="/trades" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                Add First Trade
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8 -8H4" />
                </svg>
              </a>
            </div>
          </td>
        </tr>
      );
    }
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = trades.slice(indexOfFirstTrade, indexOfLastTrade);
  return currentTrades.map((trade, index) => {
        const displayPoints = trade.points || Math.abs(parseFloat(trade.exitPrice || '0') - parseFloat(trade.entryPrice || '0')).toFixed(1);
        const formattedPoints = (trade.isPositive ? '+' : '-') + displayPoints;
      return (
        <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
          <td className="p-6">{trade.date}</td>
          <td className="p-6 font-mono">{trade.symbol}</td>
          <td className="p-6">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              trade.action === 'BUY' 
                ? 'bg-green-900/50 text-green-400' 
                : 'bg-red-900/50 text-red-400'
            }`}>
              {trade.action}
            </span>
          </td>
          <td className={`p-6 font-mono ${trade.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {formattedPoints}
          </td>
          <td className="p-6">{trade.quantity}</td>
          <td className="p-6">
            <span className={`font-semibold ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {trade.pnl}
            </span>
          </td>
          <td className="p-6">
            <button
              onClick={() => {
                if (confirm('Delete this trade?')) {
                  const updatedTrades = trades.filter((_, i) => i !== indexOfFirstTrade + index);
                  setTrades(updatedTrades);
                  setCurrentPage(1);
                }
              }}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              title="Delete trade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995 -1.858L5 7m5 4v6m4 -6v6m1 -10V4a1 1 0 00-1 -1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
      );
    });
  };

  const totalPages = Math.ceil(trades.length / tradesPerPage);

  const renderPagination = () => {
    return (
      <div className="px-8 py-6 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {(currentPage - 1) * tradesPerPage + 1} to {Math.min(currentPage * tradesPerPage, trades.length)} of {trades.length} trades
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-1 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7 -7 7 -7" />
            </svg>
            Prev
          </button>
          <span className="text-sm text-slate-400 px-4">{currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 border border-primary-500 rounded-xl text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-1 font-medium"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7 -7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="p-8 max-w-7xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-12">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className={`text-3xl font-bold mb-2 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(totalPnL >= 0 ? '+' : '-') + Math.abs(totalPnL).toLocaleString()} ₹
          </div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Total PnL</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className="text-3xl font-bold text-emerald-400 mb-2">{winRate.toFixed(1)}%</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Win Rate</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className="text-3xl font-bold text-slate-300 mb-2">{trades.length}</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Total Trades</div>
        </div>
      </div>
      
      {/* Recent Trades */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800/50">
          <h2 className="text-2xl font-bold">Recent Trades</h2>
          <p className="text-slate-500 mt-1">Your latest trading activity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Date</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Symbol</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Action</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Points</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Qty</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">P&L</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderTrades()}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>
    </main>
  );
}

