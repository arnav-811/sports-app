import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import type { Position } from '../../types/director';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  closed_win: { label: '✅ Won', color: '#10B981', bg: '#10B98115' },
  closed_loss: { label: '❌ Lost', color: '#EF4444', bg: '#EF444415' },
  exited_profit: { label: '↗ Exited +', color: '#10B981', bg: '#10B98115' },
  exited_loss: { label: '↘ Exited −', color: '#F97316', bg: '#F9731615' },
  void: { label: '⊘ Void', color: '#9CA3AF', bg: '#9CA3AF15' },
};

type FilterType = 'all' | 'wins' | 'losses' | 'exits';

interface Props {
  positions: Position[];
}

export function PositionHistoryTable({ positions }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<'date' | 'pnl' | 'odds'>('date');

  const filtered = positions.filter(p => {
    if (filter === 'wins') return p.status === 'closed_win';
    if (filter === 'losses') return p.status === 'closed_loss';
    if (filter === 'exits') return p.status === 'exited_profit' || p.status === 'exited_loss';
    return true;
  }).sort((a, b) => {
    if (sortKey === 'pnl') return (b.profitLoss || 0) - (a.profitLoss || 0);
    if (sortKey === 'odds') return b.entryOdds - a.entryOdds;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalStaked = filtered.reduce((s, p) => s + p.coinsStaked, 0);
  const totalReturned = filtered.reduce((s, p) => s + (p.coinsReturned || 0), 0);
  const totalPnL = totalReturned - totalStaked;
  const accuracy = filtered.length > 0
    ? (filtered.filter(p => p.status === 'closed_win').length / filtered.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'wins', 'losses', 'exits'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
              filter === f ? 'bg-text-1 text-surface-1' : 'bg-surface-3 text-text-2 hover:bg-surface-4',
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {(['date', 'pnl', 'odds'] as const).map(k => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={cn(
                'px-2 py-1 rounded text-2xs capitalize transition-colors',
                sortKey === k ? 'text-text-1' : 'text-text-3 hover:text-text-2',
              )}
            >
              {k === 'pnl' ? 'P&L' : k}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-text-3">
                <th className="text-left p-3 font-medium">Claim</th>
                <th className="text-right p-3 font-medium">Odds</th>
                <th className="text-right p-3 font-medium">Staked</th>
                <th className="text-right p-3 font-medium">Return</th>
                <th className="text-right p-3 font-medium">P&L</th>
                <th className="text-right p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.map(p => {
                const cfg = STATUS_CONFIG[p.status] || { label: p.status, color: '#9CA3AF', bg: '' };
                const pnl = p.profitLoss ?? 0;
                return (
                  <tr key={p.id} style={{ backgroundColor: cfg.bg }}>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span>{p.sport?.icon}</span>
                        <span className="text-text-1 font-medium line-clamp-1 max-w-40">{p.claim}</span>
                      </div>
                      <div className="text-text-4 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3 text-right font-mono text-text-2">{p.entryOdds.toFixed(2)}×</td>
                    <td className="p-3 text-right text-text-2">⚡ {p.coinsStaked.toLocaleString()}</td>
                    <td className="p-3 text-right text-text-2">⚡ {(p.coinsReturned || 0).toLocaleString()}</td>
                    <td className={cn('p-3 text-right font-bold', pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {pnl >= 0 ? '+' : ''}⚡ {Math.abs(pnl).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <div className="border-t-2 border-[var(--border-color)] p-3 flex gap-4 text-xs flex-wrap">
          <span className="text-text-3">Total Staked: <span className="text-text-1 font-bold">⚡ {totalStaked.toLocaleString()}</span></span>
          <span className="text-text-3">Total Returned: <span className="text-text-1 font-bold">⚡ {totalReturned.toLocaleString()}</span></span>
          <span className={cn('font-bold', totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            Overall P&L: {totalPnL >= 0 ? '+' : ''}⚡ {Math.abs(totalPnL).toLocaleString()}
          </span>
          <span className="text-text-3">Accuracy: <span className="text-text-1 font-bold">{accuracy}%</span></span>
        </div>
      </div>
    </div>
  );
}
