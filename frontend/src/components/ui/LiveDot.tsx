import { cn } from '../../lib/utils';

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold text-red-400', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />
      LIVE
    </span>
  );
}
