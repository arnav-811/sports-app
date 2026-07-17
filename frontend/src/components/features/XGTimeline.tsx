import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSportColor } from '../../config/sports';
import { seededRandom } from '../../lib/seededRandom';

function buildShots(sportId: string) {
  const rand = seededRandom(`xg-${sportId}`);
  return Array.from({ length: 24 }, (_, i) => ({
    minute: i * 4 + Math.floor(rand() * 3),
    xg: parseFloat((rand() * 0.6).toFixed(2)),
    team: rand() > 0.5 ? 'home' : 'away',
    isGoal: rand() > 0.88,
  }));
}

export function XGTimeline({ sportId = 'football' }: { sportId?: string }) {
  const color = getSportColor(sportId);
  const shots = useMemo(() => buildShots(sportId), [sportId]);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">xG Timeline</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={shots} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="minute" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 0.8]} />
          <Tooltip
            contentStyle={{ background: '#14151F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }}
            formatter={(val: number) => [val.toFixed(2), 'xG']}
            labelFormatter={(l) => `Min ${l}'`}
          />
          <Bar dataKey="xg" radius={[3, 3, 0, 0]}>
            {shots.map((shot, i) => (
              <Cell key={i} fill={shot.isGoal ? '#FFD700' : shot.team === 'home' ? color : '#FF4444'} opacity={shot.isGoal ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-3 text-2xs text-text-3 justify-center mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: color }} />Home</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" />Away</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400" />Goal</span>
      </div>
    </div>
  );
}
