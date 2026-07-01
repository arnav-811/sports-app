import { motion } from 'framer-motion';
import { useSportStore } from '../store/sportStore';
import { useLiveMatches } from '../hooks/useLiveMatches';
import { PressureMap } from '../components/features/PressureMap';
import { XGTimeline } from '../components/features/XGTimeline';
import { PlayerRadar } from '../components/features/PlayerRadar';
import { WagonWheel } from '../components/features/WagonWheel';
import { RunRatePulse } from '../components/features/RunRatePulse';
import { TyreTracker } from '../components/features/TyreTracker';
import { GapDelta } from '../components/features/GapDelta';
import { ServeHeatmap } from '../components/features/ServeHeatmap';
import { CourtCoverage } from '../components/features/CourtCoverage';
import { SmashSpeedBoard } from '../components/features/SmashSpeedBoard';
import { AIInsightsBox } from '../components/features/AIInsightsBox';
import { SPORT_MAP } from '../config/sports';

export function FeaturesPage() {
  const { activeSport } = useSportStore();
  const { data: liveMatches } = useLiveMatches();
  const sport = SPORT_MAP[activeSport];
  const liveMatch = liveMatches?.find((m) => m.sportId === activeSport);

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.28 } });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <div>
        <h1 className="text-lg font-black flex items-center gap-2">
          <span>{sport?.icon}</span>
          {sport?.name} Analytics
        </h1>
        <p className="text-xs text-text-3">Deep stats and live visualizations</p>
      </div>

      {/* AI Insights */}
      {liveMatch && (
        <motion.div {...stagger(0)}>
          <AIInsightsBox matchId={liveMatch.id} sportId={activeSport} />
        </motion.div>
      )}

      {/* Football features */}
      {activeSport === 'football' && (
        <div className="space-y-4">
          <motion.div {...stagger(1)}><PressureMap sportId={activeSport} /></motion.div>
          <motion.div {...stagger(2)}><XGTimeline sportId={activeSport} /></motion.div>
          <motion.div {...stagger(3)}><PlayerRadar sportId={activeSport} /></motion.div>
        </div>
      )}

      {/* Tennis features */}
      {activeSport === 'tennis' && (
        <div className="space-y-4">
          <motion.div {...stagger(1)}><ServeHeatmap sportId={activeSport} /></motion.div>
          <motion.div {...stagger(2)}><PlayerRadar sportId={activeSport} season={[88, 72, 61, 79, 40, 65]} tonight={[91, 78, 68, 85, 45, 72]} /></motion.div>
        </div>
      )}

      {/* Cricket features */}
      {activeSport === 'cricket' && (
        <div className="space-y-4">
          <motion.div {...stagger(1)}><WagonWheel sportId={activeSport} /></motion.div>
          <motion.div {...stagger(2)}><RunRatePulse sportId={activeSport} /></motion.div>
        </div>
      )}

      {/* F1 features */}
      {activeSport === 'f1' && (
        <div className="space-y-4">
          <motion.div {...stagger(1)}><TyreTracker sportId={activeSport} /></motion.div>
          <motion.div {...stagger(2)}><GapDelta sportId={activeSport} /></motion.div>
        </div>
      )}

      {/* Badminton features */}
      {activeSport === 'badminton' && (
        <div className="space-y-4">
          <motion.div {...stagger(1)}><CourtCoverage sportId={activeSport} /></motion.div>
          <motion.div {...stagger(2)}><SmashSpeedBoard sportId={activeSport} /></motion.div>
        </div>
      )}
    </motion.div>
  );
}
