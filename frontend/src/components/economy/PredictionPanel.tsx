import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getSportColor } from '../../config/sports';
import MultiplierDisplay from './MultiplierDisplay';

interface OddsOption {
  id: string;
  label: string;
  currentOdds: number;
  baseOdds: number;
  coinsStaked: number;
  percentage: number;
}

interface OddsBoard {
  id: string;
  question: string;
  options: OddsOption[];
  totalCoins: number;
  status: string;
}

interface ParlayLeg { board: OddsBoard; optionId: string; optionLabel: string; odds: number }

interface Props { matchId: string; sportId: string }

const STAKE_QUICK = [10, 25, 50, 100, 250];

export default function PredictionPanel({ matchId, sportId }: Props) {
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const qc = useQueryClient();
  const color = getSportColor(sportId);
  const [activeTab, setActiveTab] = useState<'predict' | 'parlay'>('predict');
  const [selectedBoard, setSelectedBoard] = useState<OddsBoard | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stake, setStake] = useState(50);
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [parlayStake, setParlayStake] = useState(50);
  const [result, setResult] = useState<{ won: boolean; coinsWon?: number; message: string } | null>(null);

  const { data: oddsData, refetch } = useQuery({
    queryKey: ['odds-board', matchId],
    queryFn: () => api.get(`/odds/match/${matchId}`).then(r => r.data),
    refetchInterval: 30000,
  });

  const boards: OddsBoard[] = oddsData?.boards || [];
  const displayBoard = selectedBoard || boards[0] || null;

  const { mutate: placePred, isPending: placing } = useMutation({
    mutationFn: () => api.post('/odds', { matchId, questionId: displayBoard!.id, optionId: selectedOption, coinsStaked: stake }).then(r => r.data),
    onSuccess: (data) => {
      setResult({ won: false, message: `Prediction placed at ${data.oddsAtTime}× · potential ${data.potentialWin} ⚡` });
      qc.invalidateQueries({ queryKey: ['coin-balance'] });
      refetch();
    },
  });

  const { mutate: placeParlay, isPending: placingParlay } = useMutation({
    mutationFn: () => api.post('/odds/parlay', {
      legs: parlayLegs.map(l => ({ matchId, questionId: l.board.id, optionId: l.optionId })),
      totalStake: parlayStake,
    }).then(r => r.data),
    onSuccess: (data) => {
      setResult({ won: false, message: `${parlayLegs.length}-leg parlay placed! Potential: ${data.potentialWin} ⚡ (${data.combinedOdds}×)` });
      setParlayLegs([]);
      qc.invalidateQueries({ queryKey: ['coin-balance'] });
    },
  });

  const combinedOdds = parlayLegs.reduce((acc, l) => acc * l.odds, 1);
  const potentialParlay = Math.floor(parlayStake * combinedOdds);
  const potentialWin = selectedOption && displayBoard
    ? Math.floor(stake * ((displayBoard.options.find(o => o.id === selectedOption)?.currentOdds || 1)))
    : 0;

  if (!user) return (
    <div className="card text-center py-6">
      <p className="text-sm text-text-muted mb-3">Log in to place predictions and earn coins</p>
      <button onClick={() => openAuthModal('login')} className="px-4 py-2 rounded-lg text-sm font-bold text-black" style={{ background: color }}>
        Join the Stands
      </button>
    </div>
  );

  return (
    <div className="card space-y-3" style={{ borderTopColor: color, borderTopWidth: 2 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-2 p-0.5 rounded-lg">
          {(['predict', 'parlay'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors capitalize ${activeTab === t ? 'bg-surface-0 text-text-primary' : 'text-text-muted'}`}>
              {t === 'parlay' ? '🎰 Parlay' : '⚡ Predict'}
            </button>
          ))}
        </div>
        <MultiplierDisplay compact />
      </div>

      {result && (
        <div className="p-2.5 rounded-lg bg-football/10 border border-football/30 text-xs text-football">{result.message}</div>
      )}

      {/* PREDICTIONS TAB */}
      {activeTab === 'predict' && (
        <>
          {/* Board selector */}
          {boards.length > 1 && (
            <div className="flex gap-1 overflow-x-auto">
              {boards.map(b => (
                <button key={b.id} onClick={() => { setSelectedBoard(b); setSelectedOption(null); }}
                  className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-semibold truncate max-w-[120px] ${(selectedBoard?.id || boards[0]?.id) === b.id ? 'text-text-primary' : 'text-text-muted bg-surface-2'}`}
                  style={(selectedBoard?.id || boards[0]?.id) === b.id ? { background: color + '20', color } : {}}>
                  {b.question.slice(0, 30)}…
                </button>
              ))}
            </div>
          )}

          {displayBoard ? (
            <>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">{displayBoard.question}</p>
                <div className="space-y-2">
                  {displayBoard.options.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOption(opt.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${selectedOption === opt.id ? 'border-current' : 'border-white/10 hover:border-white/20'}`}
                      style={selectedOption === opt.id ? { borderColor: color, background: color + '15' } : {}}>
                      <div className="text-left flex-1">
                        <div className="text-xs font-semibold text-text-primary">{opt.label}</div>
                        <div className="h-1.5 bg-surface-2 rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${opt.percentage}%`, background: color + '80' }} />
                        </div>
                        <div className="text-[9px] text-text-muted mt-0.5">{opt.percentage}% · {opt.coinsStaked.toLocaleString()} ⚡ staked</div>
                      </div>
                      <div className="ml-3 text-right">
                        <div className="text-sm font-black font-mono" style={{ color: selectedOption === opt.id ? color : '#9CA3AF' }}>{opt.currentOdds}×</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {STAKE_QUICK.map(s => (
                    <button key={s} onClick={() => setStake(s)}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${stake === s ? 'text-black' : 'bg-surface-2 text-text-muted hover:text-text-primary'}`}
                      style={stake === s ? { background: color } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>⚡ Balance: {(user?.sportcoins || 0).toLocaleString()}</span>
                  {selectedOption && <span className="font-bold text-football">Win: {potentialWin} ⚡</span>}
                </div>
                <button
                  onClick={() => placePred()}
                  disabled={!selectedOption || placing}
                  className="w-full py-2 rounded-lg text-sm font-bold text-black transition-opacity disabled:opacity-40"
                  style={{ background: color }}>
                  {placing ? 'Placing...' : selectedOption ? `Back it — ${stake} ⚡` : 'Select an option'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-text-muted text-xs">No active predictions for this match yet</div>
          )}
        </>
      )}

      {/* PARLAY TAB */}
      {activeTab === 'parlay' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Build a multi-leg parlay — all legs must win</p>
          {parlayLegs.length > 0 ? (
            <div className="space-y-1.5">
              {parlayLegs.map((leg, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-surface-2 rounded-lg text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-muted truncate">{leg.board.question}</p>
                    <p className="text-text-primary font-semibold">{leg.optionLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold" style={{ color }}>{leg.odds}×</span>
                    <button onClick={() => setParlayLegs(ls => ls.filter((_, j) => j !== i))} className="text-text-muted hover:text-red-400">✕</button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold px-1">
                <span className="text-text-muted">Combined</span>
                <span style={{ color }}>{combinedOdds.toFixed(2)}×</span>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-text-muted text-xs bg-surface-2 rounded-lg">Add legs from the active questions above</div>
          )}

          {boards.map(b => (
            <div key={b.id} className="border border-white/10 rounded-lg p-2">
              <p className="text-[10px] text-text-muted mb-1.5">{b.question}</p>
              <div className="flex gap-1.5 flex-wrap">
                {b.options.map(opt => {
                  const already = parlayLegs.some(l => l.board.id === b.id);
                  return (
                    <button key={opt.id} onClick={() => {
                      if (already || parlayLegs.length >= 4) return;
                      setParlayLegs(ls => [...ls, { board: b, optionId: opt.id, optionLabel: opt.label, odds: opt.currentOdds }]);
                    }}
                      disabled={already}
                      className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors disabled:opacity-40 ${already ? 'border-football/30 text-football' : 'border-white/10 text-text-muted hover:border-white/30'}`}>
                      {opt.label} {opt.currentOdds}×
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {parlayLegs.length >= 2 && (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {[25, 50, 100, 200].map(s => (
                  <button key={s} onClick={() => setParlayStake(s)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold ${parlayStake === s ? 'text-black' : 'bg-surface-2 text-text-muted'}`}
                    style={parlayStake === s ? { background: color } : {}}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-xs text-text-muted flex justify-between">
                <span>⚠️ All legs must win</span>
                <span className="text-football font-bold">Potential: {potentialParlay} ⚡</span>
              </div>
              <button onClick={() => placeParlay()} disabled={placingParlay}
                className="w-full py-2 rounded-lg text-sm font-bold text-black" style={{ background: color }}>
                {placingParlay ? 'Placing...' : `Place ${parlayLegs.length}-leg Parlay — ${parlayStake} ⚡`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
