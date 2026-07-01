import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { cn } from '../../lib/utils';
import type { IntelligenceAlert } from '../../types/director';
import { timeAgo } from '../../lib/utils';

const ALERT_CONFIG: Record<string, { icon: string; label: string; severity: 'high' | 'medium' | 'low' }> = {
  injury: { icon: '🚑', label: 'Injury News', severity: 'high' },
  suspension: { icon: '🟥', label: 'Suspension', severity: 'high' },
  form_drop: { icon: '📉', label: 'Form Drop', severity: 'medium' },
  form_rise: { icon: '📈', label: 'Form Rise', severity: 'low' },
  transfer: { icon: '🔄', label: 'Transfer News', severity: 'medium' },
  milestone: { icon: '🏆', label: 'Milestone', severity: 'low' },
  odds_change: { icon: '📊', label: 'Odds Move', severity: 'medium' },
};

interface Props {
  alerts: IntelligenceAlert[];
}

export function IntelligenceAlertCenter({ alerts }: Props) {
  const qc = useQueryClient();

  const readMutation = useMutation({
    mutationFn: (id: string) => api.post(`/director/intel/alerts/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['director-dashboard'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: () =>
      Promise.all(alerts.filter(a => !a.isRead).map(a => api.post(`/director/intel/alerts/${a.id}/read`))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['director-dashboard'] }),
  });

  const high = alerts.filter(a => ALERT_CONFIG[a.alertType]?.severity === 'high');
  const medium = alerts.filter(a => ALERT_CONFIG[a.alertType]?.severity === 'medium');
  const low = alerts.filter(a => ALERT_CONFIG[a.alertType]?.severity === 'low');

  const groups = [
    { label: '⚠️ High', items: high, color: '#EF4444' },
    { label: '📊 Medium', items: medium, color: '#F97316' },
    { label: 'ℹ️ Low', items: low, color: '#9CA3AF' },
  ].filter(g => g.items.length > 0);

  if (alerts.length === 0) {
    return (
      <div className="card p-8 text-center text-text-3">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-sm">No active alerts. All positions stable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-3">{alerts.filter(a => !a.isRead).length} unread</span>
        <button
          onClick={() => readAllMutation.mutate()}
          disabled={readAllMutation.isPending}
          className="text-xs text-text-3 hover:text-text-1 transition-colors"
        >
          Mark all read
        </button>
      </div>

      {groups.map(group => (
        <div key={group.label} className="space-y-2">
          <div className="text-xs font-bold" style={{ color: group.color }}>{group.label}</div>
          {group.items.map(alert => {
            const cfg = ALERT_CONFIG[alert.alertType] || { icon: '📋', label: alert.alertType, severity: 'low' };
            return (
              <div
                key={alert.id}
                className={cn(
                  'card p-3 space-y-2 transition-opacity',
                  alert.isRead && 'opacity-50',
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-text-1">{cfg.label}</div>
                    <p className="text-xs text-text-2 mt-0.5">{alert.message}</p>
                    <div className="text-2xs text-text-4 mt-1">{timeAgo(alert.createdAt)}</div>
                  </div>
                  {!alert.isRead && (
                    <button
                      onClick={() => readMutation.mutate(alert.id)}
                      className="text-2xs text-text-3 hover:text-text-1 flex-shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
