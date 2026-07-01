import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SVScoreBreakdown as IBreakdown } from '../../types/user';

interface Props {
  breakdown: IBreakdown;
  history?: { score: number; recordedAt: string }[];
}

const COMPONENTS = [
  { key: 'fantasyScore', label: 'Draft Wars', weight: '30%', tip: 'Percentile rank across all active Draft Wars leagues' },
  { key: 'predictionScore', label: 'Predictions', weight: '25%', tip: 'Correct predictions / total (min 10 needed to activate)' },
  { key: 'credScore', label: 'Cred', weight: '20%', tip: 'Log-scale cred points, capped at 50k' },
  { key: 'breadthScore', label: 'Breadth', weight: '15%', tip: 'Number of sports active in last 30 days' },
  { key: 'consistencyScore', label: 'Consistency', weight: '10%', tip: 'Daily streak capped at 365 days' },
] as const;

export default function SVScoreBreakdown({ breakdown, history = [] }: Props) {
  const chartData = history.slice(0, 30).reverse().map((h, i) => ({
    day: i + 1,
    score: Math.round(h.score),
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {COMPONENTS.map(({ key, label, weight, tip }) => {
          const value = breakdown[key as keyof IBreakdown] as number;
          const pct = Math.round((value / 10000) * 100);
          return (
            <div key={key} className="group">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted flex items-center gap-1">
                  {label}
                  <span className="hidden group-hover:inline text-[9px] text-text-muted/60 ml-1">({tip})</span>
                </span>
                <span className="text-white font-mono font-semibold">{value.toLocaleString()} <span className="text-text-muted">/{weight}</span></span>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-football rounded-full transition-all"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {chartData.length > 1 && (
        <div>
          <p className="text-xs text-text-muted mb-2">30-day SV Score history</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={chartData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Bar dataKey="score" fill="#00E5B4" radius={[2, 2, 0, 0]} />
              <XAxis hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10 }}
                labelStyle={{ display: 'none' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
