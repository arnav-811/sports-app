import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import { useSportStore } from '../store/sportStore';
import { getSportColor } from '../config/sports';
import { BarChart2, TrendingUp, Activity } from 'lucide-react';

export default function ScoutRoomPage() {
  const { activeSport } = useSportStore();
  const color = getSportColor(activeSport);

  const { data: leaderboard } = useQuery({
    queryKey: ['sv-leaderboard'],
    queryFn: () => api.get('/users/sv-leaderboard').then(r => r.data),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Scout Room</h1>
          <p className="text-sm text-text-muted">Fan intelligence, SV Score leaderboard, and community analytics</p>
        </div>
        <BarChart2 className="w-6 h-6" style={{ color }} />
      </div>

      {/* SV Score Global Leaderboard */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color }} />
          <h2 className="text-sm font-bold text-text-primary">Global SV Score Leaders</h2>
        </div>
        <div className="space-y-2">
          {leaderboard?.leaders?.map((entry: { rank: number; username: string; displayName?: string; svScore: number; tier: string; tierColor: string }, i: number) => (
            <div key={entry.username} className="flex items-center gap-3 py-1.5">
              <div className="w-6 text-center text-xs font-mono font-bold text-text-muted">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-text-primary">{entry.displayName || entry.username}</span>
                <span className="text-[10px] text-text-muted ml-2">@{entry.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: entry.tierColor + '20', color: entry.tierColor }}>
                  {entry.tier}
                </span>
                <span className="text-sm font-black font-mono" style={{ color: entry.tierColor }}>
                  {entry.svScore.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {!leaderboard && (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-surface-2 rounded animate-pulse" />)}
            </div>
          )}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color }} />
            <h3 className="text-xs font-bold text-text-secondary">Community Pulse</h3>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Active debates', value: leaderboard?.stats?.activeDebates || '—' },
              { label: 'Takes today', value: leaderboard?.stats?.takesToday || '—' },
              { label: 'Active fans', value: leaderboard?.stats?.activeFans || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-text-muted">{label}</span>
                <span className="font-bold font-mono text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xs font-bold text-text-secondary mb-2">Your Rank</h3>
          {leaderboard?.myRank ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Rank</span>
                <span className="font-bold font-mono" style={{ color }}># {leaderboard.myRank.rank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Top</span>
                <span className="font-bold font-mono" style={{ color }}>{leaderboard.myRank.percentile?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">SV Score</span>
                <span className="font-bold font-mono" style={{ color }}>{leaderboard.myRank.score?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted">Log in to see your rank</p>
          )}
        </div>
      </div>
    </div>
  );
}
