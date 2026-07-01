import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

export default function DailyClaimButton() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [claimed, setClaimed] = useState(false);
  const [result, setResult] = useState<{ totalAmount: number; newStreak: number; bonusAmount: number } | null>(null);

  const { data: claimStatus } = useQuery({
    queryKey: ['claim-status'],
    queryFn: () => api.get('/coins/daily-claim').catch(() => ({ data: { alreadyClaimed: false } })).then(r => r.data),
    enabled: !!user,
    retry: false,
  });

  const { mutate: claim, isPending } = useMutation({
    mutationFn: () => api.post('/coins/daily-claim').then(r => r.data),
    onSuccess: (data) => {
      setResult(data);
      setClaimed(true);
      qc.invalidateQueries({ queryKey: ['coin-balance'] });
      qc.invalidateQueries({ queryKey: ['coin-stats'] });
    },
  });

  if (!user || claimed || claimStatus?.alreadyClaimed) return null;

  const streak = user.dailyStreak || 0;
  const nextStreak = streak + 1;
  const isStreakDay7 = nextStreak === 7;
  const isStreakDay30 = nextStreak === 30;

  if (result) {
    return (
      <div className="card bg-football/10 border-football/30 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-football">
            {result.bonusAmount > 0 ? (result.newStreak === 30 ? '💫 30-day streak!' : '🔥 7-day streak!') : '✅ Daily coins claimed!'}
          </div>
          <div className="text-xs text-text-muted">+{result.totalAmount} ⚡ · Day {result.newStreak} streak · Come back tomorrow</div>
        </div>
        <div className="text-xl font-black font-mono text-football">+{result.totalAmount}⚡</div>
      </div>
    );
  }

  return (
    <button
      onClick={() => claim()}
      disabled={isPending}
      className="w-full card bg-gradient-to-r from-yellow-500/10 to-football/10 border-yellow-500/20 hover:border-football/40 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {isStreakDay30 ? '💫' : isStreakDay7 ? '🔥' : '🎁'}
        </span>
        <div className="text-left">
          <div className="text-sm font-bold text-text-primary">
            {isStreakDay30 ? '30-day streak bonus! +525 ⚡' : isStreakDay7 ? '7-day streak bonus! +125 ⚡' : 'Claim your daily 25 ⚡'}
          </div>
          <div className="text-xs text-text-muted">Day {nextStreak} streak{streak > 0 ? ` · ${streak} days strong` : ''}</div>
        </div>
      </div>
      <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-football text-black">
        {isPending ? 'Claiming...' : 'Claim'}
      </div>
    </button>
  );
}
