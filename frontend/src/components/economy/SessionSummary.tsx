import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { X } from 'lucide-react';

export default function SessionSummary() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) {
      const t = setTimeout(() => { setOpen(true); setShown(true); }, 1800000); // 30 mins
      return () => clearTimeout(t);
    }
  }, [shown]);

  const { data } = useQuery({
    queryKey: ['session-summary'],
    queryFn: () => api.get('/coins/stats').then(r => r.data),
    enabled: !!user && open,
  });

  if (!user || !open || !data) return null;

  const net = (data.sessionEarned || 0) - (data.sessionSpent || 0) - (data.sessionLost || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-surface-1 border border-white/10 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-text-primary">Session Summary</h2>
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div className={`text-center py-4 rounded-xl ${net >= 0 ? 'bg-football/10' : 'bg-red-500/10'}`}>
            <div className={`text-3xl font-black font-mono ${net >= 0 ? 'text-football' : 'text-red-400'}`}>
              {net >= 0 ? '+' : ''}{net.toLocaleString()} ⚡
            </div>
            <div className="text-xs text-text-muted mt-1">Net this session</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-2 rounded-lg p-2">
              <div className="text-sm font-bold font-mono text-football">+{(data.sessionEarned || 0).toLocaleString()}</div>
              <div className="text-[9px] text-text-muted">Earned</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-2">
              <div className="text-sm font-bold font-mono text-yellow-400">-{(data.sessionSpent || 0).toLocaleString()}</div>
              <div className="text-[9px] text-text-muted">Staked</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-2">
              <div className="text-sm font-bold font-mono text-red-400">-{(data.sessionLost || 0).toLocaleString()}</div>
              <div className="text-[9px] text-text-muted">Lost</div>
            </div>
          </div>

          {data.sessionCorrect > 0 && (
            <div className="flex items-center justify-between text-xs p-2 bg-surface-2 rounded-lg">
              <span className="text-text-muted">Prediction accuracy</span>
              <span className="font-bold text-text-primary">
                {data.sessionCorrect}/{data.sessionPredictions} ({((data.sessionCorrect / data.sessionPredictions) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>

        <button onClick={() => setOpen(false)}
          className="w-full mt-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-muted text-sm rounded-lg transition-colors">
          Keep going
        </button>
      </div>
    </div>
  );
}
