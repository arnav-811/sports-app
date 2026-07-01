import { useState } from 'react';
import { useSportStore } from '../../store/sportStore';
import { useFantasyStore } from '../../store/fantasyStore';
import { useFantasyLeagues, useFantasyPlayers, useLeaderboard } from '../../hooks/useFantasy';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { BudgetBar } from './BudgetBar';
import { PlayerCard } from './PlayerCard';
import { LeaderboardTable } from './LeaderboardTable';
import { getSportColor } from '../../config/sports';
import { Spinner } from '../ui/Spinner';
import { motion } from 'framer-motion';

export function FantasyShell() {
  const { activeSport } = useSportStore();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { setSport } = useFantasyStore();
  const color = getSportColor(activeSport);
  const [activeTab, setActiveTab] = useState<'pick' | 'leaderboard'>('pick');

  const { data: leagues } = useFantasyLeagues(activeSport);
  const { data: players, isLoading: playersLoading } = useFantasyPlayers(activeSport);
  const activeLeague = leagues?.[0];
  const { data: leaderboard } = useLeaderboard(activeLeague?.id || '');

  // Ensure fantasy store is set to current sport
  const handleSportChange = () => setSport(activeSport);
  void handleSportChange;

  if (!user) {
    return (
      <div className="card p-8 text-center space-y-3">
        <div className="text-4xl">🏆</div>
        <p className="text-text-1 font-semibold">Join Fantasy Leagues</p>
        <p className="text-sm text-text-2">Pick your team, compete with thousands</p>
        <button onClick={() => openAuthModal('register')} className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-opacity-90">
          Sign up free
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {activeLeague && (
        <div className="card p-4">
          <p className="text-xs text-text-3">{activeLeague.name}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm font-semibold">Deadline: {new Date(activeLeague.deadline).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>
              {activeLeague.format.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <BudgetBar />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
        {(['pick', 'leaderboard'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === t ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-2'}`}
          >
            {t === 'pick' ? 'Pick Squad' : 'Leaderboard'}
          </button>
        ))}
      </div>

      {activeTab === 'pick' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {playersLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            players?.map((p) => <PlayerCard key={p.id} player={p} sportColor={color} />)
          )}
        </motion.div>
      )}

      {activeTab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <LeaderboardTable teams={leaderboard || []} sportColor={color} />
        </motion.div>
      )}
    </div>
  );
}
