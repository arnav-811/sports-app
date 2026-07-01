import { Trophy } from 'lucide-react';
import { FantasyTeam } from '../../types/fantasy';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface LeaderboardTableProps {
  teams: FantasyTeam[];
  sportColor?: string;
}

export function LeaderboardTable({ teams, sportColor = '#00E5B4' }: LeaderboardTableProps) {
  const { user } = useAuthStore();

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
        <Trophy size={14} style={{ color: sportColor }} />
        <span className="text-sm font-semibold">Leaderboard</span>
      </div>
      <div className="divide-y divide-[rgba(255,255,255,0.05)]">
        {teams.map((team, i) => {
          const isMe = team.user?.username === user?.username;
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={team.id} className={cn('flex items-center gap-3 px-4 py-2.5 transition-colors', isMe && 'bg-surface-3')}>
              <div className="w-6 text-center text-sm">
                {i < 3 ? medals[i] : <span className="text-xs font-mono text-text-3">#{i + 1}</span>}
              </div>
              <Avatar username={team.user?.username} size="xs" />
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium truncate', isMe && 'text-text-1')}>
                  {team.name}
                  {isMe && <span className="ml-1 text-2xs text-text-3">(you)</span>}
                </p>
                <p className="text-2xs text-text-3">{team.user?.username}</p>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined }}>
                {team.totalPoints.toFixed(0)}
              </span>
            </div>
          );
        })}
        {teams.length === 0 && (
          <div className="px-4 py-6 text-center text-text-3 text-sm">No teams yet</div>
        )}
      </div>
    </div>
  );
}
