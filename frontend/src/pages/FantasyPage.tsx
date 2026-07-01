import { motion } from 'framer-motion';
import { FantasyShell } from '../components/fantasy/FantasyShell';
import { useSportStore } from '../store/sportStore';
import { SPORT_MAP } from '../config/sports';

const FANTASY_FORMATS: Record<string, { name: string; desc: string }> = {
  football: { name: 'FPL-style', desc: 'Pick 15 players within £100M budget. Captain earns 2× points.' },
  cricket: { name: 'Dream11-style', desc: '11 players from 100 credits. Powerplay & death multipliers.' },
  f1: { name: 'Constructor Challenge', desc: '5 drivers + 1 constructor. Race weekend bonus questions.' },
  tennis: { name: 'Slam Pick\'em', desc: 'Pick 8 players per Grand Slam. Upset bonuses apply.' },
  badminton: { name: 'Shuttle Squad', desc: '6 players per event. Speed bonus and streak rewards.' },
};

export function FantasyPage() {
  const { activeSport } = useSportStore();
  const sport = SPORT_MAP[activeSport];
  const format = FANTASY_FORMATS[activeSport];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <div>
        <h1 className="text-lg font-black flex items-center gap-2">
          <span>{sport?.icon}</span>
          {sport?.name} Fantasy
        </h1>
        {format && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: sport?.color + '20', color: sport?.color }}>
              {format.name}
            </span>
            <p className="text-xs text-text-3">{format.desc}</p>
          </div>
        )}
      </div>
      <FantasyShell />
    </motion.div>
  );
}
