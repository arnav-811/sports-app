import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { PortfolioStats } from '../../types/director';

interface Props {
  compact?: boolean;
}

export function PortfolioSummary({ compact }: Props) {
  const { data, isLoading } = useQuery<PortfolioStats>({
    queryKey: ['director-portfolio'],
    queryFn: () => api.get('/director/portfolio').then(r => r.data),
    refetchInterval: 60000,
  });

  if (isLoading || !data) {
    return (
      <div className="card p-4 animate-pulse space-y-2">
        <div className="h-4 bg-surface-3 rounded w-1/2" />
        <div className="h-8 bg-surface-3 rounded" />
        <div className="h-3 bg-surface-3 rounded w-2/3" />
      </div>
    );
  }

  const pnlPositive = data.totalPnL >= 0;
  const pnlColor = pnlPositive ? '#10B981' : '#EF4444';
  const pnlSign = pnlPositive ? '+' : '';

  if (compact) {
    return (
      <div className="card p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-1">My Portfolio</span>
          <span className="text-xs font-bold text-text-1">⚡ {data.totalValue.toLocaleString()}</span>
        </div>
        <div className="text-xs font-medium" style={{ color: pnlColor }}>
          {pnlSign}⚡ {Math.abs(data.totalPnL).toLocaleString()} ({pnlSign}{data.totalPnLPct.toFixed(1)}%)
        </div>
        <div className="text-2xs text-text-3">{data.openCount} open positions · ⚡ {data.openPositionsValue.toLocaleString()} committed</div>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-1">My Portfolio</span>
        <div className="text-right">
          <div className="text-lg font-bold text-text-1">⚡ {data.totalValue.toLocaleString()}</div>
          <div className="text-xs font-medium" style={{ color: pnlColor }}>
            {pnlSign}⚡ {Math.abs(data.totalPnL).toLocaleString()} ({pnlSign}{data.totalPnLPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-surface-2 rounded-lg p-2">
          <div className="text-2xs text-text-3 mb-0.5">Open Positions</div>
          <div className="font-bold text-text-1">⚡ {data.openPositionsValue.toLocaleString()}</div>
          <div className="text-2xs text-text-3">{data.openCount} active</div>
        </div>
        <div className="bg-surface-2 rounded-lg p-2">
          <div className="text-2xs text-text-3 mb-0.5">Coin Balance</div>
          <div className="font-bold text-text-1">⚡ {data.coinsBalance.toLocaleString()}</div>
          <div className="text-2xs text-text-3">available</div>
        </div>
      </div>

      {data.bestPosition && (
        <div className="space-y-1">
          <div className="text-2xs text-text-3 font-medium">BEST POSITION</div>
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-lg p-2">
            <span className="text-xs text-text-2 truncate flex-1 mr-2">{data.bestPosition.claim}</span>
            <span className="text-xs font-bold text-emerald-400">⚡ {data.bestPosition.currentValue.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
