import React, { useState } from 'react';
import { SportPassport, SportStamp } from '../../types/user';
import { SPORTS } from '../../config/sports';

interface Props {
  passport: SportPassport | null;
  compact?: boolean;
  onStampClick?: (stamp: SportStamp) => void;
}

function getStampStyle(level: number, color: string) {
  const styles = [
    { bg: '#1e293b', border: '#374151', text: '#6B7280', dash: true },
    { bg: `${color}15`, border: color, text: color, dash: false },
    { bg: `${color}20`, border: color, text: color, dash: false },
    { bg: `${color}30`, border: color, text: color, dash: false },
    { bg: `${color}40`, border: color, text: '#FFD700', dash: false, shimmer: true },
  ];
  return styles[Math.min(level, 4)];
}

function StampHex({ stamp, sport, compact, onClick }: {
  stamp?: SportStamp; sport: typeof SPORTS[0]; compact: boolean; onClick?: () => void
}) {
  const level = stamp?.level || 0;
  const xp = stamp?.xp || 0;
  const style = getStampStyle(level, sport.color);
  const size = compact ? 36 : 64;
  const pct = stamp ? Math.min(100, ((xp - [0, 100, 500, 1500, 4000][level] || 0) / ([100, 500, 1500, 4000, Infinity][level] - [0, 100, 500, 1500, 4000][level] || 1)) * 100) : 0;

  return (
    <div className="group relative flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <svg width={size} height={size * 1.1} viewBox="0 0 100 115">
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill={style.bg}
          stroke={style.border}
          strokeWidth={style.dash ? 2 : 2.5}
          strokeDasharray={style.dash ? '6,3' : undefined}
          style={style.shimmer ? { filter: 'drop-shadow(0 0 6px #FFD700)' } : undefined}
        />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="middle"
          fontSize={compact ? 24 : 30} style={{ userSelect: 'none' }}>
          {sport.icon}
        </text>
        {!compact && (
          <text x="50" y="76" textAnchor="middle" fontSize={9} fill={style.text}>
            {stamp?.levelName || 'Casual'}
          </text>
        )}
        {!compact && pct > 0 && (
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="none"
            stroke={sport.color}
            strokeWidth={2}
            strokeDasharray={`${(pct / 100) * 360} 360`}
            opacity={0.4}
          />
        )}
      </svg>
      {!compact && (
        <span className="text-[9px] text-text-muted text-center">{sport.shortName}</span>
      )}
      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-surface-2 border border-white/10 rounded px-2 py-1 text-[10px] whitespace-nowrap z-50 text-text-secondary">
        {sport.name}: {stamp?.levelName || 'Casual'} ({xp} XP)
      </div>
    </div>
  );
}

export default function SportPassportDisplay({ passport, compact = false, onStampClick }: Props) {
  const stamps = passport?.stamps || [];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {SPORTS.map(sport => {
          const stamp = stamps.find(s => s.sportId === sport.id);
          return <StampHex key={sport.id} stamp={stamp} sport={sport} compact onClick={() => onStampClick?.(stamp!)} />;
        })}
      </div>
    );
  }

  return (
    <div className="card bg-[#0f172a] border-[#1e3a5f]">
      <div className="text-center mb-4">
        <div className="inline-block px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 text-[10px] font-bold tracking-widest mb-1">
          SPORTVERSE PASSPORT
        </div>
        <p className="text-xs text-text-muted">Your journey across 5 sports</p>
      </div>
      <div className="flex justify-center gap-3 flex-wrap">
        {SPORTS.map(sport => {
          const stamp = stamps.find(s => s.sportId === sport.id);
          return <StampHex key={sport.id} stamp={stamp} sport={sport} compact={false} onClick={() => onStampClick?.(stamp!)} />;
        })}
      </div>
      {stamps.filter(s => s.level >= 2).length === 5 && (
        <div className="mt-4 text-center text-[10px] text-yellow-400 font-bold">
          ✦ Pentasport — Active in all 5 sports ✦
        </div>
      )}
    </div>
  );
}
