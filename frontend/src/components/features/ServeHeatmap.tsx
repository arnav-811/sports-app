import { useMemo } from 'react';
import { getSportColor } from '../../config/sports';
import { seededRandom } from '../../lib/seededRandom';

interface Serve { x: number; y: number; type: 'ace' | 'winner' | 'fault' | 'in' }

function buildServes(seed: string, n: number): Serve[] {
  const rand = seededRandom(seed);
  const types: Serve['type'][] = ['ace', 'winner', 'fault', 'in', 'in', 'in'];
  return Array.from({ length: n }, () => ({
    x: 10 + rand() * 35,
    y: 5 + rand() * 55,
    type: types[Math.floor(rand() * types.length)],
  }));
}

const SERVE_COLORS: Record<string, string> = { ace: '#FFD700', winner: '#00E5B4', fault: '#FF0038', in: 'rgba(255,255,255,0.4)' };

export function ServeHeatmap({ sportId = 'tennis' }: { sportId?: string }) {
  const color = getSportColor(sportId);
  const serves = useMemo(() => buildServes(`serve-${sportId}`, 30), [sportId]);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Serve Placement Heatmap</h3>
      <div className="flex justify-center">
        <svg width="200" height="150" viewBox="0 0 100 75">
          {/* Court */}
          <rect x="5" y="5" width="90" height="65" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Service boxes */}
          <line x1="50" y1="5" x2="50" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="5" y1="37.5" x2="95" y2="37.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="5" y1="23" x2="95" y2="23" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Serves */}
          {serves.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={2.5} fill={SERVE_COLORS[s.type]} opacity={0.8} />
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 justify-center text-2xs text-text-3 mt-2">
        {Object.entries(SERVE_COLORS).map(([type, c]) => (
          <span key={type} className="flex items-center gap-1 capitalize">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
