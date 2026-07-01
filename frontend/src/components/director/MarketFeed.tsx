import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { AvailablePosition, MarketFilter } from '../../types/director';
import { PositionCard } from './PositionCard';
import { LandscapePanel } from './LandscapePanel';

const SPORT_FILTERS = [
  { id: '', label: 'All', icon: '🌍' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'f1', label: 'F1', icon: '🏎️' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
];

const SPORT_COLORS: Record<string, string> = {
  football: '#00E5B4', tennis: '#C8F135', cricket: '#FFD23F', f1: '#FF0038', badminton: '#FF6B35',
};

const LEVELS = ['', 'speculative', 'calculated', 'conviction'];
const HORIZONS = ['', 'match', 'week', 'month', 'tournament', 'season'];
const SORTS = [
  { key: '', label: 'Closing Soon' },
  { key: 'odds', label: 'Highest Odds' },
  { key: 'contrarian', label: 'Most Contrarian' },
];

export function MarketFeed() {
  const [filter, setFilter] = useState<MarketFilter>({});

  const params = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined && v !== '')
  );

  const { data, isLoading } = useQuery<AvailablePosition[]>({
    queryKey: ['director-market', filter],
    queryFn: () => api.get('/director/market', { params }).then(r => r.data),
    staleTime: 30000,
  });

  // Group by sport
  const groups: Record<string, AvailablePosition[]> = {};
  for (const pos of data || []) {
    const sid = pos.sportId;
    if (!groups[sid]) groups[sid] = [];
    groups[sid].push(pos);
  }

  return (
    <div className="space-y-4">
      {/* Landscape banner */}
      <LandscapePanel />

      {/* Filters */}
      <div className="space-y-2">
        {/* Sport pills */}
        <div className="flex gap-1.5 flex-wrap">
          {SPORT_FILTERS.map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(f => ({ ...f, sportId: s.id || undefined }))}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                filter.sportId === (s.id || undefined)
                  ? 'text-surface-1 font-bold'
                  : 'bg-surface-3 text-text-2 hover:bg-surface-4',
              )}
              style={filter.sportId === (s.id || undefined) ? { backgroundColor: SPORT_COLORS[s.id] || '#6B7280' } : {}}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Second row filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={filter.level || ''}
            onChange={e => setFilter(f => ({ ...f, level: e.target.value || undefined }))}
            className="bg-surface-2 border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-text-2 outline-none"
          >
            <option value="">All Levels</option>
            {LEVELS.slice(1).map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
          </select>

          <select
            value={filter.timeHorizon || ''}
            onChange={e => setFilter(f => ({ ...f, timeHorizon: e.target.value || undefined }))}
            className="bg-surface-2 border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-text-2 outline-none"
          >
            <option value="">All Horizons</option>
            {HORIZONS.slice(1).map(h => <option key={h} value={h} className="capitalize">{h}</option>)}
          </select>

          <div className="flex gap-1 ml-auto">
            {SORTS.map(s => (
              <button
                key={s.key}
                onClick={() => setFilter(f => ({ ...f, sort: (s.key as MarketFilter['sort']) || undefined }))}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs transition-colors',
                  filter.sort === (s.key || undefined)
                    ? 'text-text-1 bg-surface-3'
                    : 'text-text-3 hover:text-text-2',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 h-40 animate-pulse bg-surface-3" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="card p-8 text-center text-text-3">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm">No positions match your filters right now.</p>
          <button onClick={() => setFilter({})} className="text-xs text-text-3 hover:text-text-1 mt-2 underline">
            Clear filters
          </button>
        </div>
      ) : filter.sportId ? (
        <div className="space-y-3">
          {(data || []).map(pos => <PositionCard key={pos.id} position={pos} />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([sportId, positions]) => {
            const sport = positions[0]?.sport;
            return (
              <div key={sportId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{sport?.icon}</span>
                  <h3 className="text-sm font-bold" style={{ color: sport?.color }}>{sport?.name}</h3>
                  <span className="text-xs text-text-3">{positions.length} positions</span>
                </div>
                <div className="space-y-3">
                  {positions.map(pos => <PositionCard key={pos.id} position={pos} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
