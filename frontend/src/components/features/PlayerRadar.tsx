import { getSportColor } from '../../config/sports';

const AXES = ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physicality'];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function polygonPoints(values: number[], cx: number, cy: number, maxR: number): string {
  return values.map((v, i) => {
    const angle = (360 / values.length) * i;
    const p = polarToCartesian(cx, cy, (v / 100) * maxR, angle);
    return `${p.x},${p.y}`;
  }).join(' ');
}

interface PlayerRadarProps {
  season?: number[];
  tonight?: number[];
  sportId?: string;
}

export function PlayerRadar({
  season = [72, 85, 91, 88, 45, 78],
  tonight = [80, 92, 87, 95, 50, 82],
  sportId = 'football',
}: PlayerRadarProps) {
  const color = getSportColor(sportId);
  const cx = 100, cy = 100, maxR = 75;

  const gridLines = [25, 50, 75, 100].map((pct) =>
    AXES.map((_, i) => {
      const angle = (360 / AXES.length) * i;
      return polarToCartesian(cx, cy, (pct / 100) * maxR, angle);
    })
  );

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Player Radar</h3>
      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Grid */}
          {gridLines.map((points, gi) => (
            <polygon key={gi} points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          ))}
          {/* Axes */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i;
            const end = polarToCartesian(cx, cy, maxR, angle);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
          })}
          {/* Season polygon */}
          <polygon points={polygonPoints(season, cx, cy, maxR)} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* Tonight polygon */}
          <polygon points={polygonPoints(tonight, cx, cy, maxR)} fill={color + '25'} stroke={color} strokeWidth="1.5" />
          {/* Labels */}
          {AXES.map((label, i) => {
            const angle = (360 / AXES.length) * i;
            const p = polarToCartesian(cx, cy, maxR + 14, angle);
            return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="rgba(255,255,255,0.4)">{label}</text>;
          })}
        </svg>
      </div>
      <div className="flex gap-4 justify-center text-2xs text-text-3 mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-white/30 inline-block" />Season avg</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block" style={{ backgroundColor: color }} />Tonight</span>
      </div>
    </div>
  );
}
