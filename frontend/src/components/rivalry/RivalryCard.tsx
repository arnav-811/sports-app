import React from 'react';
import { Zap, Trophy } from 'lucide-react';
import { Rivalry } from '../../types/rivalry';
import SVScoreDisplay from '../svScore/SVScoreDisplay';
import { Avatar } from '../ui/Avatar';

interface Props { rivalry: Rivalry; currentUserId?: string }

export default function RivalryCard({ rivalry, currentUserId }: Props) {
  const { challenger, challenged, stats } = rivalry;
  const isChallenger = currentUserId === challenger.id;
  const me = isChallenger ? challenger : challenged;
  const them = isChallenger ? challenged : challenger;
  const myWins = isChallenger ? (stats?.challengerWins || 0) : (stats?.challengedWins || 0);
  const theirWins = isChallenger ? (stats?.challengedWins || 0) : (stats?.challengerWins || 0);
  const draws = stats?.draws || 0;
  const streakIsMe = stats?.streakHolder === me.id;

  return (
    <div className="card hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1 flex-1">
          <Avatar user={me} size="lg" />
          <SVScoreDisplay score={me.svScore} size="sm" />
          <span className="text-xs font-semibold text-text-primary">{me.displayName || me.username}</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-2">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] text-text-muted font-mono">VS</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-black font-mono text-text-primary">
              {myWins} – {draws} – {theirWins}
            </div>
            <div className="text-[9px] text-text-muted">W – D – L</div>
          </div>
          {streakIsMe && stats?.streakLength && stats.streakLength > 1 && (
            <span className="text-[10px] text-orange-400">🔥 {stats.streakLength}-win streak</span>
          )}
          {rivalry.status === 'pending' && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Pending</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <Avatar user={them} size="lg" />
          <SVScoreDisplay score={them.svScore} size="sm" />
          <span className="text-xs font-semibold text-text-primary">{them.displayName || them.username}</span>
        </div>
      </div>

      {stats && stats.totalBattles > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-center">
          <span className="text-[10px] text-text-muted">{stats.totalBattles} total battles</span>
        </div>
      )}
    </div>
  );
}
