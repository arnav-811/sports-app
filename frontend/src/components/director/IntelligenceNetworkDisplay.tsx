import React from 'react';

const SPORT_META: Record<string, { icon: string; label: string; color: string }> = {
  football: { icon: '⚽', label: 'Football', color: '#00E5B4' },
  tennis: { icon: '🎾', label: 'Tennis', color: '#C8F135' },
  cricket: { icon: '🏏', label: 'Cricket', color: '#FFD23F' },
  f1: { icon: '🏎️', label: 'Formula One', color: '#FF0038' },
  badminton: { icon: '🏸', label: 'Badminton', color: '#FF6B35' },
};

function getTierLabel(score: number) {
  if (score >= 81) return { label: 'Authority', color: '#EF4444' };
  if (score >= 61) return { label: 'Expert', color: '#F97316' };
  if (score >= 41) return { label: 'Student', color: '#10B981' };
  if (score >= 21) return { label: 'Follower', color: '#3B82F6' };
  return { label: 'Novice', color: '#9CA3AF' };
}

interface Props {
  network: Record<string, number>;
}

export function IntelligenceNetworkDisplay({ network }: Props) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">🧠</span>
        <span className="text-xs font-bold text-text-1">Intelligence Network</span>
      </div>
      <div className="space-y-2">
        {Object.entries(SPORT_META).map(([sportId, meta]) => {
          const score = network[sportId] ?? 0;
          const tier = getTierLabel(score);
          return (
            <div key={sportId} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span>{meta.icon}</span>
                  <span className="text-text-2">{meta.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xs font-medium" style={{ color: tier.color }}>{tier.label}</span>
                  <span className="text-2xs text-text-3">{score}</span>
                </div>
              </div>
              <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${score}%`, backgroundColor: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-2xs text-text-3">Win more positions in a sport to raise its score. Higher scores give slightly better odds.</p>
    </div>
  );
}
