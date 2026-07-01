import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';

interface LandscapeData {
  summary: string;
  sports: Record<string, {
    event: string;
    positions: number;
    highlight: string;
  }>;
}

const SPORT_META: Record<string, { icon: string; color: string; label: string }> = {
  football: { icon: '⚽', color: '#00E5B4', label: 'Football' },
  tennis: { icon: '🎾', color: '#C8F135', label: 'Tennis' },
  cricket: { icon: '🏏', color: '#FFD23F', label: 'Cricket' },
  f1: { icon: '🏎️', color: '#FF0038', label: 'F1' },
  badminton: { icon: '🏸', color: '#FF6B35', label: 'Badminton' },
};

interface Props {
  compact?: boolean;
}

export function LandscapePanel({ compact }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery<LandscapeData>({
    queryKey: ['director-landscape'],
    queryFn: () => api.get('/director/market/landscape').then(r => r.data),
    staleTime: 300000,
  });

  if (!data) return null;

  const totalPositions = Object.values(data.sports).reduce((sum, s) => sum + s.positions, 0);

  if (compact) {
    return (
      <div className="card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🌍</span>
            <span className="text-xs font-bold text-text-1">This Week's Landscape</span>
          </div>
          <span className="text-xs text-text-3">{totalPositions} positions</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(data.sports).map(([sportId, sport]) => {
            const meta = SPORT_META[sportId];
            if (!meta) return null;
            return (
              <span key={sportId} className="text-xs" style={{ color: meta.color }}>
                {meta.icon}{sport.positions}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span className="text-sm font-bold text-text-1">This Week's Sporting Landscape</span>
          </div>
          <p className="text-xs text-text-3 mt-0.5">{data.summary}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="flex gap-2">
            {Object.entries(data.sports).map(([sportId, sport]) => {
              const meta = SPORT_META[sportId];
              if (!meta) return null;
              return (
                <span key={sportId} className="text-xs font-medium" style={{ color: meta.color }}>
                  {meta.icon} {sport.positions}
                </span>
              );
            })}
          </div>
          {expanded ? <ChevronUp size={16} className="text-text-3" /> : <ChevronDown size={16} className="text-text-3" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]">
          {Object.entries(data.sports).map(([sportId, sport]) => {
            const meta = SPORT_META[sportId];
            if (!meta) return null;
            return (
              <div key={sportId} className="p-4 flex items-start gap-3">
                <span className="text-xl mt-0.5">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold" style={{ color: meta.color }}>{sport.event}</div>
                  <div className="text-xs text-text-3 mt-0.5">{sport.positions} positions open</div>
                  <div className="text-xs text-text-2 mt-1 italic">"{sport.highlight}"</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
