interface StatBarProps {
  label: string;
  homeVal?: number;
  awayVal?: number;
  unit?: string;
  color?: string;
}

export function StatBar({ label, homeVal = 0, awayVal = 0, unit = '', color = '#00E5B4' }: StatBarProps) {
  const total = homeVal + awayVal || 1;
  const homeW = (homeVal / total) * 100;

  return (
    <div>
      <div className="flex justify-between text-2xs text-text-2 mb-1">
        <span className="font-mono font-bold">{homeVal}{unit}</span>
        <span className="text-text-3">{label}</span>
        <span className="font-mono font-bold">{awayVal}{unit}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-4">
        <div className="h-full rounded-l-full transition-all duration-500" style={{ width: `${homeW}%`, backgroundColor: color }} />
        <div className="h-full flex-1 bg-surface-3" />
      </div>
    </div>
  );
}
