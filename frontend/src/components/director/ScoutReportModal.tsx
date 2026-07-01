import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { ScoutReport } from '../../types/director';

const REC_CONFIG = {
  strong_hold: { label: 'STRONG HOLD', color: '#10B981', bg: '#10B98120' },
  consider: { label: 'CONSIDER', color: '#22C55E', bg: '#22C55E18' },
  risky: { label: 'RISKY', color: '#F97316', bg: '#F9731618' },
  avoid: { label: 'AVOID', color: '#EF4444', bg: '#EF444418' },
};

const TREND_CONFIG = {
  rising: { label: '📈 Rising', color: '#10B981' },
  falling: { label: '📉 Falling', color: '#EF4444' },
  stable: { label: '→ Stable', color: '#9CA3AF' },
};

interface Props {
  positionId: string;
  subjectName: string;
  onClose: () => void;
}

export function ScoutReportModal({ positionId, subjectName, onClose }: Props) {
  const { data, isLoading, isError } = useQuery<ScoutReport>({
    queryKey: ['scout-report', positionId],
    queryFn: () => api.get(`/director/market/${positionId}/scout-report`).then(r => r.data),
    staleTime: 21600000,
  });

  const rec = data ? REC_CONFIG[data.recommendation] : null;
  const trend = data ? TREND_CONFIG[data.formTrend] : null;

  const recentForm: Array<{ result: string; detail: string; score: string }> = (() => {
    try { return JSON.parse(data?.recentForm || '[]'); } catch { return []; }
  })();

  const keyRisks: string[] = (() => {
    try { return JSON.parse(data?.keyRisks || '[]'); } catch { return []; }
  })();
  const keySupport: string[] = (() => {
    try { return JSON.parse(data?.keySupport || '[]'); } catch { return []; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-1 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface-1 flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div>
            <div className="text-xs text-text-3 mb-0.5">Scout Report</div>
            <div className="text-sm font-bold text-text-1">{subjectName}</div>
          </div>
          <button onClick={onClose} className="text-text-3 hover:text-text-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-surface-3 rounded-xl" />
              <div className="h-8 bg-surface-3 rounded" />
              <div className="h-24 bg-surface-3 rounded-xl" />
            </div>
          )}

          {isError && (
            <div className="text-center py-8 text-text-3">
              <p>Failed to load Scout Report. ⚡ 50 not charged.</p>
            </div>
          )}

          {data && rec && trend && (
            <>
              {/* Recommendation */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: rec.bg }}
              >
                <div>
                  <div className="text-xs text-text-3 mb-0.5">Recommendation</div>
                  <div className="text-base font-bold" style={{ color: rec.color }}>{rec.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-3 mb-0.5">Confidence</div>
                  <div className="text-xl font-bold text-text-1">{data.confidenceScore}%</div>
                </div>
              </div>

              {/* Form trend */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: trend.color }}>{trend.label}</span>
                <span className="text-xs text-text-3">— {data.riskLevel} risk</span>
              </div>

              {/* Recent form dots */}
              {recentForm.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-2 uppercase tracking-wide">Recent Form</div>
                  <div className="flex gap-2 flex-wrap">
                    {recentForm.map((f, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white',
                            f.result === 'W' ? 'bg-emerald-500' : f.result === 'L' ? 'bg-red-500' : 'bg-gray-500',
                          )}
                        >
                          {f.result}
                        </div>
                        <div className="text-2xs text-text-4 text-center max-w-12 truncate">{f.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key factors */}
              <div className="grid grid-cols-2 gap-3">
                {keySupport.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-2xs font-bold text-emerald-400 uppercase">Supporting</div>
                    {keySupport.map((k, i) => (
                      <div key={i} className="text-xs text-text-2 flex gap-1">
                        <span className="text-emerald-400 flex-shrink-0">{i + 1}.</span>{k}
                      </div>
                    ))}
                  </div>
                )}
                {keyRisks.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-2xs font-bold text-red-400 uppercase">Risks</div>
                    {keyRisks.map((k, i) => (
                      <div key={i} className="text-xs text-text-2 flex gap-1">
                        <span className="text-red-400 flex-shrink-0">{i + 1}.</span>{k}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-2xs text-text-4 text-center border-t border-[var(--border-color)] pt-3">
                This Scout Report is yours to reference until the position resolves. Generated {new Date(data.generatedAt).toLocaleDateString()}.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
