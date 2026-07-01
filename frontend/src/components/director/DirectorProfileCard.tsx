import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { DirectorProfile, ReputationDetails } from '../../types/director';

const TIER_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
  Rookie: { color: '#9CA3AF', icon: '🌱', bg: '#9CA3AF18' },
  Scout: { color: '#3B82F6', icon: '👁️', bg: '#3B82F618' },
  Analyst: { color: '#10B981', icon: '📊', bg: '#10B98118' },
  Strategist: { color: '#F97316', icon: '♟️', bg: '#F9731618' },
  Director: { color: '#EF4444', icon: '🎯', bg: '#EF444418' },
  'Elite Director': { color: '#F59E0B', icon: '⭐', bg: '#F59E0B18' },
  'Sporting Legend': { color: '#8B5CF6', icon: '🏆', bg: '#8B5CF618' },
};

interface Props {
  profile: DirectorProfile;
  reputation?: ReputationDetails;
  compact?: boolean;
  username?: string;
}

export function DirectorProfileCard({ profile, reputation, compact, username }: Props) {
  const tier = TIER_CONFIG[profile.reputationTier] || TIER_CONFIG.Rookie;
  const accuracy = profile.totalPositions > 0
    ? ((profile.correctPositions / profile.totalPositions) * 100).toFixed(1)
    : '0.0';

  if (compact) {
    return (
      <div className="card p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.icon}</span>
          <div>
            <div className="text-xs font-bold" style={{ color: tier.color }}>{profile.reputationTier}</div>
            <div className="text-2xs text-text-3">⚡ {profile.reputationScore.toLocaleString()} rep</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs font-bold text-text-1">⚡ {profile.portfolioValue.toLocaleString()}</div>
            <div className="text-2xs text-text-3">portfolio</div>
          </div>
        </div>
        {reputation && (
          <div className="space-y-1">
            <div className="flex justify-between text-2xs text-text-3">
              <span>{reputation.current.name}</span>
              {reputation.next && <span>{reputation.next.name}</span>}
            </div>
            <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, reputation.progressToNext)}%`, backgroundColor: tier.color }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: tier.bg }}>
          {tier.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-1 text-sm" style={{ color: tier.color }}>{profile.reputationTier}</span>
          </div>
          <div className="text-xs text-text-3">⚡ {profile.reputationScore.toLocaleString()} rep · {profile.followersCount} followers</div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-text-1">⚡ {profile.portfolioValue.toLocaleString()}</div>
          <div className="text-2xs text-text-3">total portfolio</div>
        </div>
      </div>

      {reputation && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-3">
            <span>{reputation.current.name}</span>
            {reputation.next && <span>{reputation.next.name} ({reputation.next.minScore.toLocaleString()} rep)</span>}
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, reputation.progressToNext)}%`, backgroundColor: tier.color }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-text-1">{accuracy}%</div>
          <div className="text-2xs text-text-3">accuracy</div>
        </div>
        <div>
          <div className={cn('text-sm font-bold', profile.currentStreak > 0 ? 'text-emerald-400' : 'text-text-2')}>
            {profile.currentStreak}{profile.currentStreak > 0 ? ' 🔥' : ''}
          </div>
          <div className="text-2xs text-text-3">streak</div>
        </div>
        <div>
          <div className="text-sm font-bold text-text-1">{profile.totalPositions}</div>
          <div className="text-2xs text-text-3">positions</div>
        </div>
      </div>

      {username && (
        <Link to={`/fancard/${username}`} className="block text-center text-xs text-text-3 hover:text-text-2 transition-colors">
          View Full Stats →
        </Link>
      )}
    </div>
  );
}
