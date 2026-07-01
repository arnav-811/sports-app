import React, { useState } from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { CoinTransaction } from '../../types/prediction';
import { useAuthStore } from '../../store/authStore';

export default function CoinBalance() {
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const { data: history } = useQuery<CoinTransaction[]>({
    queryKey: ['coin-history'],
    queryFn: () => api.get('/predictions/coins/history').then(r => r.data),
    enabled: expanded && !!user,
  });

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
      >
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-mono font-bold text-text-primary">{(user.sportcoins || 0).toLocaleString()}</span>
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-surface-1 border border-white/10 rounded-xl shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-text-primary">Sportcoins</span>
            <button onClick={() => setExpanded(false)} className="text-text-muted text-xs">×</button>
          </div>
          <div className="text-2xl font-black font-mono text-yellow-400 mb-3">{(user.sportcoins || 0).toLocaleString()}</div>

          {history && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.slice(0, 15).map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted capitalize">{t.reason.replace(/_/g, ' ')}</span>
                  <span className={`font-mono font-semibold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                    {t.amount > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
