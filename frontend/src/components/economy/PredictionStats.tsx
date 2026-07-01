import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

interface PredictionStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  totalWon: number;
  totalLost: number;
  netCoins: number;
  bestMultiplier: number;
  currentStreak: number;
  longestStreak: number;
}

interface Props { compact?: boolean }

export default function PredictionStats({ compact = false }: Props) {
  const { user } = useAuthStore();

  const { data: stats } = useQuery<PredictionStats>({
    queryKey: ['prediction-stats'],
    queryFn: () => api.get('/odds/stats').then(r => r.data),
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user || !stats) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="text-center">
          <div className="font-bold font-mono text-text-primary">{stats.accuracy.toFixed(0)}%</div>
          <div className="text-[9px] text-text-muted">Accuracy</div>
        </div>
        <div className="text-center">
          <div className={`font-bold font-mono ${stats.netCoins >= 0 ? 'text-football' : 'text-red-400'}`}>
            {stats.netCoins >= 0 ? '+' : ''}{stats.netCoins.toLocaleString()}
          </div>
          <div className="text-[9px] text-text-muted">Net ⚡</div>
        </div>
        <div className="text-center">
          <div className="font-bold font-mono text-yellow-400">{stats.bestMultiplier}×</div>
          <div className="text-[9px] text-text-muted">Best</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <h3 className="text-xs font-bold text-text-primary">Prediction Record</h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Accuracy', value: `${stats.accuracy.toFixed(1)}%`, color: 'text-football' },
          { label: 'Predictions', value: `${stats.correctPredictions}/${stats.totalPredictions}`, color: 'text-text-primary' },
          { label: 'Best ×', value: `${stats.bestMultiplier}×`, color: 'text-yellow-400' },
          { label: 'Net Coins', value: `${stats.netCoins >= 0 ? '+' : ''}${stats.netCoins.toLocaleString()}`, color: stats.netCoins >= 0 ? 'text-football' : 'text-red-400' },
          { label: 'Won', value: `+${stats.totalWon.toLocaleString()}`, color: 'text-football' },
          { label: 'Lost', value: `-${stats.totalLost.toLocaleString()}`, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-2 rounded-lg p-2 text-center">
            <div className={`text-sm font-black font-mono ${color}`}>{value}</div>
            <div className="text-[9px] text-text-muted">{label}</div>
          </div>
        ))}
      </div>
      {stats.currentStreak > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Current streak</span>
          <span className="font-bold text-football">{stats.currentStreak} correct 🔥</span>
        </div>
      )}
    </div>
  );
}
