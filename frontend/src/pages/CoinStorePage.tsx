import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import CoinBalance from '../components/economy/CoinBalance';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  icon: string;
  isLimited: boolean;
  stock: number | null;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'advantage', label: '⚔️ Advantage' },
  { id: 'social', label: '🤝 Social' },
  { id: 'cosmetic', label: '✨ Cosmetic' },
  { id: 'access', label: '🔓 Access' },
];

export default function CoinStorePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [category, setCategory] = useState('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['coin-store'],
    queryFn: () => api.get('/coins/store').then(r => r.data),
    enabled: !!user,
  });

  const { data: purchases } = useQuery({
    queryKey: ['my-purchases'],
    queryFn: () => api.get('/coins/purchases').then(r => r.data),
    enabled: !!user,
  });

  const { mutate: buy } = useMutation({
    mutationFn: (itemId: string) => api.post(`/coins/store/purchase/${itemId}`).then(r => r.data),
    onMutate: (itemId) => setPurchasing(itemId),
    onSuccess: (_, itemId) => {
      setPurchasing(null);
      setSuccess(itemId);
      setTimeout(() => setSuccess(null), 3000);
      qc.invalidateQueries({ queryKey: ['coin-balance'] });
      qc.invalidateQueries({ queryKey: ['my-purchases'] });
    },
    onError: () => setPurchasing(null),
  });

  const items: StoreItem[] = (data?.items || []).filter((i: StoreItem) => category === 'all' || i.category === category);
  const purchasedIds = new Set((purchases?.purchases || []).map((p: any) => p.itemId));
  const balance = user?.sportcoins || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text-primary text-sm">← Back</button>
          <h1 className="text-xl font-black text-text-primary">Coin Store</h1>
        </div>
        <CoinBalance />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl overflow-x-auto">
        {CATEGORY_TABS.map(tab => (
          <button key={tab.id} onClick={() => setCategory(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === tab.id ? 'bg-surface-0 text-text-primary' : 'text-text-muted'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-football/10 border border-football/30 text-xs text-football font-semibold">
          ✅ Purchase successful!
        </div>
      )}

      <div className="space-y-2">
        {items.map((item: StoreItem) => {
          const owned = purchasedIds.has(item.id);
          const canAfford = balance >= item.cost;
          const buying = purchasing === item.id;

          return (
            <div key={item.id} className={`rounded-xl p-4 border flex items-center gap-3 ${
              owned ? 'bg-surface-2 border-white/10 opacity-70' : 'bg-surface-1 border-white/10 hover:border-white/20 transition-colors'
            }`}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">{item.name}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    item.category === 'advantage' ? 'bg-red-500/20 text-red-400'
                    : item.category === 'social' ? 'bg-blue-500/20 text-blue-400'
                    : item.category === 'cosmetic' ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{item.category}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-black font-mono text-yellow-400">{item.cost.toLocaleString()} ⚡</div>
                <button
                  onClick={() => !owned && canAfford && buy(item.id)}
                  disabled={owned || !canAfford || buying}
                  className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    owned ? 'bg-surface-0 text-text-muted cursor-default'
                    : !canAfford ? 'bg-surface-0 text-red-400/50 cursor-not-allowed'
                    : buying ? 'bg-yellow-400/20 text-yellow-400'
                    : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                  }`}>
                  {owned ? 'Owned' : buying ? '...' : !canAfford ? 'Can\'t afford' : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && !data && (
          <div className="py-8 text-center">
            <div className="w-5 h-5 border-2 border-football border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
