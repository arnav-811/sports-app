import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tv, Trophy, Users, BarChart2, User, Settings, Sword, Zap, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useSportStore } from '../../store/sportStore';
import { useAuthStore } from '../../store/authStore';
import { getSportColor } from '../../config/sports';
import { cn } from '../../lib/utils';

const NAV = [
  { label: 'The Boards', icon: Home, path: '/' },
  { label: 'Live Action', icon: Tv, path: '/live' },
  { label: 'Draft Wars', icon: Trophy, path: '/draftwars' },
  { label: '🎯 The Sporting Director', icon: BarChart2, path: '/director' },
  { label: 'Grounds', icon: Users, path: '/grounds' },
  { label: 'Scout Room', icon: BarChart2, path: '/scout-room' },
  { label: 'Debates', icon: Sword, path: '/debates' },
  { label: '⚡ Coin Store', icon: Zap, path: '/store' },
  { label: '📋 Quests', icon: ClipboardList, path: '/quests' },
];

export function LeftSidebar() {
  const location = useLocation();
  const { activeSport } = useSportStore();
  const { user } = useAuthStore();
  const color = getSportColor(activeSport);

  const { data: grounds } = useQuery<{ id: string; name: string; icon: string }[]>({
    queryKey: ['grounds-sidebar', activeSport],
    queryFn: () => api.get('/grounds', { params: { sport: activeSport } }).then(r => r.data),
  });

  return (
    <aside className="nav-elevated hidden lg:flex flex-col fixed left-0 top-[118px] bottom-0 w-48 bg-surface-1 border-r border-[var(--border-color)] overflow-y-auto no-scrollbar z-10 pb-4">
      <nav className="p-2 space-y-0.5">
        {NAV.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive ? 'text-text-1' : 'text-text-2 hover:text-text-1 hover:bg-surface-3')}
              style={isActive ? { color, backgroundColor: color + '12' } : {}}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 my-2 h-px bg-[var(--border-color)]" />

      <div className="p-2">
        <p className="px-3 py-1 text-2xs font-bold text-text-3 uppercase tracking-wider">Grounds</p>
        <div className="space-y-0.5 mt-1">
          {grounds?.slice(0, 8).map((g) => (
            <Link key={g.id} to={`/g/${g.name}`}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors',
                location.pathname === `/g/${g.name}` && 'text-text-1 bg-surface-3')}
            >
              <span className="text-sm">{g.icon}</span>
              <span className="truncate">g/{g.name}</span>
            </Link>
          ))}
          <Link to="/grounds" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-text-3 hover:text-text-2 transition-colors">
            + Explore all Grounds
          </Link>
        </div>
      </div>

      {user && (
        <div className="mt-auto p-2 border-t border-[var(--border-color)]">
          <Link to={`/fancard/${user.username}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors">
            <User size={14} /> Fan Card
          </Link>
          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors">
            <Settings size={14} /> Settings
          </Link>
        </div>
      )}
    </aside>
  );
}
