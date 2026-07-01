import React from 'react';
import type { ReputationDetails } from '../../types/director';

const TIER_UNLOCKS: Record<string, string[]> = {
  Rookie: ['Basic market access', '3 positions max simultaneously'],
  Scout: ['5 positions max', 'See community hold percentages'],
  Analyst: ['8 positions max', 'Access to Scout Reports (50 ⚡)'],
  Strategist: ['12 positions max', 'Access to Contrarian Finder (100 ⚡)'],
  Director: ['Unlimited positions', 'Early Intel access (free tier)'],
  'Elite Director': ['Custom odds on Conviction positions', 'Priority position access'],
  'Sporting Legend': ['Featured on all users\' Following Feed', 'Permanent legacy badge'],
};

interface Props {
  reputation: ReputationDetails;
}

export function ReputationCard({ reputation }: Props) {
  const { current, next, progressToNext, score } = reputation;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: current.color + '20' }}
        >
          {current.icon}
        </div>
        <div>
          <div className="font-bold text-base" style={{ color: current.color }}>
            {current.name}
          </div>
          <div className="text-xs text-text-3">
            {score.toLocaleString()} reputation points
          </div>
        </div>
      </div>

      {next && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-text-3">{current.name}</span>
            <span className="text-text-3">{next.name} — {next.minScore.toLocaleString()} rep</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, progressToNext)}%`, backgroundColor: current.color }}
            />
          </div>
          <div className="text-2xs text-text-3 text-right">
            {Math.round(progressToNext)}% to {next.name}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="text-2xs font-bold text-text-3 uppercase tracking-wider">Your tier unlocks</div>
        {(TIER_UNLOCKS[current.name] || []).map(u => (
          <div key={u} className="flex items-center gap-1.5 text-xs text-text-2">
            <span className="text-emerald-400">✓</span>
            {u}
          </div>
        ))}
        {next && (
          <>
            <div className="text-2xs font-bold text-text-3 uppercase tracking-wider mt-2">
              Unlock at {next.name}
            </div>
            {(TIER_UNLOCKS[next.name] || []).map(u => (
              <div key={u} className="flex items-center gap-1.5 text-xs text-text-3">
                <span className="text-text-4">○</span>
                {u}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
