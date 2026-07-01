import React from 'react';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getTier(score: number) {
  if (score >= 9501) return { name: 'Legend', color: '#FFD700', isLegend: true };
  if (score >= 8001) return { name: 'Elite', color: '#FF0038', isLegend: false };
  if (score >= 6001) return { name: 'Expert', color: '#FFD23F', isLegend: false };
  if (score >= 4001) return { name: 'Enthusiast', color: '#00E5B4', isLegend: false };
  if (score >= 2001) return { name: 'Fan', color: '#3B82F6', isLegend: false };
  return { name: 'Getting Started', color: '#6B7280', isLegend: false };
}

const SIZES = {
  sm: { ring: 32, stroke: 3, font: 'text-[9px]', label: 'text-[8px]' },
  md: { ring: 48, stroke: 4, font: 'text-xs', label: 'text-[10px]' },
  lg: { ring: 96, stroke: 6, font: 'text-xl', label: 'text-xs' },
};

export default function SVScoreDisplay({ score, size = 'md', showLabel = false }: Props) {
  const tier = getTier(score);
  const cfg = SIZES[size];
  const r = (cfg.ring - cfg.stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 10000) * circumference;
  const cx = cfg.ring / 2;

  return (
    <div className="flex flex-col items-center gap-0.5 group relative">
      <svg width={cfg.ring} height={cfg.ring}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth={cfg.stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={tier.color}
          strokeWidth={cfg.stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={tier.isLegend ? { filter: 'drop-shadow(0 0 4px #FFD700)' } : undefined}
        />
        <text x={cx} y={cx + 1} textAnchor="middle" dominantBaseline="middle"
          fill={tier.color} className={`${cfg.font} font-mono font-bold`}
          style={{ fontSize: size === 'lg' ? 18 : size === 'md' ? 11 : 8 }}>
          {Math.round(score)}
        </text>
      </svg>
      {showLabel && (
        <span className={`${cfg.label} font-semibold`} style={{ color: tier.color }}>
          {tier.name}
        </span>
      )}
      <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-surface-2 border border-white/10 rounded px-2 py-1 text-[10px] text-text-muted whitespace-nowrap z-50">
        SV Score: {Math.round(score)} — {tier.name}
      </div>
    </div>
  );
}
