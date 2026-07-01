import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../../config/api';
import { cn, timeAgo } from '../../lib/utils';
import type { AvailablePosition } from '../../types/director';
import { TakePositionModal } from './TakePositionModal';
import { ScoutReportModal } from './ScoutReportModal';

const LEVEL_COLORS: Record<string, string> = {
  speculative: '#F97316',
  calculated: '#3B82F6',
  conviction: '#10B981',
};

const LEVEL_BG: Record<string, string> = {
  speculative: '#F9731618',
  calculated: '#3B82F618',
  conviction: '#10B98118',
};

function timeUntil(dateStr: string): string {
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms <= 0) return 'Closed';
  const h = Math.floor(ms / 3600000);
  if (h < 24) return `${h}h left`;
  const d = Math.floor(h / 24);
  return `${d}d left`;
}

interface Props {
  position: AvailablePosition;
  isHeld?: boolean;
}

export function PositionCard({ position, isHeld }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showTake, setShowTake] = useState(false);
  const [showScout, setShowScout] = useState(false);

  const riskFactors: string[] = (() => {
    try { return JSON.parse(position.riskFactors); } catch { return []; }
  })();
  const supportFactors: string[] = (() => {
    try { return JSON.parse(position.supportFactors); } catch { return []; }
  })();

  const holdPct = position.holdersCount > 0
    ? Math.round((position.holdersCount / (position.holdersCount + 20)) * 100)
    : Math.round(Math.random() * 60 + 10);
  const isContrarian = holdPct < 15;
  const closed = !position.isActive || new Date(position.closesAt) < new Date();

  const levelColor = LEVEL_COLORS[position.level] || '#9CA3AF';

  return (
    <>
      <div
        className={cn(
          'card overflow-hidden transition-all',
          position.isEarlyIntel && 'ring-1 ring-yellow-500/50',
          closed && 'opacity-60',
        )}
        style={{ borderLeft: `3px solid ${position.sport?.color || '#555'}` }}
      >
        {/* Top row */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-text-3 mb-2">
            <span>{position.sport?.icon}</span>
            <span className="capitalize">{position.timeHorizon}</span>
            {position.isEarlyIntel && (
              <span className="ml-auto text-xs font-bold text-yellow-400">⚡ Early Intel</span>
            )}
            <span className={cn('ml-auto', !position.isEarlyIntel && 'ml-auto')} style={{ color: new Date(position.closesAt) < new Date(Date.now() + 3600000) ? '#EF4444' : '' }}>
              <Clock size={11} className="inline mr-0.5" />
              {timeUntil(position.closesAt)}
            </span>
          </div>

          <p className="text-sm font-bold text-text-1 leading-snug mb-2">{position.claim}</p>
          <p className="text-xs text-text-3 mb-3">{position.subjectName} · {position.realWorldContext?.slice(0, 60)}</p>

          {/* Odds row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-mono font-bold text-text-1">{position.currentOdds.toFixed(2)}×</div>
              <div className="text-xs text-text-3">
                ⚡ 100 → win ⚡ {Math.round(position.currentOdds * 100).toLocaleString()}
              </div>
            </div>
            <div className="flex-1 max-w-32">
              <div className="flex justify-between text-2xs text-text-3 mb-1">
                <span>{holdPct}% holding</span>
                {isContrarian && <span className="text-red-400 font-bold">Contrarian 🎯</span>}
              </div>
              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${holdPct}%`,
                    backgroundColor: isContrarian ? '#EF4444' : (position.sport?.color || '#555'),
                  }}
                />
              </div>
              <div className="text-2xs text-text-3 mt-1">{position.holdersCount} directors holding</div>
            </div>
          </div>

          {/* Level + actions */}
          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ color: levelColor, backgroundColor: LEVEL_BG[position.level] }}
            >
              {position.level}
            </span>
            {riskFactors.length > 0 && <AlertTriangle size={12} className="text-yellow-400" />}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowScout(true)}
                className="text-xs text-text-3 hover:text-text-2 transition-colors border border-[var(--border-color)] rounded-lg px-2 py-1"
              >
                Scout ⚡ 50
              </button>
              {!closed && !isHeld && (
                <button
                  onClick={() => setShowTake(true)}
                  className="text-xs font-bold text-white rounded-lg px-3 py-1 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: position.sport?.color || '#555' }}
                >
                  Take Position
                </button>
              )}
              {isHeld && (
                <span className="text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded-lg px-2 py-1">
                  ✓ Holding
                </span>
              )}
              <button onClick={() => setExpanded(!expanded)} className="text-text-3 hover:text-text-1">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-[var(--border-color)] p-4 space-y-3 bg-surface-2/50">
            <div className="grid grid-cols-2 gap-3">
              {supportFactors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-2xs font-bold text-emerald-400 uppercase">Supporting</div>
                  {supportFactors.map((f, i) => (
                    <div key={i} className="text-xs text-text-2 flex gap-1">
                      <span className="text-emerald-400 flex-shrink-0">🟢</span>{f}
                    </div>
                  ))}
                </div>
              )}
              {riskFactors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-2xs font-bold text-red-400 uppercase">Risks</div>
                  {riskFactors.map((f, i) => (
                    <div key={i} className="text-xs text-text-2 flex gap-1">
                      <span className="text-red-400 flex-shrink-0">🔴</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-text-3">
              <span className="font-medium">Context:</span> {position.realWorldContext}
            </div>
            <div className="text-xs text-text-3">
              ⚡ {position.totalStaked.toLocaleString()} total staked · min stake ⚡ {position.minStake}
            </div>
            {!closed && !isHeld && (
              <button
                onClick={() => setShowTake(true)}
                className="w-full py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: position.sport?.color || '#555' }}
              >
                Take Position
              </button>
            )}
          </div>
        )}
      </div>

      {showTake && <TakePositionModal position={position} onClose={() => setShowTake(false)} />}
      {showScout && <ScoutReportModal positionId={position.id} subjectName={position.subjectName} onClose={() => setShowScout(false)} />}
    </>
  );
}
