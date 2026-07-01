import { motion } from 'framer-motion';
import { LiveScoresGrid } from '../components/scores/LiveScoresGrid';
import { useSportStore } from '../store/sportStore';
import { SPORT_MAP } from '../config/sports';

export function LivePage() {
  const { activeSport } = useSportStore();
  const sport = SPORT_MAP[activeSport];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{sport?.icon}</span>
        <div>
          <h1 className="text-lg font-black">{sport?.name} Live</h1>
          <p className="text-xs text-text-3">Live scores and real-time match data</p>
        </div>
      </div>
      <LiveScoresGrid />
    </motion.div>
  );
}
