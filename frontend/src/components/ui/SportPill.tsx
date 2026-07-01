import { SPORT_MAP } from '../../config/sports';
import { cn } from '../../lib/utils';

interface SportPillProps {
  sportId: string;
  className?: string;
  showIcon?: boolean;
}

export function SportPill({ sportId, className, showIcon = true }: SportPillProps) {
  const sport = SPORT_MAP[sportId];
  if (!sport) return null;
  return (
    <span
      className={cn('sport-pill text-2xs font-bold uppercase tracking-wide', className)}
      style={{ backgroundColor: sport.color + '20', color: sport.color, border: `1px solid ${sport.color}40` }}
    >
      {showIcon && sport.icon} {sport.shortName || sport.name}
    </span>
  );
}
