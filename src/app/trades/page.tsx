'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/hooks/useAuth';
import { useTrades } from '@/context/TradesContext';

export default function TradesPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }
  }, [router]);

  interface FormData {
    type: 'BUY' | 'SELL';
    symbol: string;
    entryPrice: string;
    exitPrice: string;
    quantity: string;
    date: string;
    notes: string;
  }

  const [formData, setFormData] = useState<FormData>({
    type: 'BUY',
    symbol: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    date: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
const newErrors: Record<string, string> = {};
    if (!formData.symbol.trim()) newErrors.symbol = 'Stock name is required';
    if (!formData.entryPrice || isNaN(Number(formData.entryPrice))) newErrors.entryPrice = 'Valid entry price required';
    if (!formData.exitPrice || isNaN(Number(formData.exitPrice))) newErrors.exitPrice = 'Valid exit price required';
    if (!formData.quantity || isNaN(Number(formData.quantity))) newErrors.quantity = 'Valid quantity required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { addTrade } = useTrades();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Calculate PnL
      const entry = Number(formData.entryPrice);
      const exit = Number(formData.exitPrice);
      const qty = Number(formData.quantity);
      const priceDiff = Math.abs(Number(formData.exitPrice) - Number(formData.entryPrice));
      const points = priceDiff.toFixed(1);
      const directionProfit = formData.type === 'BUY' ? Number(formData.exitPrice) > Number(formData.entryPrice) : Number(formData.entryPrice) > Number(formData.exitPrice);
      const pnlValue = directionProfit ? priceDiff * qty : - (priceDiff * qty);
      const pnlStr = (pnlValue >= 0 ? '+' : '-') + '₹' + Math.abs(pnlValue).toLocaleString();
      const isPositive = pnlValue >= 0;
      
      const newTrade: Trade = {
        symbol: formData.symbol.toUpperCase(),
        action: formData.type,
        entryPrice: formData.entryPrice,
        exitPrice: formData.exitPrice,
        quantity: formData.quantity,
        date: formData.date,
        notes: formData.notes,
        pnl: pnlStr,
        points: points,
        isPositive
      };
      
      addTrade(newTrade);
      alert('Trade added successfully!');
      // Reset form
      setFormData({
        type: 'BUY',
        symbol: '',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        date: '',
        notes: ''
      });
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-12">Add New Trade</h1>
      
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Trade Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Stock Symbol</label>
            <input 
              type="text" 
              placeholder="AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              autoComplete="off"
            />
            {errors.symbol && <p className="mt-1 text-sm text-red-400">{errors.symbol}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Entry Price</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="195.42"
                value={formData.entryPrice}
                onChange={(e) => setFormData({...formData, entryPrice: e.target.value})}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              {errors.entryPrice && <p className="mt-1 text-sm text-red-400">{errors.entryPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Exit Price</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="200.00"
                value={formData.exitPrice}
                onChange={(e) => setFormData({...formData, exitPrice: e.target.value})}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              {errors.exitPrice && <p className="mt-1 text-sm text-red-400">{errors.exitPrice}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Quantity</label>
              <input 
                type="number"
                placeholder="25"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Notes</label>
            <textarea 
              rows="3"
              placeholder="Optional notes about this trade..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 resize-vertical focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Add Trade
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8 -8H4" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
