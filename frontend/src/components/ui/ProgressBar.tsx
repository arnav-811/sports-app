import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, color = '#00E5B4', className, showLabel, label }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-text-2 mb-1">
          <span>{label || ''}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
