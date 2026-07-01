import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { LeaderboardEntry } from '../../types/director';

const TIER_COLOR: Record<string, string> = {
  Rookie: '#9CA3AF', Scout: '#3B82F6', Analyst: '#10B981',
  Strategist: '#F97316', Director: '#EF4444', 'Elite Director': '#F59E0B', 'Sporting Legend': '#8B5CF6',
};
const TIER_ICON: Record<string, string> = {
  Rookie: '🌱', Scout: '👁️', Analyst: '📊', Strategist: '♟️',
  Director: '🎯', 'Elite Director': '⭐', 'Sporting Legend': '🏆',
};

type TabType = 'overall' | 'accuracy' | 'returns' | 'contrarian';

export function DirectorLeaderboard() {
  const [tab, setTab] = useState<TabType>('overall');
  const qc = useQueryClient();

  const endpoint = tab === 'accuracy' ? '/director/leaderboard/accuracy'
    : tab === 'returns' ? '/director/leaderboard/returns'
    : tab === 'contrarian' ? '/director/leaderboard/contrarian'
    : '/director/leaderboard';

  const { data, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['director-leaderboard', tab],
    queryFn: () => api.get(endpoint).then(r => r.data),
    staleTime: 60000,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/director/social/follow/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['director-dashboard'] }),
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overall', label: 'Overall' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'returns', label: 'Returns' },
    { key: 'contrarian', label: 'Contrarian' },
  ];

  function getStatForTab(entry: LeaderboardEntry): string {
    if (tab === 'accuracy') return `${(entry.accuracyRate * 100).toFixed(1)}%`;
    if (tab === 'returns') return `${entry.portfolioReturn >= 0 ? '+' : ''}${entry.portfolioReturn.toFixed(1)}%`;
    if (tab === 'contrarian') return `${entry.contrairianWins} wins`;
    return `${entry.reputationScore.toLocaleString()} rep`;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-color)] pb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              tab === t.key ? 'bg-text-1 text-surface-1' : 'text-text-2 hover:text-text-1 hover:bg-surface-3',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-surface-3 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(data || []).map((entry, i) => {
            const rank = entry.rank;
            const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const tierColor = TIER_COLOR[entry.reputationTier] || '#9CA3AF';
            const tierIcon = TIER_ICON[entry.reputationTier] || '🌱';

            return (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-surface-2',
                  rank <= 3 && 'bg-surface-2',
                )}
              >
                <div className="w-8 text-center text-sm font-bold text-text-2">{rankDisplay}</div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: tierColor + '20' }}
                >
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt={entry.username} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <span>{tierIcon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-text-1 truncate">{entry.username}</span>
                    <span className="text-2xs" style={{ color: tierColor }}>{entry.reputationTier}</span>
                  </div>
                  <div className="text-2xs text-text-3">
                    {entry.correctPositions}/{entry.totalPositions} correct
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-text-1">{getStatForTab(entry)}</div>
                </div>
                <button
                  onClick={() => followMutation.mutate(entry.userId)}
                  disabled={followMutation.isPending}
                  className="text-xs text-text-3 hover:text-text-1 border border-[var(--border-color)] rounded-lg px-2 py-1 transition-colors flex-shrink-0"
                >
                  Follow
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
