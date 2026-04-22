'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

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

type TradeAction = 
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'DELETE_TRADE'; payload: number }
  | { type: 'SET_TRADES'; payload: Trade[] };

const TradesContext = createContext<{
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  deleteTrade: (index: number) => void;
  dispatch: React.Dispatch<TradeAction>;
} | null>(null);

const tradesReducer = (state: Trade[], action: TradeAction): Trade[] => {
  switch (action.type) {
    case 'ADD_TRADE':
      return [action.payload, ...state.slice(0, 99)]; // Keep 100 max
    case 'DELETE_TRADE':
      return state.filter((_, index) => index !== action.payload);
    case 'SET_TRADES':
      return action.payload.slice(0, 100);
    default:
      return state;
  }
};

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, dispatch] = useReducer(tradesReducer, []);

  const addTrade = (trade: Trade) => dispatch({ type: 'ADD_TRADE', payload: trade });
  const deleteTrade = (index: number) => dispatch({ type: 'DELETE_TRADE', payload: index });

  return (
    <TradesContext.Provider value={{ trades, addTrade, deleteTrade, dispatch }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades must be used within TradesProvider');
  }
  return context;
}

