import { motion } from 'framer-motion';
import { useLiveMatches, useUpcomingMatches } from '../../hooks/useLiveMatches';
import { HeroMatchCard } from './HeroMatchCard';
import { MiniMatchCard } from './MiniMatchCard';
import { MatchSkeleton } from '../ui/Skeleton';
import { useSportStore } from '../../store/sportStore';

export function LiveScoresGrid() {
  const { activeSport } = useSportStore();
  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();
  const { data: upcomingMatches, isLoading: upcomingLoading } = useUpcomingMatches();

  const filtered = liveMatches?.filter((m) => m.sportId === activeSport);
  const allLive = liveMatches || [];
  const upcoming = upcomingMatches || [];

  return (
    <div className="space-y-6">
      {/* Active sport hero */}
      {liveLoading ? (
        <MatchSkeleton />
      ) : filtered?.length ? (
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <HeroMatchCard match={m} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-text-3 text-sm">No live {activeSport} matches right now</p>
          <p className="text-text-3 text-xs mt-1">Check upcoming matches below</p>
        </div>
      )}

      {/* All live matches (other sports) */}
      {allLive.filter((m) => m.sportId !== activeSport).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-text-3 uppercase tracking-wider mb-3">Other Live Matches</h3>
          <div className="grid grid-cols-1 gap-2">
            {allLive.filter((m) => m.sportId !== activeSport).map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <MiniMatchCard match={m} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-text-3 uppercase tracking-wider mb-3">Upcoming</h3>
          {upcomingLoading ? <MatchSkeleton /> : (
            <div className="grid grid-cols-1 gap-2">
              {upcoming.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <MiniMatchCard match={m} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
