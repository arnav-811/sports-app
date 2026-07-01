import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { Debate } from '../../types/debate';
import DebateCard from './DebateCard';
import { Sword } from 'lucide-react';

interface Props { sport?: string }

export default function DebateFeed({ sport }: Props) {
  const { data, isLoading } = useQuery<Debate[]>({
    queryKey: ['debates', sport],
    queryFn: () => api.get(`/debates${sport ? `?sport=${sport}` : ''}`).then(r => r.data),
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-2 rounded-xl" />)}</div>;
  if (!data?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sword className="w-4 h-4 text-football" />
        <h3 className="font-bold text-sm text-text-primary">Active Debates</h3>
        <span className="text-[10px] bg-football/20 text-football px-1.5 py-0.5 rounded-full">{data.length} live</span>
      </div>
      {data.slice(0, 3).map(debate => (
        <DebateCard key={debate.id} debate={debate} />
      ))}
    </div>
  );
}
