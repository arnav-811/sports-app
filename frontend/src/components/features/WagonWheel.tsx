import { getSportColor } from '../../config/sports';

interface Shot { angle: number; distance: number; runs: number }

function randomShots(n: number): Shot[] {
  return Array.from({ length: n }, () => ({
    angle: Math.random() * 360,
    distance: 0.3 + Math.random() * 0.65,
    runs: [0, 1, 2, 3, 4, 6][Math.floor(Math.random() * 6)],
  }));
}

const SHOTS = randomShots(35);

export function WagonWheel({ sportId = 'cricket' }: { sportId?: string }) {
  const color = getSportColor(sportId);
  const cx = 100, cy = 100, maxR = 85;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Wagon Wheel</h3>
      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Field circles */}
          {[30, 55, 80].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" strokeDasharray="3 2" />)}
          {/* Shots */}
          {SHOTS.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const x = cx + s.distance * maxR * Math.sin(rad);
            const y = cy - s.distance * maxR * Math.cos(rad);
            const strokeColor = s.runs === 6 ? '#FF0038' : s.runs === 4 ? color : s.runs > 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
            const strokeW = s.runs === 6 ? 2 : s.runs === 4 ? 1.5 : 1;
            return (
              <g key={i}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke={strokeColor} strokeWidth={strokeW} opacity={0.7} />
                <circle cx={x} cy={y} r={s.runs >= 4 ? 3 : 2} fill={strokeColor} opacity={0.85} />
              </g>
            );
          })}
          {/* Batter */}
          <circle cx={cx} cy={cy} r={4} fill={color} />
        </svg>
      </div>
      <div className="flex gap-3 justify-center text-2xs text-text-3 mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />4s</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />6s</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/30" />1-3</span>
      </div>
    </div>
  );
}
