import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Shield } from 'lucide-react';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { AvailablePosition } from '../../types/director';
import { useAuthStore } from '../../store/authStore';

const PRESETS = [50, 100, 250, 500, 1000];

interface Props {
  position: AvailablePosition;
  onClose: () => void;
}

export function TakePositionModal({ position, onClose }: Props) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [isCounter, setIsCounter] = useState(false);
  const [stake, setStake] = useState(100);
  const [addInsurance, setAddInsurance] = useState(false);
  const [notes, setNotes] = useState('');

  const balance = user?.sportcoins ?? 0;

  const effectiveOdds = isCounter
    ? parseFloat((1 / (1 - 1 / position.currentOdds)).toFixed(2))
    : position.currentOdds;
  const potentialWin = Math.round(stake * effectiveOdds);
  const totalCost = stake + (addInsurance ? 150 : 0);

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/director/positions/take', {
        availPosId: position.id,
        coinsStaked: stake,
        isCounter,
      }),
    onSuccess: async () => {
      if (addInsurance) {
        const posData = await api.get('/director/positions/open').then(r => r.data);
        const newPos = posData.find((p: { availPosId: string }) => p.availPosId === position.id);
        if (newPos) await api.post(`/director/positions/${newPos.id}/insure`).catch(() => {});
      }
      qc.invalidateQueries({ queryKey: ['director-dashboard'] });
      qc.invalidateQueries({ queryKey: ['director-portfolio'] });
      qc.invalidateQueries({ queryKey: ['director-positions'] });
      qc.invalidateQueries({ queryKey: ['director-market'] });
      onClose();
    },
  });

  const riskFactors: string[] = (() => {
    try { return JSON.parse(position.riskFactors); } catch { return []; }
  })();
  const supportFactors: string[] = (() => {
    try { return JSON.parse(position.supportFactors); } catch { return []; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-1 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          className="p-4 border-b border-[var(--border-color)]"
          style={{ borderLeft: `3px solid ${position.sport.color}` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-text-3 mb-1">
                <span>{position.sport.icon}</span>
                <span>{position.timeHorizon} · {position.level}</span>
              </div>
              <p className="text-sm font-bold text-text-1 leading-tight">{position.claim}</p>
            </div>
            <button onClick={onClose} className="text-text-3 hover:text-text-1 transition-colors mt-0.5 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Back / Counter toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
            {['Back it', 'Counter it'].map((label, i) => (
              <button
                key={label}
                onClick={() => setIsCounter(i === 1)}
                className={cn(
                  'flex-1 py-2 text-xs font-bold transition-colors',
                  isCounter === (i === 1)
                    ? 'text-white'
                    : 'text-text-2 hover:text-text-1 bg-surface-2',
                )}
                style={isCounter === (i === 1) ? { backgroundColor: position.sport.color } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Odds display */}
          <div className="text-center bg-surface-2 rounded-xl p-3">
            <div className="text-3xl font-mono font-bold text-text-1">{effectiveOdds.toFixed(2)}×</div>
            <div className="text-xs text-text-3 mt-0.5">
              ⚡ Stake {stake.toLocaleString()} → Win ⚡ {potentialWin.toLocaleString()}
            </div>
          </div>

          {/* Stake selector */}
          <div className="space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setStake(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    stake === p ? 'text-white' : 'bg-surface-3 text-text-2 hover:bg-surface-4',
                  )}
                  style={stake === p ? { backgroundColor: position.sport.color } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setStake(balance)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-3 text-text-3 hover:bg-surface-4"
              >
                MAX
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={position.minStake}
                max={balance}
                value={stake}
                onChange={e => setStake(Math.max(position.minStake, parseInt(e.target.value) || 0))}
                className="flex-1 bg-surface-2 border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-text-1 outline-none focus:border-text-3"
              />
              <span className="text-xs text-text-3">Balance: ⚡ {balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Insurance toggle */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 cursor-pointer hover:bg-surface-3 transition-colors">
            <input
              type="checkbox"
              checked={addInsurance}
              onChange={e => setAddInsurance(e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-1">
                <Shield size={12} />
                Add Position Insurance — ⚡ 150
              </div>
              <div className="text-2xs text-text-3 mt-0.5">
                Protects against one unexpected event (injury, suspension, withdrawal)
              </div>
            </div>
          </label>

          {/* Key factors */}
          {(riskFactors.length > 0 || supportFactors.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {supportFactors.slice(0, 2).map((f, i) => (
                <div key={i} className="text-2xs text-emerald-400 flex gap-1">
                  <span>🟢</span><span>{f}</span>
                </div>
              ))}
              {riskFactors.slice(0, 2).map((f, i) => (
                <div key={i} className="text-2xs text-red-400 flex gap-1">
                  <span>🔴</span><span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Your reasoning (private — helps you track decisions)"
            rows={2}
            className="w-full bg-surface-2 border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-text-1 placeholder:text-text-4 outline-none focus:border-text-3 resize-none"
          />

          {/* Summary and confirm */}
          <div className="space-y-2">
            {addInsurance && (
              <div className="text-xs text-text-3 text-center">
                Total cost: ⚡ {totalCost.toLocaleString()} (⚡ {stake} stake + ⚡ 150 insurance)
              </div>
            )}
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || stake < position.minStake || totalCost > balance}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: position.sport.color }}
            >
              {mutation.isPending ? 'Confirming…' : `Confirm Position — ⚡ ${totalCost.toLocaleString()}`}
            </button>
            {mutation.isError && (
              <p className="text-xs text-red-400 text-center">
                {(mutation.error as Error).message}
              </p>
            )}
            <p className="text-2xs text-text-4 text-center">
              This uses Sportcoins only. No real money involved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
