import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

interface Props {
  compact?: boolean;
  multiplier?: number;
  streak?: number;
}

function FireIcon({ count, animate }: { count: number; animate: boolean }) {
  return (
    <span className={`text-base ${animate ? 'animate-pulse' : ''}`}>
      {'🔥'.repeat(count)}
    </span>
  );
}

export default function MultiplierDisplay({ compact = false, multiplier: propMultiplier, streak: propStreak }: Props) {
  const { user } = useAuthStore();
  const { data } = useQuery({
    queryKey: ['prediction-multiplier'],
    queryFn: () => api.get('/odds/multiplier').then(r => r.data),
    enabled: !!user && propMultiplier === undefined,
    staleTime: 60000,
  });

  const multiplier = propMultiplier ?? data?.predictionMultiplier ?? 1.0;
  const streak = propStreak ?? data?.multiplierStreak ?? 0;

  const fireCount = multiplier >= 3 ? 3 : multiplier >= 2 ? 2 : multiplier >= 1.5 ? 1 : 0;
  const isAnimate = multiplier >= 3;
  const color = multiplier >= 3 ? 'text-red-400' : multiplier >= 2 ? 'text-orange-400' : multiplier >= 1.5 ? 'text-yellow-400' : 'text-gray-400';

  if (!user) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs" title={`${multiplier}× multiplier — ${streak} correct in a row`}>
        {fireCount > 0 && <FireIcon count={fireCount} animate={isAnimate} />}
        <span className={`font-mono font-bold ${color}`}>{multiplier}×</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
      <div className="flex items-center gap-1">
        {fireCount > 0 ? <FireIcon count={fireCount} animate={isAnimate} /> : <span className="text-gray-500">🔥</span>}
      </div>
      <div>
        <div className={`text-sm font-black font-mono ${color}`}>{multiplier}×</div>
        <div className="text-[9px] text-text-muted">{streak} in a row</div>
      </div>
      {streak >= 3 && (
        <div className="text-[9px] text-text-muted ml-auto">
          {multiplier < 3 ? `${streak >= 7 ? 7 : streak >= 5 ? 5 : 3} for ${multiplier < 3 ? 'next tier' : 'max'}` : 'MAX'}
        </div>
      )}
    </div>
  );
}
