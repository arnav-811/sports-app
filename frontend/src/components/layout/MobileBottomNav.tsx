import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tv, Sword, Users, Menu } from 'lucide-react';
import { useSportStore } from '../../store/sportStore';
import { getSportColor } from '../../config/sports';
import { cn } from '../../lib/utils';

const TABS = [
  { label: 'Home',    icon: Home,  path: '/' },
  { label: 'Live',    icon: Tv,    path: '/live' },
  { label: 'Debates', icon: Sword, path: '/debates' },
  { label: 'Grounds', icon: Users, path: '/grounds' },
  { label: 'More',    icon: Menu,  path: '/settings' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { activeSport } = useSportStore();
  const color = getSportColor(activeSport);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-1 border-t border-[var(--border-color)] nav-elevated"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-14">
        {TABS.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
                isActive ? 'text-text-1' : 'text-text-3 hover:text-text-2')}
              style={isActive ? { color } : {}}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
