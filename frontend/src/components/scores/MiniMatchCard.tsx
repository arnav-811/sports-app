import { motion } from 'framer-motion';
import { Match } from '../../types/match';
import { LiveDot } from '../ui/LiveDot';
import { SportPill } from '../ui/SportPill';
import { cn } from '../../lib/utils';

interface MiniMatchCardProps {
  match: Match;
  onClick?: () => void;
  className?: string;
}

export function MiniMatchCard({ match, onClick, className }: MiniMatchCardProps) {
  const isLive = match.status === 'live';

  return (
    <motion.div
      className={cn('card p-3 cursor-pointer hover:bg-surface-3 transition-colors border', className)}
      style={{ borderColor: isLive ? match.sport.color + '40' : 'rgba(255,255,255,0.07)' }}
      whileHover={{ borderColor: match.sport.color + '60' }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-2xs text-text-3 truncate">{match.competition}</p>
        {isLive ? <LiveDot /> : <SportPill sportId={match.sportId} showIcon={false} />}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium truncate flex-1">{match.homeTeam}</span>
        <div className="text-center flex-shrink-0 min-w-[48px]">
          {isLive || match.status === 'finished' ? (
            <span className="text-sm font-bold font-mono">{match.homeScore ?? 0} – {match.awayScore ?? 0}</span>
          ) : (
            <span className="text-xs text-text-3">vs</span>
          )}
        </div>
        <span className="text-xs font-medium truncate flex-1 text-right">{match.awayTeam}</span>
      </div>
    </motion.div>
  );
}
