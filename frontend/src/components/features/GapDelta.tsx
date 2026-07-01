import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getSportColor } from '../../config/sports';

const data = Array.from({ length: 10 }, (_, i) => ({
  lap: i + 25,
  gap: parseFloat((4.2 - i * 0.1 + Math.sin(i * 0.8) * 0.5).toFixed(2)),
}));

export function GapDelta({ sportId = 'f1' }: { sportId?: string }) {
  const color = getSportColor(sportId);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Gap Delta (last 10 laps)</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
          <XAxis dataKey="lap" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#14151F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}s`, 'Gap']} labelFormatter={(l) => `Lap ${l}`} />
          <Line type="monotone" dataKey="gap" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-2xs text-text-3 text-center mt-1">Gap between P1 and P2 · seconds</p>
    </div>
  );
}
