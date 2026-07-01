import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSportStore } from '../../store/sportStore';
import { getSportColor } from '../../config/sports';
import { cn } from '../../lib/utils';

const MODES = [
  { id: 'boards', label: 'The Boards', path: '/' },
  { id: 'live', label: 'Live Action', path: '/live' },
  { id: 'draftwars', label: 'Draft Wars', path: '/draftwars' },
  { id: 'grounds', label: 'Grounds', path: '/grounds' },
  { id: 'scout-room', label: 'Scout Room', path: '/scout-room' },
];

export function ModeBar() {
  const { activeSport } = useSportStore();
  const navigate = useNavigate();
  const location = useLocation();
  const color = getSportColor(activeSport);

  return (
    <div className="nav-elevated hidden lg:flex fixed top-[50px] left-0 right-0 z-30 h-[42px] bg-surface-1 border-b border-[var(--border-color)] items-center px-4 gap-1">
      {MODES.map((mode) => {
        const isActive = mode.path === '/' ? location.pathname === '/' : location.pathname.startsWith(mode.path);
        return (
          <button key={mode.id} onClick={() => navigate(mode.path)}
            className={cn('relative px-4 py-2 text-xs font-semibold transition-colors duration-150 h-full flex items-center',
              isActive ? 'text-text-1' : 'text-text-2 hover:text-text-1')}
          >
            {mode.label}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: color }} />}
          </button>
        );
      })}
    </div>
  );
}
