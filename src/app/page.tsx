'use client';

import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity } from 'lucide-react';

const portfolioStats = [
  { label: 'Portfolio Value', value: '$124,850.50', change: '+8.2%', isPositive: true },
  { label: 'Day P&L', value: '+$2,450.00', change: '+5.1%', isPositive: true },
  { label: 'Open Positions', value: '12', change: 'Active trades', isPositive: true },
  { label: 'Cash Available', value: '$45,200.75', change: '+2.3%', isPositive: true },
];

const recentTrades = [
  { symbol: 'AAPL', action: 'BUY', price: '$195.42', quantity: '25', pnl: '+$1,240', isPositive: true },
  { symbol: 'TSLA', action: 'SELL', price: '$238.50', quantity: '10', pnl: '-$320', isPositive: false },
  { symbol: 'MSFT', action: 'BUY', price: '$435.89', quantity: '15', pnl: '+$1,530', isPositive: true },
  { symbol: 'GOOGL', action: 'SELL', price: '$145.23', quantity: '20', pnl: '+$2,100', isPositive: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <main className="mx-auto max-w-7xl px-8 py-8">
        <section className="mb-10 rounded-[2rem] border border-dark-border bg-dark-secondary/80 p-8 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.8)] backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-primary-300">Secure access</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Access your journal and trading analytics</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                Sign in or create an account to manage trades, track performance, and review entries in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold">Portfolio Overview</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {portfolioStats.map((stat) => (
              <div key={stat.label} className="card-dark">
                <div className="flex items-start justify-between p-6">
                  <div>
                    <p className="text-sm text-dark-secondary mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold text-dark-primary mb-2">{stat.value}</p>
                    <p className={`text-xs font-medium ${stat.isPositive ? 'profit-text' : 'loss-text'}`}>
                      {stat.change}
                    </p>
                  </div>
                  {stat.isPositive ? (
                    <TrendingUp className="h-6 w-6 text-profit-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-loss-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Trades */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">Recent Trades</h2>
          <div className="overflow-hidden rounded-lg border border-dark-border bg-dark-secondary">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-secondary">Symbol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-secondary">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-secondary">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-secondary">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark-secondary">P&L</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, idx) => (
                  <tr key={idx} className="border-b border-dark-border hover:bg-dark-tertiary transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-dark-primary">{trade.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-dark-tertiary px-2 py-1 text-xs font-medium">
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-text">{trade.price}</td>
                    <td className="px-6 py-4 text-dark-text">{trade.quantity}</td>
                    <td className={`px-6 py-4 font-semibold ${trade.isPositive ? 'profit-text' : 'loss-text'}`}>
                      {trade.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
