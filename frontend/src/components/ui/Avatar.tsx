import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLORS = ['#00E5B4', '#C8F135', '#FFD23F', '#FF0038', '#FF6B35', '#6C63FF', '#FF8C00'];

function getColor(name?: string): string {
  if (!name) return COLORS[0];
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export function Avatar({ src, username, size = 'md', className }: AvatarProps) {
  const sizes = { xs: 'w-5 h-5 text-2xs', sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initial = username?.[0]?.toUpperCase() || '?';

  return (
    <div className={cn('rounded-full flex items-center justify-center overflow-hidden flex-shrink-0', sizes[size], className)}>
      {src ? (
        <img src={src} alt={username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold" style={{ backgroundColor: getColor(username) + '20', color: getColor(username) }}>
          {initial}
        </div>
      )}
    </div>
  );
}
