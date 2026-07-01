import { getSportColor } from '../../config/sports';

interface Zone { x: number; y: number; rx: number; ry: number; intensity: number; player: 'home' | 'away' }

function randomCoverage(): Zone[] {
  return [
    { x: 30, y: 70, rx: 20, ry: 15, intensity: 0.7, player: 'home' },
    { x: 70, y: 30, rx: 18, ry: 12, intensity: 0.8, player: 'away' },
    { x: 50, y: 50, rx: 12, ry: 10, intensity: 0.4, player: 'home' },
    { x: 25, y: 25, rx: 14, ry: 11, intensity: 0.5, player: 'away' },
    { x: 75, y: 75, rx: 15, ry: 12, intensity: 0.6, player: 'home' },
  ];
}

export function CourtCoverage({ sportId = 'badminton' }: { sportId?: string }) {
  const color = getSportColor(sportId);
  const zones = randomCoverage();

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Court Coverage Map</h3>
      <div className="flex justify-center">
        <svg width="200" height="180" viewBox="0 0 100 90">
          {/* Court outline */}
          <rect x="5" y="5" width="90" height="80" fill="rgba(0,100,0,0.2)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {/* Net */}
          <line x1="5" y1="45" x2="95" y2="45" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
          {/* Coverage zones */}
          {zones.map((z, i) => (
            <ellipse key={i} cx={z.x} cy={z.y} rx={z.rx} ry={z.ry} fill={z.player === 'home' ? color : '#FF6B35'} opacity={z.intensity * 0.4} />
          ))}
          {/* Players */}
          <circle cx={50} cy={65} r={3} fill={color} />
          <circle cx={50} cy={25} r={3} fill="#FF6B35" />
        </svg>
      </div>
      <div className="flex gap-4 justify-center text-2xs text-text-3 mt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />Home coverage</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF6B35] inline-block" />Away coverage</span>
      </div>
    </div>
  );
}
