import { useEffect, useState } from 'react';
import { getSportColor } from '../../config/sports';

interface Zone { x: number; y: number; intensity: number; team: 'home' | 'away' }

function randomZones(n: number): Zone[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    intensity: Math.random(),
    team: Math.random() > 0.5 ? 'home' : 'away',
  }));
}

export function PressureMap({ sportId = 'football' }: { sportId?: string }) {
  const [zones, setZones] = useState<Zone[]>(randomZones(20));
  const color = getSportColor(sportId);

  useEffect(() => {
    const interval = setInterval(() => setZones(randomZones(20)), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span style={{ color }}>⚡</span> Live Pressure Map
      </h3>
      <div className="relative rounded-lg overflow-hidden" style={{ paddingTop: '65%', background: 'linear-gradient(to bottom, #1a2e1a, #0f1f0f)' }}>
        {/* Pitch markings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 65" preserveAspectRatio="none">
          <rect x="0" y="0" width="100" height="65" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="65" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <circle cx="50" cy="32.5" r="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="0" y="18" width="16" height="29" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="84" y="18" width="16" height="29" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Pressure ellipses */}
          {zones.map((z, i) => (
            <ellipse
              key={i}
              cx={z.x}
              cy={z.y * 0.65}
              rx={8 * z.intensity}
              ry={5 * z.intensity}
              fill={z.team === 'home' ? `${color}` : '#FF4444'}
              opacity={z.intensity * 0.4}
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-2xs text-text-3 mt-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />Home pressure</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Away pressure</span>
      </div>
    </div>
  );
}
