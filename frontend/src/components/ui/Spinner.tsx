import { cn } from '../../lib/utils';

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  return <div className={cn('rounded-full border-surface-4 border-t-white animate-spin', sizes[size], className)} />;
}
