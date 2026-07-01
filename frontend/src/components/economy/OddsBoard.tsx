import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { getSportColor } from '../../config/sports';

interface OddsOption {
  id: string;
  label: string;
  currentOdds: number;
  percentage: number;
}

interface OddsBoard {
  id: string;
  question: string;
  options: OddsOption[];
  status: string;
}

interface Props { matchId: string; sportId?: string }

export default function OddsBoard({ matchId, sportId = 'football' }: Props) {
  const color = getSportColor(sportId);

  const { data } = useQuery({
    queryKey: ['odds-board', matchId],
    queryFn: () => api.get(`/odds/match/${matchId}`).then(r => r.data),
    refetchInterval: 30000,
  });

  const boards: OddsBoard[] = data?.boards || [];

  if (boards.length === 0) return null;

  return (
    <div className="card space-y-3" style={{ borderLeftColor: color, borderLeftWidth: 2 }}>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
        <span className="text-xs font-bold text-text-primary">Live Odds</span>
      </div>

      <div className="space-y-3">
        {boards.map(board => (
          <div key={board.id}>
            <p className="text-[10px] text-text-muted mb-1.5 leading-tight">{board.question}</p>
            <div className="space-y-1">
              {board.options.map(opt => (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-text-primary truncate">{opt.label}</span>
                    <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${opt.percentage}%`, background: color + '60' }} />
                    </div>
                    <span className="text-[9px] text-text-muted flex-shrink-0">{opt.percentage}%</span>
                  </div>
                  <span className="text-xs font-bold font-mono flex-shrink-0" style={{ color }}>{opt.currentOdds}×</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
