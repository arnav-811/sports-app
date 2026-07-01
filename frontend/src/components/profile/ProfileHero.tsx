import { User } from '../../types/user';
import { Avatar } from '../ui/Avatar';
import { XPBar } from './XPBar';
import { SportPill } from '../ui/SportPill';
import { formatNumber } from '../../lib/utils';
import { Star, MessageSquare, Trophy } from 'lucide-react';

export function ProfileHero({ user }: { user: User }) {
  return (
    <div className="card overflow-hidden">
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-surface-3 to-surface-2" />

      <div className="px-5 pb-5">
        <div className="flex items-end gap-3 -mt-6 mb-4">
          <Avatar src={user.avatarUrl} username={user.username} size="xl" className="ring-4 ring-surface-2" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black">{user.displayName || user.username}</h1>
              {user.isPremium && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">Premium</span>}
            </div>
            <p className="text-sm text-text-3">u/{user.username} · Lv {user.level}</p>
          </div>
        </div>

        {user.bio && <p className="text-sm text-text-2 mb-4 leading-relaxed">{user.bio}</p>}

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <StatChip icon={<Star size={12} />} label="Karma" value={formatNumber(user.karma)} />
          <StatChip icon={<Trophy size={12} />} label="Level" value={String(user.level)} />
          <StatChip icon={<MessageSquare size={12} />} label="XP" value={formatNumber(user.xp)} />
        </div>

        <XPBar xp={user.xp} level={user.level} />

        {/* Favourite sports */}
        {user.favoriteSports?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user.favoriteSports.map((s) => <SportPill key={s} sportId={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-text-2">
      <span className="text-text-3">{icon}</span>
      <span className="font-bold text-text-1 font-mono">{value}</span>
      <span>{label}</span>
    </div>
  );
}
