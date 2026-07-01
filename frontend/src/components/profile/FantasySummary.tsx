import { FantasyTeam } from '../../types/fantasy';
import { Trophy } from 'lucide-react';

export function FantasySummary({ teams }: { teams: FantasyTeam[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Trophy size={14} className="text-yellow-400" />
        Fantasy Summary
      </h3>
      <div className="space-y-2">
        {teams.map((team) => (
          <div key={team.id} className="flex items-center justify-between p-2.5 bg-surface-3 rounded-lg">
            <div>
              <p className="text-sm font-medium">{team.name}</p>
              <p className="text-xs text-text-3">{team.league?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono text-yellow-400">{team.totalPoints.toFixed(0)} pts</p>
              {team.rank && <p className="text-xs text-text-3">Rank #{team.rank}</p>}
            </div>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-text-3 text-center py-4">No fantasy teams yet</p>}
      </div>
    </div>
  );
}
