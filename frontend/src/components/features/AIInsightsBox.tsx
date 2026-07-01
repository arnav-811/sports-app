import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, TrendingUp, Zap, Target } from 'lucide-react';
import { api } from '../../config/api';
import { AIAnalysis } from '../../types/match';
import { getSportColor } from '../../config/sports';
import { Spinner } from '../ui/Spinner';

interface AIInsightsBoxProps {
  matchId: string;
  sportId: string;
}

export function AIInsightsBox({ matchId, sportId }: AIInsightsBoxProps) {
  const color = getSportColor(sportId);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: analysis, isLoading, refetch } = useQuery<AIAnalysis>({
    queryKey: ['ai-analysis', matchId, refreshKey],
    queryFn: async () => {
      const { data } = await api.get(`/matches/${matchId}/ai-analysis`);
      return data;
    },
    staleTime: 60000,
  });

  return (
    <div className="card overflow-hidden">
      {/* Color border top */}
      <div className="h-0.5" style={{ backgroundColor: color }} />
      <div style={{ background: `linear-gradient(to bottom, ${color}10, transparent)` }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={14} style={{ color }} />
              <span className="text-sm font-semibold">AI Analyst</span>
              {!analysis?.isAI && <span className="text-2xs text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">template</span>}
            </div>
            <button
              onClick={() => { setRefreshKey((k) => k + 1); refetch(); }}
              className="p-1.5 rounded-lg text-text-3 hover:text-text-2 hover:bg-surface-3 transition-colors"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-sm text-text-2 animate-pulse">Analysing match...</span>
            </div>
          ) : analysis ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-text-2 leading-relaxed">{analysis.summary}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <StatBox icon={<TrendingUp size={12} />} label="Home Win%" value={`${analysis.winProbability.home}%`} color={color} />
                <StatBox icon={<Zap size={12} />} label="Next Event" value={analysis.nextEventPrediction} color={color} small />
                <StatBox icon={<Target size={12} />} label={analysis.keyMetric.label} value={analysis.keyMetric.value} color={color} />
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color, small }: { icon: React.ReactNode; label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="bg-surface-3 rounded-lg p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 mb-1" style={{ color }}>
        {icon}
        <span className="text-2xs font-medium">{label}</span>
      </div>
      <p className={`font-bold ${small ? 'text-2xs leading-tight' : 'text-sm font-mono'}`}>{value}</p>
    </div>
  );
}
