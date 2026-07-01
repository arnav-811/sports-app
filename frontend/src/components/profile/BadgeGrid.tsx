import { UserBadge } from '../../types/user';
import { timeAgo } from '../../lib/utils';

export function BadgeGrid({ badges }: { badges: UserBadge[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">Badges</h3>
      <div className="grid grid-cols-4 gap-3">
        {badges.map((ub) => (
          <div key={ub.id} className="text-center group" title={`${ub.badge.description}\nEarned ${timeAgo(ub.earnedAt)}`}>
            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-xl mb-1" style={{ backgroundColor: ub.badge.color + '20', border: `1px solid ${ub.badge.color}40` }}>
              {ub.badge.icon}
            </div>
            <p className="text-2xs text-text-3 leading-tight">{ub.badge.name}</p>
          </div>
        ))}
        {badges.length === 0 && <p className="col-span-4 text-sm text-text-3 text-center py-4">No badges yet</p>}
      </div>
    </div>
  );
}
