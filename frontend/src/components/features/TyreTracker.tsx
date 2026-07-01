import { getSportColor } from '../../config/sports';

interface Driver { name: string; stints: { compound: string; laps: number }[] }

const DRIVERS: Driver[] = [
  { name: 'Verstappen', stints: [{ compound: 'Soft', laps: 18 }, { compound: 'Medium', laps: 16 }] },
  { name: 'Norris', stints: [{ compound: 'Soft', laps: 20 }, { compound: 'Medium', laps: 14 }] },
  { name: 'Leclerc', stints: [] },
  { name: 'Hamilton', stints: [{ compound: 'Medium', laps: 22 }, { compound: 'Hard', laps: 12 }] },
];

const COMPOUND_COLORS: Record<string, string> = { Soft: '#FF0038', Medium: '#FFD23F', Hard: '#E8E8E8', Inter: '#00C000', Wet: '#0000FF' };

export function TyreTracker({ sportId = 'f1' }: { sportId?: string }) {
  const color = getSportColor(sportId);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-4">Tyre Strategy Tracker</h3>
      <div className="space-y-3">
        {DRIVERS.map((driver) => (
          <div key={driver.name}>
            <p className="text-xs text-text-3 mb-1">{driver.name}</p>
            <div className="flex h-5 rounded-md overflow-hidden gap-0.5">
              {driver.stints.length === 0 ? (
                <div className="flex-1 bg-red-900/40 rounded flex items-center justify-center text-2xs text-red-400">DNF</div>
              ) : (
                driver.stints.map((stint, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-2xs font-bold text-black rounded"
                    style={{ flex: stint.laps, backgroundColor: COMPOUND_COLORS[stint.compound] || color }}
                    title={`${stint.compound} — ${stint.laps} laps`}
                  >
                    {stint.laps}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-3 text-2xs text-text-3">
        {Object.entries(COMPOUND_COLORS).slice(0, 3).map(([compound, c]) => (
          <span key={compound} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: c }} />
            {compound}
          </span>
        ))}
      </div>
    </div>
  );
}
