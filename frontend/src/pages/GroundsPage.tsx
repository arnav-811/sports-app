import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { useSportStore } from '../store/sportStore';
import { getSportColor } from '../config/sports';

interface Ground { id: string; name: string; displayName: string; description: string; icon: string; memberCount: number; sportId: string; sport?: { color: string; name: string } }

export default function GroundsPage() {
  const { activeSport } = useSportStore();
  const { data: grounds, isLoading } = useQuery<Ground[]>({
    queryKey: ['grounds', activeSport],
    queryFn: () => api.get('/grounds', { params: { sport: activeSport } }).then(r => r.data),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-text-primary">Grounds</h1>
      <p className="text-sm text-text-muted">Join a Ground to start taking, debating and reacting with fans of your sport.</p>
      {isLoading && <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-2 rounded-xl animate-pulse" />)}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {grounds?.map(g => (
          <Link key={g.id} to={`/g/${g.name}`}
            className="card hover:border-white/20 transition-all group"
            style={{ borderTopColor: g.sport?.color || getSportColor(g.sportId), borderTopWidth: 2 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{g.icon}</span>
              <span className="text-xs font-bold text-text-primary truncate">{g.displayName}</span>
            </div>
            <p className="text-[10px] text-text-muted line-clamp-2">{g.description}</p>
            <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
              <span>{g.memberCount.toLocaleString()} members</span>
              <span className="text-football group-hover:text-white transition-colors">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
