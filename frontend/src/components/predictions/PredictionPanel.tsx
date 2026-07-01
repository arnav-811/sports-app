import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { PredictionQuestion } from '../../types/prediction';
import { useAuthStore } from '../../store/authStore';
import { getSportColor } from '../../config/sports';

const STAKES = [25, 50, 100, 250];

interface Props { matchId: string; sportId: string }

export default function PredictionPanel({ matchId, sportId }: Props) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQ, setActiveQ] = useState(0);
  const [stake, setStake] = useState(50);
  const [chosen, setChosen] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sportColor = getSportColor(sportId);

  const { data: questions } = useQuery<PredictionQuestion[]>({
    queryKey: ['predictions', matchId],
    queryFn: () => api.get(`/predictions/match/${matchId}`).then(r => r.data),
    enabled: !!matchId,
  });

  const q = questions?.[activeQ];
  if (!user || !q) return null;

  async function placePrediction() {
    if (!chosen || !q) return;
    setSubmitting(true);
    try {
      await api.post('/predictions', {
        matchId, sportId,
        question: q.question,
        optionChosen: chosen,
        options: q.options,
        oddsAtTime: q.options.find(o => o.label === chosen)?.odds || 2.0,
        coinsStaked: stake,
      });
      setPlaced(true);
    } catch { /* show error */ } finally { setSubmitting(false); }
  }

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm text-text-secondary hover:text-text-primary"
      >
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: sportColor }} />
          <span className="font-semibold">Predict & Win Sportcoins</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-football">⚡ {user.sportcoins?.toLocaleString()}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 space-y-3">
            {placed ? (
              <div className="text-center py-3 text-sm text-football">
                ✅ Prediction locked — result pending
              </div>
            ) : (
              <>
                {questions && questions.length > 1 && (
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <button key={i} onClick={() => { setActiveQ(i); setChosen(null); }}
                        className={`flex-1 h-1 rounded-full transition-colors ${activeQ === i ? 'bg-football' : 'bg-surface-2'}`} />
                    ))}
                  </div>
                )}

                <p className="text-sm font-semibold text-text-primary">{q.question}</p>

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setChosen(opt.label)}
                      className={`p-2 rounded-lg border text-xs text-left transition-all ${
                        chosen === opt.label ? 'border-football bg-football/10' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-semibold text-text-primary">{opt.label}</div>
                      <div className="text-[10px] text-text-muted">{opt.odds.toFixed(2)}x odds</div>
                      <div className="mt-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-football/60 rounded-full" style={{ width: `${opt.coinDistribution}%` }} />
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] text-text-muted mb-1.5">War Chest (coins)</p>
                  <div className="flex gap-1.5">
                    {STAKES.map(s => (
                      <button key={s} onClick={() => setStake(s)}
                        className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                          stake === s ? 'text-black' : 'bg-surface-2 text-text-muted hover:text-white'
                        }`}
                        style={stake === s ? { background: sportColor } : {}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={placePrediction}
                  disabled={!chosen || submitting || (user.sportcoins || 0) < stake}
                  className="w-full py-2 rounded-lg font-bold text-sm disabled:opacity-40 transition-opacity"
                  style={{ background: sportColor, color: '#000' }}
                >
                  {submitting ? 'Placing...' : `Back it — ${stake} coins`}
                  {chosen && <span className="text-[10px] ml-1 opacity-70">
                    (win {Math.round(stake * ((q.options.find(o => o.label === chosen)?.odds || 2) - 1))} coins)
                  </span>}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
