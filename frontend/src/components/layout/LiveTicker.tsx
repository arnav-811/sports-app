import { motion } from 'framer-motion';
import { useLiveMatches } from '../../hooks/useLiveMatches';
import { useSportStore } from '../../store/sportStore';
import { getSportColor } from '../../config/sports';

export function LiveTicker() {
  const { data: matches } = useLiveMatches();
  const { activeSport } = useSportStore();
  const color = getSportColor(activeSport);

  if (!matches?.length) return null;

  const items = matches.map((m) => `${m.homeTeam} ${m.homeScore ?? ''} – ${m.awayScore ?? ''} ${m.awayTeam} • ${m.competition}`);
  const ticker = [...items, ...items].join('   •••   ');

  return (
    <div className="fixed top-[50px] lg:top-[92px] left-0 right-0 z-20 h-[26px] overflow-hidden text-2xs font-mono font-medium" style={{ backgroundColor: color }}>
      <motion.div
        className="whitespace-nowrap flex items-center h-full text-black px-4"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {ticker}
      </motion.div>
    </div>
  );
}
