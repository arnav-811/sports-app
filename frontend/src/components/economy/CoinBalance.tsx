import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import CoinHistoryDrawer from './CoinHistoryDrawer';

interface Props {
  compact?: boolean;
}

export default function CoinBalance({ compact = false }: Props) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<'earn' | 'lose' | null>(null);
  const [changeDisplay, setChangeDisplay] = useState<{ amount: number; type: 'earn' | 'lose' } | null>(null);
  const prevBalance = useRef<number | null>(null);

  const { data } = useQuery({
    queryKey: ['coin-balance'],
    queryFn: () => api.get('/coins/balance').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const balance: number = data?.balance ?? user?.sportcoins ?? 0;

  useEffect(() => {
    if (prevBalance.current !== null && prevBalance.current !== balance) {
      const diff = balance - prevBalance.current;
      const type = diff > 0 ? 'earn' : 'lose';
      setFlash(type);
      setChangeDisplay({ amount: Math.abs(diff), type });
      const t1 = setTimeout(() => setFlash(null), 600);
      const t2 = setTimeout(() => setChangeDisplay(null), 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevBalance.current = balance;
  }, [balance]);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-mono text-sm font-bold select-none
          ${flash === 'earn' ? 'bg-football/20 text-football' : flash === 'lose' ? 'bg-red-500/20 text-red-400' : 'bg-surface-2 text-text-primary hover:bg-surface-3'}`}
      >
        <span className="text-yellow-400">⚡</span>
        <span className={`transition-all duration-300 ${flash ? 'scale-110' : 'scale-100'}`}>
          {balance.toLocaleString()}
        </span>
        {changeDisplay && (
          <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold animate-fade-out pointer-events-none ${changeDisplay.type === 'earn' ? 'text-football' : 'text-red-400'}`}>
            {changeDisplay.type === 'earn' ? '+' : '-'}{changeDisplay.amount.toLocaleString()}
          </span>
        )}
      </button>
      {open && <CoinHistoryDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
