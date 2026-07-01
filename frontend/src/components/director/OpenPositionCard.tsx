import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, LogOut } from 'lucide-react';
import { api } from '../../config/api';
import { cn, timeAgo } from '../../lib/utils';
import type { Position } from '../../types/director';

function timeRemaining(dateStr: string): string {
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms <= 0) return 'Resolving…';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h remaining`;
  return `${h}h remaining`;
}

interface Props {
  position: Position;
}

export function OpenPositionCard({ position }: Props) {
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAmount, setAddAmount] = useState(100);

  const pnl = position.currentValue - position.coinsStaked;
  const pnlPct = position.coinsStaked > 0 ? (pnl / position.coinsStaked) * 100 : 0;
  const pnlPositive = pnl >= 0;

  const totalMs = position.expiresAt ? new Date(position.expiresAt).getTime() - new Date(position.createdAt).getTime() : 1;
  const elapsedMs = Date.now() - new Date(position.createdAt).getTime();
  const progressPct = Math.min(100, (elapsedMs / totalMs) * 100);

  const exitMutation = useMutation({
    mutationFn: () => api.post(`/director/positions/${position.id}/exit`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['director-positions'] }),
  });

  const addMutation = useMutation({
    mutationFn: () => api.post(`/director/positions/${position.id}/add`, { additionalCoins: addAmount }),
    onSuccess: () => {
      setShowAddForm(false);
      qc.invalidateQueries({ queryKey: ['director-positions'] });
    },
  });

  const insureMutation = useMutation({
    mutationFn: () => api.post(`/director/positions/${position.id}/insure`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['director-positions'] }),
  });

  const exitPreview = position.currentOdds <= position.entryOdds
    ? Math.round(position.coinsStaked * (position.entryOdds / position.currentOdds))
    : Math.round(position.coinsStaked * (position.entryOdds / position.currentOdds));

  return (
    <div
      className="card overflow-hidden"
      style={{ borderLeft: `3px solid ${position.sport?.color || '#555'}` }}
    >
      <div className="p-4 space-y-3">
        {/* Claim + badges */}
        <div className="flex items-start gap-2">
          <span>{position.sport?.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-1 leading-snug">{position.claim}</p>
            <div className="flex items-center gap-2 mt-1">
              {position.isCounter && (
                <span className="text-2xs text-orange-400 border border-orange-400/30 rounded px-1.5 py-0.5">COUNTER</span>
              )}
              {position.wasContrarian && (
                <span className="text-2xs text-red-400 border border-red-400/30 rounded px-1.5 py-0.5">CONTRARIAN 🎯</span>
              )}
              {position.hasInsurance && (
                <span className="text-2xs text-blue-400 flex items-center gap-0.5">
                  <Shield size={10} />INSURED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Odds + value */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-text-3">Entry</div>
            <div className="text-sm font-bold text-text-2">{position.entryOdds.toFixed(2)}×</div>
          </div>
          <div>
            <div className="text-xs text-text-3">Staked</div>
            <div className="text-sm font-bold text-text-1">⚡ {position.coinsStaked.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-text-3">Current Value</div>
            <div className={cn('text-sm font-bold', pnlPositive ? 'text-emerald-400' : 'text-red-400')}>
              ⚡ {position.currentValue.toLocaleString()}
              <span className="text-2xs ml-1">({pnlPositive ? '+' : ''}{pnlPct.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Time progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-2xs text-text-3">
            <span>{timeAgo(position.createdAt)}</span>
            <span>{timeRemaining(position.expiresAt)}</span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-text-3 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Recent events */}
        {position.events && position.events.length > 0 && (
          <div className="space-y-1">
            {position.events.slice(0, 2).map(ev => (
              <div
                key={ev.id}
                className={cn(
                  'text-2xs px-2 py-1 rounded-lg flex items-center gap-1',
                  ev.severity === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                  ev.severity === 'negative' ? 'bg-red-500/10 text-red-400' :
                  'bg-surface-3 text-text-3',
                )}
              >
                {ev.severity === 'positive' ? '↑' : ev.severity === 'negative' ? '↓' : '→'}
                <span className="truncate">{ev.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs text-text-3 hover:text-text-1 border border-[var(--border-color)] rounded-lg px-2 py-1.5 transition-colors"
          >
            <Plus size={12} /> Add ⚡
          </button>
          {!position.hasInsurance && (
            <button
              onClick={() => insureMutation.mutate()}
              disabled={insureMutation.isPending}
              className="flex items-center gap-1 text-xs text-blue-400 border border-blue-400/30 rounded-lg px-2 py-1.5 transition-colors hover:bg-blue-400/10"
            >
              <Shield size={12} /> Insure ⚡ 150
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Exit position? You'll receive ⚡ ${exitPreview.toLocaleString()}.`)) exitMutation.mutate();
            }}
            disabled={exitMutation.isPending}
            className="flex items-center gap-1 text-xs text-text-3 hover:text-red-400 border border-[var(--border-color)] hover:border-red-400/30 rounded-lg px-2 py-1.5 transition-all ml-auto"
          >
            <LogOut size={12} /> Exit (⚡ {exitPreview.toLocaleString()})
          </button>
        </div>

        {showAddForm && (
          <div className="flex gap-2 pt-1 border-t border-[var(--border-color)]">
            <input
              type="number"
              value={addAmount}
              min={50}
              onChange={e => setAddAmount(parseInt(e.target.value) || 0)}
              className="flex-1 bg-surface-2 border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-text-1 outline-none"
              placeholder="Amount to add"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending}
              className="text-xs font-bold text-white rounded-lg px-3 py-1.5"
              style={{ backgroundColor: position.sport?.color || '#555' }}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
