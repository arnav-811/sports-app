import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { timeAgo } from '../../lib/utils';

interface ParlayLeg {
  id: string;
  question: string;
  selectedOption: string;
  oddsAtTime: number;
  result: 'won' | 'lost' | 'pending';
}

interface Parlay {
  id: string;
  legs: ParlayLeg[];
  totalStake: number;
  combinedOdds: number;
  potentialWin: number;
  actualWin: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export default function ParlayHistory() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['parlay-history'],
    queryFn: () => api.get('/odds/history?type=parlay').then(r => r.data),
    enabled: !!user,
  });

  const parlays: Parlay[] = data?.parlays || [];

  if (!user) return null;

  return (
    <div className="space-y-2">
      {parlays.length === 0 && (
        <div className="text-center py-6 text-text-muted text-xs">No parlay history yet</div>
      )}
      {parlays.map(p => (
        <div key={p.id} className={`rounded-xl p-3 border ${
          p.status === 'won' ? 'bg-football/10 border-football/20'
          : p.status === 'lost' ? 'bg-red-500/10 border-red-500/20'
          : 'bg-surface-2 border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">{p.legs.length}-leg parlay</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                p.status === 'won' ? 'bg-football/20 text-football'
                : p.status === 'lost' ? 'bg-red-500/20 text-red-400'
                : 'bg-surface-0 text-text-muted'
              }`}>{p.status === 'pending' ? 'Live' : p.status === 'won' ? 'Won' : 'Bust'}</span>
            </div>
            <div className="text-right">
              {p.status === 'won' ? (
                <span className="text-sm font-black font-mono text-football">+{p.actualWin.toLocaleString()} ⚡</span>
              ) : p.status === 'lost' ? (
                <span className="text-sm font-black font-mono text-red-400">-{p.totalStake.toLocaleString()} ⚡</span>
              ) : (
                <span className="text-xs font-mono text-text-muted">Potential: {p.potentialWin.toLocaleString()} ⚡</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {p.legs.map(leg => (
              <div key={leg.id} className="flex items-center gap-2 text-[10px]">
                <span className={leg.result === 'won' ? 'text-football' : leg.result === 'lost' ? 'text-red-400' : 'text-text-muted'}>
                  {leg.result === 'won' ? '✓' : leg.result === 'lost' ? '✗' : '·'}
                </span>
                <span className="text-text-muted flex-1 truncate">{leg.question}</span>
                <span className="text-text-primary">{leg.selectedOption}</span>
                <span className="font-mono font-bold" style={{ color: leg.result === 'won' ? '#22C55E' : leg.result === 'lost' ? '#EF4444' : '#9CA3AF' }}>{leg.oddsAtTime}×</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-text-muted">
            <span>Staked {p.totalStake} ⚡ · {p.combinedOdds.toFixed(2)}× combined</span>
            <span>{timeAgo(p.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
