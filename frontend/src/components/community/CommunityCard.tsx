import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Community } from '../../types/community';
import { formatNumber } from '../../lib/utils';

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link to={`/r/${community.name}`} className="card p-4 flex items-center gap-3 hover:bg-surface-3 transition-colors">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-surface-3 flex-shrink-0">{community.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">r/{community.name}</p>
          {community.sport && (
            <span className="text-2xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: community.sport.color + '20', color: community.sport.color }}>
              {community.sport.icon}
            </span>
          )}
        </div>
        <p className="text-xs text-text-3 truncate">{community.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-text-3">
          <Users size={12} />
          <span className="font-mono">{formatNumber(community.memberCount)}</span>
        </div>
      </div>
    </Link>
  );
}
