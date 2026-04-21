'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/hooks/useAuth';
import { recentTrades } from './data';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  return (
    <main className="p-8 max-w-7xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-12">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className="text-3xl font-bold text-green-400 mb-2">+$12,450</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Total PnL</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className="text-3xl font-bold text-emerald-400 mb-2">78.4%</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Win Rate</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:bg-slate-900/70 transition-all duration-300 hover:-translate-y-1">
          <div className="text-3xl font-bold text-slate-300 mb-2">247</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Total Trades</div>
        </div>
      </div>
      
      {/* Recent Trades */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
            <p className="text-slate-500">Your latest trading activity</p>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl transition-colors font-medium ml-auto">
            View All Trades
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Symbol</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Action</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Price</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">Qty</th>
                <th className="text-left p-6 font-semibold text-slate-300 pb-4">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.slice(0,5).map((trade, index) => (
                <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
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
                  <td className={`p-6 font-mono ${trade.isPositive ? 'text-green-400' : 'text-red-400'}`}>{trade.price}</td>
                  <td className="p-6">{trade.quantity}</td>
                  <td className="p-6">
                    <span className={`font-semibold ${trade.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
{recentTrades.length > 5 && (
          <div className="px-8 py-6 border-t border-slate-800/50 bg-slate-900/30 flex justify-end">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4 -4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
