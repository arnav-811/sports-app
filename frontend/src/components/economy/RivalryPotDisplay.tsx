import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

interface Props {
  rivalryId: string;
  potCoins: number;
  isHighStakes: boolean;
  rivalName: string;
}

export default function RivalryPotDisplay({ rivalryId, potCoins, isHighStakes, rivalName }: Props) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { mutate: raiseStakes, isPending } = useMutation({
    mutationFn: () => api.post(`/rivalries/${rivalryId}/raise-stakes`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rivalries'] }); qc.invalidateQueries({ queryKey: ['coin-balance'] }); },
  });

  if (!user) return null;

  return (
    <div className={`rounded-xl p-3 flex items-center justify-between ${isHighStakes ? 'bg-red-500/10 border border-red-500/20' : 'bg-surface-2'}`}>
      <div>
        <div className="flex items-center gap-1.5">
          <span>{isHighStakes ? '🔥' : '⚡'}</span>
          <span className="text-xs font-bold text-text-primary font-mono">{potCoins.toLocaleString()} ⚡</span>
          {isHighStakes && <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide">High Stakes</span>}
        </div>
        <p className="text-[9px] text-text-muted mt-0.5">Rivalry pot vs {rivalName}</p>
      </div>
      {!isHighStakes && (
        <button onClick={() => raiseStakes()} disabled={isPending}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
          {isPending ? '...' : 'Raise Stakes'}
        </button>
      )}
    </div>
  );
}
