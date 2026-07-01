import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import type { DirectorDashboard } from '../types/director';
import { DirectorProfileCard } from '../components/director/DirectorProfileCard';
import { IntelligenceNetworkDisplay } from '../components/director/IntelligenceNetworkDisplay';
import { PortfolioSummary } from '../components/director/PortfolioSummary';
import { MarketFeed } from '../components/director/MarketFeed';
import { OpenPositionCard } from '../components/director/OpenPositionCard';
import { PositionHistoryTable } from '../components/director/PositionHistoryTable';
import { IntelligenceAlertCenter } from '../components/director/IntelligenceAlertCenter';
import { DirectorLeaderboard } from '../components/director/DirectorLeaderboard';
import { ReputationCard } from '../components/director/ReputationCard';

type Tab = 'market' | 'portfolio' | 'history' | 'intelligence' | 'leaderboard';

const TABS: { key: Tab; label: string }[] = [
  { key: 'market', label: 'The Market' },
  { key: 'portfolio', label: 'My Portfolio' },
  { key: 'history', label: 'History' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'leaderboard', label: 'Leaderboard' },
];

export default function SportingDirectorPage() {
  const [tab, setTab] = useState<Tab>('market');

  const { data, isLoading } = useQuery<DirectorDashboard>({
    queryKey: ['director-dashboard'],
    queryFn: () => api.get('/director/dashboard').then(r => r.data),
    staleTime: 30000,
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-10 bg-surface-3 rounded-xl w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4">
          <div className="h-64 bg-surface-3 rounded-xl" />
          <div className="h-64 bg-surface-3 rounded-xl" />
          <div className="h-64 bg-surface-3 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="text-2xl">🎯</div>
        <div>
          <h1 className="text-xl font-bold text-text-1">The Sporting Director</h1>
          <p className="text-xs text-text-3">Real-world connected strategy — take positions on outcomes across sport</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-3">{data.profile.reputationTier}</span>
          <span className="text-xs font-bold text-text-1">⚡ {data.portfolio.totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4 items-start">
        {/* Left: profile + intel network */}
        <div className="space-y-3 lg:sticky lg:top-4">
          <DirectorProfileCard
            profile={data.profile}
            reputation={data.reputation}
          />
          <IntelligenceNetworkDisplay network={data.profile.intelligenceNetwork} />
          <ReputationCard reputation={data.reputation} />
        </div>

        {/* Center: tabbed content */}
        <div className="space-y-4 min-w-0">
          {/* Tab nav */}
          <div className="flex gap-1 border-b border-[var(--border-color)] pb-3 overflow-x-auto no-scrollbar">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'bg-text-1 text-surface-1'
                    : 'text-text-2 hover:text-text-1 hover:bg-surface-3'
                }`}
              >
                {t.label}
                {t.key === 'intelligence' && data.alerts.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-2xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                    {data.alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'market' && <MarketFeed />}

          {tab === 'portfolio' && (
            <div className="space-y-3">
              {data.openPositions.length === 0 ? (
                <div className="card p-8 text-center text-text-3">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm font-medium text-text-2 mb-1">No open positions</p>
                  <p className="text-xs">Go to The Market to take your first position.</p>
                  <button onClick={() => setTab('market')} className="mt-3 text-xs underline text-text-3 hover:text-text-1">
                    Browse The Market →
                  </button>
                </div>
              ) : (
                data.openPositions.map(pos => <OpenPositionCard key={pos.id} position={pos} />)
              )}
            </div>
          )}

          {tab === 'history' && (
            <PositionHistoryTable positions={data.closedPositions} />
          )}

          {tab === 'intelligence' && (
            <IntelligenceAlertCenter alerts={data.alerts} />
          )}

          {tab === 'leaderboard' && <DirectorLeaderboard />}
        </div>

        {/* Right: portfolio summary + alerts */}
        <div className="space-y-3 lg:sticky lg:top-4">
          <PortfolioSummary />

          {data.alerts.length > 0 && (
            <div className="card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-1">⚡ Alerts</span>
                <span className="text-2xs text-red-400 font-medium">{data.alerts.length} unread</span>
              </div>
              {data.alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-xs text-text-2 border-l-2 border-red-500 pl-2">
                  {alert.message.slice(0, 60)}…
                </div>
              ))}
              <button
                onClick={() => setTab('intelligence')}
                className="text-2xs text-text-3 hover:text-text-1 transition-colors"
              >
                View all alerts →
              </button>
            </div>
          )}

          {/* Quick stats */}
          <div className="card p-3 space-y-2">
            <div className="text-xs font-bold text-text-1">Quick Stats</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Accuracy', value: `${(data.profile.accuracyRate * 100).toFixed(1)}%` },
                { label: 'Streak', value: `${data.profile.currentStreak} 🔥` },
                { label: 'Best Win', value: `⚡ ${data.profile.biggestWin.toLocaleString()}` },
                { label: 'Contrarian', value: `${data.profile.contrairianWins} wins` },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xs text-text-3">{stat.label}</div>
                  <div className="text-xs font-bold text-text-1">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Following */}
          {data.following.length > 0 && (
            <div className="card p-3 space-y-2">
              <div className="text-xs font-bold text-text-1">Following ({data.following.length})</div>
              <div className="space-y-1">
                {data.following.slice(0, 5).map(dir => (
                  <div key={dir.id} className="flex items-center gap-2 text-xs text-text-2">
                    <span className="w-5 h-5 bg-surface-3 rounded-full flex items-center justify-center text-2xs">🎯</span>
                    <span className="truncate">{dir.reputationTier}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
