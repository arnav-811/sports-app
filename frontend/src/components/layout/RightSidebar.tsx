import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock } from 'lucide-react';
import { api } from '../../config/api';
import { useSportStore } from '../../store/sportStore';
import { Match } from '../../types/match';
import { LiveDot } from '../ui/LiveDot';
import { SportPill } from '../ui/SportPill';
import { timeAgo } from '../../lib/utils';

export function RightSidebar() {
  const { activeSport } = useSportStore();

  const { data: liveMatches } = useQuery<Match[]>({
    queryKey: ['matches', 'live', activeSport],
    queryFn: async () => {
      const { data } = await api.get('/matches/live');
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: upcomingMatches } = useQuery<Match[]>({
    queryKey: ['matches', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/matches/upcoming');
      return data;
    },
  });

  return (
    <aside className="nav-elevated hidden lg:block fixed right-0 top-[118px] bottom-0 w-[252px] bg-surface-1 border-l border-[var(--border-color)] overflow-y-auto no-scrollbar z-10 p-3 space-y-4">
      {/* Live matches */}
      {!!liveMatches?.length && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <LiveDot />
            <span className="text-xs font-bold text-text-2">Live Now</span>
          </div>
          <div className="space-y-1.5">
            {liveMatches.slice(0, 5).map((m) => (
              <Link key={m.id} to={`/live`} className="block p-2.5 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-1">
                  <SportPill sportId={m.sportId} />
                  <LiveDot />
                </div>
                <p className="text-xs text-text-2 truncate">{m.competition}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-medium truncate max-w-[80px]">{m.homeTeam}</span>
                  <span className="text-xs font-bold font-mono px-1.5">{m.homeScore ?? '–'}-{m.awayScore ?? '–'}</span>
                  <span className="text-xs font-medium truncate max-w-[80px] text-right">{m.awayTeam}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {!!upcomingMatches?.length && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Clock size={12} className="text-text-3" />
            <span className="text-xs font-bold text-text-2">Upcoming</span>
          </div>
          <div className="space-y-1.5">
            {upcomingMatches.slice(0, 4).map((m) => (
              <div key={m.id} className="p-2.5 bg-surface-2 rounded-lg border border-[var(--border-color)]">
                <SportPill sportId={m.sportId} />
                <p className="text-xs text-text-2 mt-1 truncate">{m.homeTeam} vs {m.awayTeam}</p>
                <p className="text-2xs text-text-3 mt-0.5">{timeAgo(m.startTime)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <TrendingUp size={12} className="text-text-3" />
          <span className="text-xs font-bold text-text-2">Trending</span>
        </div>
        <div className="space-y-1">
          {['Haaland 40+ goals', 'Alcaraz vs Djokovic', 'IPL Final predictions', 'Verstappen leads Miami', 'Axelsen vs LZJ'].map((t, i) => (
            <div key={i} className="px-2 py-1.5 rounded-lg hover:bg-surface-3 cursor-pointer transition-colors">
              <span className="text-2xs text-text-3 font-mono mr-1.5">{i + 1}.</span>
              <span className="text-xs text-text-2">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
