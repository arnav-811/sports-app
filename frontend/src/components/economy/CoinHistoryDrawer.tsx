import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { X, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface Props { onClose: () => void }

const TYPE_TABS = ['All', 'Earned', 'Lost', 'Spent'];

export default function CoinHistoryDrawer({ onClose }: Props) {
  const [tab, setTab] = useState('All');

  const { data: stats } = useQuery({ queryKey: ['coin-stats'], queryFn: () => api.get('/coins/stats').then(r => r.data) });
  const typeFilter = tab === 'Earned' ? 'earn' : tab === 'Lost' ? 'lose' : tab === 'Spent' ? 'spend' : undefined;
  const { data } = useQuery({
    queryKey: ['coin-history', tab],
    queryFn: () => api.get('/coins/history', { params: { limit: 20, type: typeFilter } }).then(r => r.data),
  });

  const txns: Transaction[] = data?.transactions || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-1 border-l border-white/10 h-full overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-bold text-text-primary">Coin Wallet</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        {stats && (
          <div className="p-4 border-b border-white/10 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-sm font-black font-mono text-football">+{stats.totalEarned?.toLocaleString()}</div>
              <div className="text-[10px] text-text-muted">Total earned</div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-black font-mono ${stats.weeklyNet >= 0 ? 'text-football' : 'text-red-400'}`}>
                {stats.weeklyNet >= 0 ? '+' : ''}{stats.weeklyNet?.toLocaleString()}
              </div>
              <div className="text-[10px] text-text-muted">This week</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-black font-mono text-red-400">-{stats.totalLost?.toLocaleString()}</div>
              <div className="text-[10px] text-text-muted">Total lost</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 p-3 bg-surface-2/50">
          {TYPE_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${tab === t ? 'bg-surface-0 text-text-primary' : 'text-text-muted'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="flex-1 divide-y divide-white/5">
          {txns.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                tx.type === 'earn' ? 'bg-football/20' : tx.type === 'lose' ? 'bg-red-500/20' : 'bg-gray-500/20'
              }`}>
                {tx.type === 'earn' ? <TrendingUp className="w-3.5 h-3.5 text-football" />
                  : tx.type === 'lose' ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  : <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-tight truncate">{tx.description || tx.reason}</p>
                <p className="text-[10px] text-text-muted">{timeAgo(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold font-mono ${tx.amount > 0 ? 'text-football' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </div>
                <div className="text-[9px] text-text-muted font-mono">⚡ {tx.balanceAfter?.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {txns.length === 0 && <div className="py-8 text-center text-text-muted text-xs">No transactions yet</div>}
        </div>
      </div>
    </div>
  );
}
