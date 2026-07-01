import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { X } from 'lucide-react';

export default function GoneDarkAlert() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ['gone-dark-status'],
    queryFn: () => api.get('/coins/gone-dark-status').then(r => r.data).catch(() => null),
    enabled: !!user && !dismissed,
    staleTime: 300000,
  });

  if (!user || dismissed || !data?.wasGoneDark) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4">
      <div className="bg-surface-1 border border-red-500/30 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🌑</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">You went dark</p>
            <p className="text-xs text-text-muted mt-0.5">
              You were inactive for 72h during an active rivalry. <span className="text-red-400 font-semibold">-{data.coinsLost} ⚡</span> penalty applied.
              {data.rivalName && ` ${data.rivalName} earned the bonus.`}
            </p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text-primary flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
