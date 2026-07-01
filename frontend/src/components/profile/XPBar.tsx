import { xpToLevel } from '../../lib/utils';
import { ProgressBar } from '../ui/ProgressBar';

export function XPBar({ xp, level }: { xp: number; level: number }) {
  const { progress, needed } = xpToLevel(xp);
  const pct = (progress / needed) * 100;

  return (
    <div>
      <ProgressBar value={pct} color="#00E5B4" label={`Lv ${level} → ${level + 1}`} showLabel />
      <p className="text-2xs text-text-3 mt-1 text-right">{progress.toLocaleString()} / {needed.toLocaleString()} XP</p>
    </div>
  );
}
