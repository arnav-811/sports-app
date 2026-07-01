import React, { useState } from 'react';
import { Bell, Search, Zap, Sun, Moon, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SPORTS } from '../../config/sports';
import { useSportStore } from '../../store/sportStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import SVScoreDisplay from '../svScore/SVScoreDisplay';
import CoinBalance from '../economy/CoinBalance';
import MultiplierDisplay from '../economy/MultiplierDisplay';
import { useThemeStore } from '../../store/themeStore';
import { api } from '../../config/api';
import type { PortfolioStats } from '../../types/director';

export function TopNav() {
  const { activeSport, setActiveSport } = useSportStore();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: portfolio } = useQuery<PortfolioStats>({
    queryKey: ['director-portfolio'],
    queryFn: () => api.get('/director/portfolio').then(r => r.data),
    enabled: !!user,
    staleTime: 60000,
    refetchInterval: 120000,
  });
  const activeSportData = SPORTS.find((s) => s.id === activeSport);
  const color = activeSportData?.color || '#00E5B4';

  return (
    <header className="nav-elevated fixed top-0 left-0 right-0 z-40 h-[50px] bg-surface-1 border-b border-[var(--border-color)] flex items-center px-3 gap-2 lg:px-4 lg:gap-4">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-1.5 flex-shrink-0 mr-1 lg:mr-4">
        <Zap size={18} style={{ color }} />
        <span className="font-black text-sm tracking-tight uppercase hidden sm:inline" style={{ color }}>
          Sportverse
        </span>
      </Link>

      {/* Sport selector — icons only on mobile, icons+label on desktop */}
      {!searchOpen && (
        <nav className="flex items-center gap-0.5 flex-shrink-0 lg:gap-1">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={cn(
                'px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1',
                activeSport === sport.id ? 'border' : 'text-text-2 hover:text-text-1 hover:bg-surface-3'
              )}
              style={activeSport === sport.id ? {
                backgroundColor: sport.color + '20', borderColor: sport.color, color: sport.color,
              } : {}}
            >
              <span className="text-sm">{sport.icon}</span>
              <span className="hidden lg:inline text-xs">{sport.shortName}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Search — expands full-width on mobile tap, normal on desktop */}
      <div className={cn('transition-all duration-200', searchOpen ? 'flex-1' : 'flex-1 max-w-xs mx-auto hidden sm:block')}>
        <form onSubmit={(e) => { e.preventDefault(); if (searchQ) { navigate(`/search?q=${encodeURIComponent(searchQ)}`); setSearchOpen(false); } }}>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              autoFocus={searchOpen}
              placeholder="Search takes, grounds..."
              className="w-full bg-surface-3 border border-[var(--border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-[var(--border-color-2)]"
            />
          </div>
        </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto flex-shrink-0 lg:gap-2">

        {/* Mobile search toggle */}
        <button onClick={() => setSearchOpen(v => !v)}
          className="sm:hidden p-2 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors">
          {searchOpen ? <X size={16} /> : <Search size={16} />}
        </button>

        {/* Theme toggle */}
        <button onClick={toggle}
          className="p-2 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <>
            {/* Coin balance — always visible */}
            <CoinBalance />
            {/* Director portfolio delta — desktop only, only when positions are open */}
            {portfolio && portfolio.openCount > 0 && (
              <Link to="/director" className="hidden lg:flex flex-col items-end leading-none">
                <span className="text-2xs text-text-3">Portfolio</span>
                <span className={cn('text-xs font-bold', portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {portfolio.totalPnL >= 0 ? '+' : ''}⚡{Math.abs(portfolio.totalPnL).toLocaleString()}
                </span>
              </Link>
            )}
            {/* Multiplier — desktop only (space-constrained on mobile) */}
            <span className="hidden lg:flex"><MultiplierDisplay compact /></span>
            {/* SV Score — desktop only */}
            {user.svScore !== undefined && <span className="hidden lg:flex"><SVScoreDisplay score={user.svScore} size="sm" /></span>}
            {/* Bell — desktop only */}
            <Link to="/dugout" className="hidden lg:flex p-2 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-3 transition-colors">
              <Bell size={16} />
            </Link>
            {/* Avatar — always visible */}
            <Link to={`/fancard/${user.username}`} className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-surface-3 transition-colors">
              <Avatar src={user.avatarUrl} username={user.username} size="xs" />
              <span className="text-xs font-medium hidden md:inline">{user.username}</span>
              {user.isPremium && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 hidden md:block" />}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <button onClick={() => openAuthModal('login')}
              className="px-2.5 py-1.5 text-xs font-semibold text-text-2 hover:text-text-1 transition-colors hidden sm:block">
              Sign in
            </button>
            <button onClick={() => openAuthModal('register')}
              className="px-2.5 py-1.5 text-xs font-semibold bg-text-1 text-surface-0 rounded-lg hover:opacity-90 transition-all">
              Join
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
