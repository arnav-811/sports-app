import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-surface-3 rounded', className)} />;
}

export function PostSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-32 h-3" />
      </div>
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-2/3 h-3" />
      <div className="flex gap-3">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function MatchSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="w-32 h-3 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-8" />
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  );
}
