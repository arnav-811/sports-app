import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useSportStore } from '../store/sportStore';
import { SPORTS } from '../config/sports';
import { Sun, Moon, Bell, Shield, User, Palette, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const { activeSport, setActiveSport } = useSportStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ debates: true, predictions: true, rivalries: true, dailyReminder: false });

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <p className="text-text-muted text-sm">Sign in to access settings</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text-primary text-sm">← Back</button>
        <h1 className="text-xl font-black text-text-primary">Settings</h1>
      </div>

      {/* Profile */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Account</h2>
        </div>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-text-primary">{user.displayName || user.username}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
          <button onClick={() => navigate(`/fancard/${user.username}`)} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
            View Fan Card <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Appearance</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Theme</p>
            <p className="text-xs text-text-muted">{theme === 'dark' ? 'Dark mode active' : 'Light mode active'}</p>
          </div>
          <button
            onClick={toggle}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors',
              theme === 'dark'
                ? 'bg-surface-3 border-[var(--border-color)] text-text-primary hover:bg-surface-4'
                : 'bg-surface-3 border-[var(--border-color)] text-text-primary hover:bg-surface-4'
            )}
          >
            {theme === 'dark' ? <><Sun className="w-4 h-4" /> Light</> : <><Moon className="w-4 h-4" /> Dark</>}
          </button>
        </div>
      </section>

      {/* Default sport */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🏅</span>
          <h2 className="text-sm font-bold text-text-primary">Default Sport</h2>
        </div>
        <p className="text-xs text-text-muted">The sport shown first when you open the app</p>
        <div className="grid grid-cols-5 gap-2">
          {SPORTS.map(sport => (
            <button key={sport.id} onClick={() => setActiveSport(sport.id)}
              className={cn('flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-colors',
                activeSport === sport.id ? 'border-current' : 'border-[var(--border-color)] hover:border-[var(--border-color-2)]'
              )}
              style={activeSport === sport.id ? { borderColor: sport.color, background: sport.color + '15' } : {}}>
              <span className="text-xl">{sport.icon}</span>
              <span className="text-[10px] font-semibold text-text-muted">{sport.shortName}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Notifications</h2>
        </div>
        {[
          { key: 'debates', label: 'Debate results', desc: 'When a debate you entered is decided' },
          { key: 'predictions', label: 'Prediction outcomes', desc: 'When your prediction resolves' },
          { key: 'rivalries', label: 'Rivalry activity', desc: 'Updates from your rivalries' },
          { key: 'dailyReminder', label: 'Daily login reminder', desc: 'Remind me to claim my daily coins' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">{label}</p>
              <p className="text-xs text-text-muted">{desc}</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                notifications[key as keyof typeof notifications] ? 'bg-football' : 'bg-surface-4'
              )}>
              <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-1'
              )} />
            </button>
          </div>
        ))}
      </section>

      {/* Privacy */}
      <section className="card p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Privacy</h2>
        </div>
        <div className="flex items-center justify-between py-1">
          <p className="text-sm text-text-primary">Wallet visibility</p>
          <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">Private</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <p className="text-sm text-text-primary">SV Score visibility</p>
          <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded">Public</span>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card p-4">
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </section>
    </div>
  );
}
