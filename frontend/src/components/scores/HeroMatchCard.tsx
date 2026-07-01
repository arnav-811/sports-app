import { motion } from 'framer-motion';
import { Match, FootballStats, CricketStats, TennisStats, F1Stats, BadmintonStats } from '../../types/match';
import { LiveDot } from '../ui/LiveDot';
import { StatBar } from './StatBar';

interface HeroMatchCardProps {
  match: Match;
}

export function HeroMatchCard({ match }: HeroMatchCardProps) {
  const isLive = match.status === 'live';
  const color = match.sport.color;

  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Sport color stripe */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{match.sport.icon}</span>
            <div>
              <p className="text-xs text-text-3">{match.competition}</p>
              {match.venue && <p className="text-2xs text-text-3">{match.venue}</p>}
            </div>
          </div>
          {isLive && <LiveDot />}
        </div>

        {/* Score display */}
        <div className="flex items-center justify-between gap-4 my-6">
          <div className="flex-1 text-center">
            <p className="text-base font-bold leading-tight">{match.homeTeam}</p>
          </div>
          <div className="text-center flex-shrink-0">
            {isLive || match.status === 'finished' ? (
              <motion.div
                key={`${match.homeScore}-${match.awayScore}`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <span className="text-4xl font-black font-mono">{match.homeScore ?? 0}</span>
                <span className="text-xl text-text-3">–</span>
                <span className="text-4xl font-black font-mono">{match.awayScore ?? 0}</span>
              </motion.div>
            ) : (
              <div>
                <p className="text-sm text-text-3">vs</p>
                <p className="text-xs text-text-3 mt-1">{new Date(match.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </div>
          <div className="flex-1 text-center">
            <p className="text-base font-bold leading-tight">{match.awayTeam}</p>
          </div>
        </div>

        {/* Sport-specific stats */}
        {isLive && match.statsJson && <MatchStats match={match} />}
      </div>
    </motion.div>
  );
}

function MatchStats({ match }: { match: Match }) {
  const stats = match.statsJson;
  if (!stats) return null;

  if (match.sportId === 'football') {
    const s = stats as FootballStats;
    return (
      <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex justify-between text-xs text-text-3 mb-1">
          <span>Min {s.minute}'</span>
          <span className="font-mono text-xs">{s.xg?.home?.toFixed(2)} xG — {s.xg?.away?.toFixed(2)}</span>
        </div>
        <StatBar label="Possession" homeVal={s.possession?.[0]} awayVal={s.possession?.[1]} unit="%" color={match.sport.color} />
        <StatBar label="Shots" homeVal={s.shots?.[0]} awayVal={s.shots?.[1]} color={match.sport.color} />
        <StatBar label="On Target" homeVal={s.shotsOnTarget?.[0]} awayVal={s.shotsOnTarget?.[1]} color={match.sport.color} />
      </div>
    );
  }

  if (match.sportId === 'cricket') {
    const s = stats as CricketStats;
    return (
      <div className="pt-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-text-3">Over {s.over}</span>
          <span className="font-mono" style={{ color: match.sport.color }}>RRR: {s.requiredRunRate}</span>
        </div>
        <p className="text-xs text-text-3">{s.lastWicket}</p>
        <div className="flex gap-1 mt-2">
          {s.recentBalls?.map((b, i) => (
            <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold ${b === 'W' ? 'bg-red-500 text-white' : b === '4' || b === '6' ? 'text-black' : 'bg-surface-4 text-text-2'}`} style={(b === '4' || b === '6') ? { backgroundColor: match.sport.color } : {}}>
              {b}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (match.sportId === 'tennis') {
    const s = stats as TennisStats;
    return (
      <div className="pt-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex justify-between text-xs">
          <span className="text-text-3">Set {s.set} · {s.game}</span>
          <span className="text-text-3">Serving: {s.serving}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div><p className="text-lg font-bold font-mono">{s.aces?.home}</p><p className="text-2xs text-text-3">Aces</p></div>
          <div><p className="text-2xs text-text-3">1st Serve %</p><div className="flex gap-1 justify-center text-xs font-mono mt-1"><span>{s.firstServe?.home}%</span><span className="text-text-3">/</span><span>{s.firstServe?.away}%</span></div></div>
          <div><p className="text-lg font-bold font-mono">{s.aces?.away}</p><p className="text-2xs text-text-3">Aces</p></div>
        </div>
      </div>
    );
  }

  if (match.sportId === 'f1') {
    const s = stats as F1Stats;
    return (
      <div className="pt-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex justify-between text-xs">
          <span className="text-text-3">Lap {s.lap}/{s.totalLaps}</span>
          <span className="font-mono" style={{ color: match.sport.color }}>{s.gap}</span>
        </div>
        {s.safetyCarDeployed && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mt-2 inline-block">🚗 Safety Car</span>}
        {s.fastestLap && <p className="text-2xs text-text-3 mt-1">FL: {s.fastestLap.driver} {s.fastestLap.time}</p>}
      </div>
    );
  }

  if (match.sportId === 'badminton') {
    const s = stats as BadmintonStats;
    return (
      <div className="pt-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex justify-between text-xs">
          <span className="text-text-3">Game {s.game}</span>
          <span className="text-text-3">Rallies: {s.rallyCount}</span>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="font-mono">{s.smashSpeed?.home} km/h</span>
          <span className="text-text-3">Max Smash</span>
          <span className="font-mono">{s.smashSpeed?.away} km/h</span>
        </div>
      </div>
    );
  }

  return null;
}
