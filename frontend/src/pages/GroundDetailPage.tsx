import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { getSportColor } from '../config/sports';
import { useAuthStore } from '../store/authStore';
import { Users, Plus } from 'lucide-react';

interface Take { id: string; title: string; voteScore: number; author: { username: string; displayName?: string }; createdAt: string; replyCount: number }
interface Ground { id: string; name: string; displayName: string; description: string; icon: string; memberCount: number; sportId: string; isNSFW: boolean; _count?: { members: number }; members?: { userId: string }[] }

export default function GroundDetailPage() {
  const { name } = useParams<{ name: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');

  const { data: ground, isLoading: groundLoading } = useQuery<Ground>({
    queryKey: ['ground', name],
    queryFn: () => api.get(`/grounds/${name}`).then(r => r.data),
    enabled: !!name,
  });

  const { data: takesData, isLoading: takesLoading } = useQuery({
    queryKey: ['ground-takes', name, sort],
    queryFn: () => api.get(`/grounds/${name}/takes`, { params: { sort } }).then(r => r.data),
    enabled: !!name,
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/grounds/${name}/join`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ground', name] }),
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.post(`/grounds/${name}/leave`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ground', name] }),
  });

  if (groundLoading) return <div className="animate-pulse space-y-3"><div className="h-32 bg-surface-2 rounded-xl" /><div className="h-64 bg-surface-2 rounded-xl" /></div>;
  if (!ground) return <div className="text-center py-12 text-text-muted">Ground not found</div>;

  const color = getSportColor(ground.sportId);
  const isMember = ground.members?.some(m => m.userId === user?.id);
  const takes: Take[] = takesData?.takes || [];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Ground header */}
      <div className="card overflow-hidden" style={{ borderTopColor: color, borderTopWidth: 3 }}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-2xl border border-white/10">
            {ground.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-text-primary">{ground.displayName}</h1>
            <p className="text-xs text-text-muted">g/{ground.name}</p>
            <p className="text-xs text-text-secondary mt-1">{ground.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <div className="font-bold text-text-primary">{(ground._count?.members || ground.memberCount || 0).toLocaleString()}</div>
              <div className="text-text-muted flex items-center gap-1"><Users className="w-3 h-3" /> members</div>
            </div>
            {user && (
              <button
                onClick={() => isMember ? leaveMutation.mutate() : joinMutation.mutate()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                style={isMember ? { background: 'rgba(255,255,255,0.08)', color: '#9CA3AF' } : { background: color + '20', color }}
              >
                {isMember ? 'Leave' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sort + new take */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-2 p-1 rounded-lg">
          {(['hot', 'new', 'top'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors capitalize ${sort === s ? 'bg-surface-0 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {s}
            </button>
          ))}
        </div>
        {isMember && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: color + '20', color }}>
            <Plus className="w-3.5 h-3.5" /> New Take
          </button>
        )}
      </div>

      {/* Takes */}
      {takesLoading
        ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 bg-surface-2 rounded-xl animate-pulse" />)}</div>
        : takes.length === 0
          ? <div className="text-center py-12 text-text-muted text-sm">No takes yet — be the first!</div>
          : takes.map(take => (
            <div key={take.id} className="card hover:border-white/20 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-0.5 min-w-[32px]">
                  <button className="text-text-muted hover:text-football text-xs leading-none">▲</button>
                  <span className="text-xs font-bold font-mono" style={take.voteScore > 0 ? { color } : { color: '#6B7280' }}>
                    {take.voteScore}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary leading-tight">{take.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                    <span>@{take.author.displayName || take.author.username}</span>
                    <span>{new Date(take.createdAt).toLocaleDateString()}</span>
                    <span>{take.replyCount} replies</span>
                  </div>
                </div>
              </div>
            </div>
          ))
      }
    </div>
  );
}
