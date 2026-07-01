import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../config/api';
import { Debate } from '../types/debate';
import DebateCard from '../components/debate/DebateCard';
import { useSportStore } from '../store/sportStore';
import { SPORTS, getSportColor } from '../config/sports';
import { Sword } from 'lucide-react';

const FILTER_TABS = ['All Sports', ...SPORTS.map(s => s.id)];

export default function DebatesPage() {
  const { activeSport } = useSportStore();
  const [filter, setFilter] = useState(activeSport);
  const [showAll, setShowAll] = useState(false);
  const color = getSportColor(filter);

  const { data: debates, isLoading } = useQuery<Debate[]>({
    queryKey: ['debates', filter],
    queryFn: () => api.get(`/debates${filter !== 'all' ? `?sport=${filter}` : ''}`).then(r => r.data),
    refetchInterval: 60000,
  });

  const visible = showAll ? (debates || []) : (debates || []).slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sword className="w-5 h-5" style={{ color }} />
        <h1 className="text-xl font-black text-text-primary">Debates</h1>
        {debates?.length ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
            {debates.length} live
          </span>
        ) : null}
      </div>

      {/* Sport filter */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-surface-2 p-1 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-surface-0 text-text-primary' : 'text-text-muted'}`}
        >
          All Sports
        </button>
        {SPORTS.map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s.id ? 'text-text-primary' : 'text-text-muted'}`}
            style={filter === s.id ? { background: s.color + '20', color: s.color } : {}}
          >
            {s.icon} {s.shortName}
          </button>
        ))}
      </div>

      {/* Debate list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-surface-2 rounded-xl animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="card py-12 text-center">
          <Sword className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">No active debates for this sport right now.</p>
          <p className="text-text-muted text-xs mt-1">Check back after the next match!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((debate, i) => (
            <motion.div key={debate.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <DebateCard debate={debate} />
            </motion.div>
          ))}
          {!showAll && (debates?.length || 0) > 6 && (
            <button onClick={() => setShowAll(true)} className="w-full py-2 text-xs text-text-muted hover:text-text-primary bg-surface-2 rounded-xl transition-colors">
              Show {(debates?.length || 0) - 6} more debates
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
