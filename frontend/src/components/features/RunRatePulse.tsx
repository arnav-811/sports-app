import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getSportColor } from '../../config/sports';

const data = Array.from({ length: 20 }, (_, i) => ({
  over: i + 1,
  actual: parseFloat((6 + Math.sin(i * 0.5) * 3 + Math.random() * 2).toFixed(1)),
  required: parseFloat((9.8 - i * 0.1).toFixed(1)),
}));

export function RunRatePulse({ sportId = 'cricket' }: { sportId?: string }) {
  const color = getSportColor(sportId);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Run Rate Pulse</h3>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
          <XAxis dataKey="over" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#14151F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }} />
          {/* Phase bands */}
          <ReferenceLine x={6} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 2" label={{ value: 'PP', fill: 'rgba(255,255,255,0.3)', fontSize: 8, position: 'top' }} />
          <ReferenceLine x={15} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 2" label={{ value: 'Death', fill: 'rgba(255,255,255,0.3)', fontSize: 8, position: 'top' }} />
          <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="required" stroke="#FF4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center text-2xs text-text-3 mt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: color }} />Actual RR</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" />Required RR</span>
      </div>
    </div>
  );
}
