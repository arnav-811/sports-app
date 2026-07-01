import { Zap } from 'lucide-react';
import { getSportColor } from '../../config/sports';

const SMASHES = [
  { player: 'Viktor Axelsen', speed: 407, type: 'Jump Smash', outcome: 'Winner', rank: 1 },
  { player: 'Viktor Axelsen', speed: 396, type: 'Flat Smash', outcome: 'Winner', rank: 1 },
  { player: 'Lee Zii Jia', speed: 389, type: 'Cross Smash', outcome: 'Winner', rank: 12 },
  { player: 'Lee Zii Jia', speed: 378, type: 'Jump Smash', outcome: 'Net Error', rank: 12 },
  { player: 'Viktor Axelsen', speed: 371, type: 'Drive', outcome: 'Out', rank: 1 },
];

export function SmashSpeedBoard({ sportId = 'badminton' }: { sportId?: string }) {
  const color = getSportColor(sportId);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Zap size={14} style={{ color }} />
        Smash Speed Board
      </h3>
      <div className="space-y-2">
        {SMASHES.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-2xs font-mono text-text-3 w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium">{s.player}</span>
                <span className="text-sm font-bold font-mono" style={{ color: i === 0 ? '#FFD700' : color }}>
                  {s.speed} km/h
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-text-3">{s.type}</span>
                <span className={`text-2xs px-1.5 rounded-full ${s.outcome === 'Winner' ? 'text-green-400 bg-green-400/10' : 'text-text-3 bg-surface-3'}`}>{s.outcome}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
