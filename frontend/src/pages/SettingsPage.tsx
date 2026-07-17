import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useSportStore } from '../store/sportStore';
import { useToast } from '../hooks/useToast';
import { api } from '../config/api';
import { SPORTS } from '../config/sports';
import { Sun, Moon, Bell, Shield, User, Palette, ChevronRight, LogOut, Save, KeyRound, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const NOTIFICATION_KEYS = [
  { key: 'debates', label: 'Debate results', desc: 'When a debate you entered is decided' },
  { key: 'predictions', label: 'Prediction outcomes', desc: 'When your prediction resolves' },
  { key: 'rivalries', label: 'Rivalry activity', desc: 'Updates from your rivalries' },
  { key: 'dailyReminder', label: 'Daily login reminder', desc: 'Remind me to claim my daily coins' },
];

function errMsg(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } };
  return e.response?.data?.error || fallback;
}

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const { activeSport, setActiveSport } = useSportStore();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '', bio: user?.bio || '',
    country: user?.country || '', city: user?.city || '',
    favoriteSports: user?.favoriteSports || [],
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    debates: true, predictions: true, rivalries: true, dailyReminder: false,
    ...(user?.notificationPrefs || {}),
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/me', profileForm);
      setUser(data);
      success('Profile updated');
    } catch (err) {
      error(errMsg(err, 'Could not update profile'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function toggleNotification(key: string) {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    try {
      const { data } = await api.patch('/auth/me', { notificationPrefs: next });
      setUser(data);
    } catch (err) {
      setNotifications(notifications); // revert on failure
      error(errMsg(err, 'Could not update notification preferences'));
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error(errMsg(err, 'Could not change password'));
    } finally {
      setChangingPassword(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api.post('/auth/delete-account', { password: deletePassword });
      success('Account deactivated');
      await logout();
      navigate('/');
    } catch (err) {
      error(errMsg(err, 'Could not delete account'));
    } finally {
      setDeleting(false);
    }
  }

  function toggleFavoriteSport(sportId: string) {
    setProfileForm(f => ({
      ...f,
      favoriteSports: f.favoriteSports.includes(sportId)
        ? f.favoriteSports.filter(s => s !== sportId)
        : [...f.favoriteSports, sportId],
    }));
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
        <div className="flex items-center justify-between py-1 mb-2">
          <p className="text-xs text-text-muted">{user.email}</p>
          <button onClick={() => navigate(`/fancard/${user.username}`)} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary">
            View Fan Card <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <form onSubmit={saveProfile} className="space-y-3">
          <Input label="Display name" value={profileForm.displayName} maxLength={50}
            onChange={e => setProfileForm(f => ({ ...f, displayName: e.target.value }))} />
          <div>
            <label className="block text-xs font-medium text-text-2 mb-1">Bio</label>
            <textarea
              className="input-base w-full resize-none" rows={2} maxLength={500}
              value={profileForm.bio}
              onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Country" value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))} />
            <Input label="City" value={profileForm.city} onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-2 mb-1">Favorite sports</label>
            <div className="grid grid-cols-5 gap-2">
              {SPORTS.map(sport => (
                <button key={sport.id} type="button" onClick={() => toggleFavoriteSport(sport.id)}
                  className={cn('flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-colors',
                    profileForm.favoriteSports.includes(sport.id) ? 'border-current' : 'border-[var(--border-color)] hover:border-[var(--border-color-2)]'
                  )}
                  style={profileForm.favoriteSports.includes(sport.id) ? { borderColor: sport.color, background: sport.color + '15' } : {}}>
                  <span className="text-xl">{sport.icon}</span>
                  <span className="text-[10px] font-semibold text-text-muted">{sport.shortName}</span>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" isLoading={savingProfile} size="sm" className="flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save profile
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <Input type="password" label="Current password" value={passwordForm.currentPassword}
            onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} />
          <Input type="password" label="New password" value={passwordForm.newPassword} minLength={6}
            onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} />
          <Input type="password" label="Confirm new password" value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          <Button type="submit" isLoading={changingPassword} size="sm">Update password</Button>
        </form>
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors bg-surface-3 border-[var(--border-color)] text-text-primary hover:bg-surface-4"
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
        {NOTIFICATION_KEYS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">{label}</p>
              <p className="text-xs text-text-muted">{desc}</p>
            </div>
            <button
              onClick={() => toggleNotification(key)}
              className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                notifications[key] ? 'bg-football' : 'bg-surface-4'
              )}>
              <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                notifications[key] ? 'translate-x-5' : 'translate-x-1'
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
        <p className="text-xs text-text-muted">
          Fan Cards are always public on Sportverse — any user can view your stats, SV Score, and history. There is no private profile option.
        </p>
      </section>

      {/* Danger zone */}
      <section className="card p-4 space-y-3">
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        <div className="pt-3 border-t border-[var(--border-color)]">
          {!confirmingDelete ? (
            <button onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">Enter your password to permanently deactivate your account. This cannot be undone from the app.</p>
              <Input type="password" placeholder="Password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="danger" size="sm" isLoading={deleting} onClick={deleteAccount}>Confirm deletion</Button>
                <Button variant="ghost" size="sm" onClick={() => { setConfirmingDelete(false); setDeletePassword(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
