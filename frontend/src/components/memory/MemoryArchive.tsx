import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { Clock, CheckCircle, XCircle, Minus } from 'lucide-react';
import { SPORT_MAP } from '../../config/sports';

interface MatchMemory {
  id: string;
  matchId: string;
  predictionAtKickoff: string | null;
  actualResult: string | null;
  predictionCorrect: boolean | null;
  fantasyScore: number | null;
  debateResult: string | null;
  svScoreAtTime: number | null;
  notes: string | null;
  createdAt: string;
}

export default function MemoryArchive() {
  const { data, isLoading } = useQuery<{ memories: MatchMemory[] }>({
    queryKey: ['memory-archive'],
    queryFn: () => api.get('/memories/archive').then(r => r.data),
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface-2 rounded-xl animate-pulse" />)}
    </div>
  );

  const memories = data?.memories || [];

  if (!memories.length) return (
    <div className="text-center py-12 text-text-muted">
      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">Your match archive is empty — start following live matches to build it up.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {memories.map(m => (
        <div key={m.id} className="card group cursor-pointer hover:border-white/20 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-text-muted">
                  {new Date(m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {m.actualResult && (
                  <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-text-secondary">{m.actualResult}</span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {m.predictionCorrect !== null && (
                  <span className={`flex items-center gap-1 text-[11px] ${m.predictionCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {m.predictionCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {m.predictionCorrect ? 'Prediction correct' : 'Prediction wrong'}
                  </span>
                )}
                {m.fantasyScore !== null && (
                  <span className="text-[11px] text-football">⚡ {m.fantasyScore} Draft Pts</span>
                )}
                {m.debateResult && (
                  <span className={`text-[11px] ${m.debateResult === 'won' ? 'text-green-400' : 'text-text-muted'}`}>
                    Debate: {m.debateResult}
                  </span>
                )}
              </div>

              {m.notes && (
                <p className="text-xs text-text-muted italic mt-1">"{m.notes}"</p>
              )}
            </div>

            {m.svScoreAtTime !== null && (
              <div className="text-right shrink-0">
                <div className="text-[10px] text-text-muted">SV Score then</div>
                <div className="text-sm font-mono font-bold text-text-secondary">{Math.round(m.svScoreAtTime)}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
