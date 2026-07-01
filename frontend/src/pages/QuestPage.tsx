import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
}

interface QuestData { daily: Quest[]; weekly: Quest | null; monthly: Quest | null }

export default function QuestPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<QuestData>({
    queryKey: ['user-quests'],
    queryFn: () => api.get('/quests').then(r => r.data),
    enabled: !!user,
  });

  const { mutate: claimQuest } = useMutation({
    mutationFn: (id: string) => api.post(`/quests/claim/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-quests'] });
      qc.invalidateQueries({ queryKey: ['coin-balance'] });
    },
  });

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-text-muted">Sign in to view your quests</p>
    </div>
  );

  if (isLoading || !data) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-6 h-6 border-2 border-football border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  const allQuests = [...(data.daily || []), ...(data.weekly ? [data.weekly] : []), ...(data.monthly ? [data.monthly] : [])];
  const claimableCount = allQuests.filter(q => q.completed && !q.claimed).length;
  const totalPotential = allQuests.filter(q => !q.claimed).reduce((acc, q) => acc + q.reward, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text-primary text-sm">← Back</button>
        <h1 className="text-xl font-black text-text-primary">Quests</h1>
        {claimableCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-football text-black text-xs font-bold">{claimableCount} ready</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-black font-mono text-football">{allQuests.filter(q => q.completed).length}/{allQuests.length}</div>
          <div className="text-xs text-text-muted">Completed today</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-black font-mono text-yellow-400">{totalPotential.toLocaleString()} ⚡</div>
          <div className="text-xs text-text-muted">Potential rewards</div>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-text-primary">Daily Quests</h2>
        <p className="text-[10px] text-text-muted">Resets midnight</p>
        {(data.daily || []).map(q => <QuestCard key={q.id} quest={q} onClaim={claimQuest} />)}
        {(data.daily || []).length === 0 && <p className="text-xs text-text-muted py-2">No daily quests — check back later</p>}
      </section>

      {data.weekly && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-text-primary">Weekly Quest</h2>
          <p className="text-[10px] text-text-muted">Resets Sunday midnight</p>
          <QuestCard quest={data.weekly} onClaim={claimQuest} highlight />
        </section>
      )}

      {data.monthly && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-text-primary">Monthly Quest</h2>
          <p className="text-[10px] text-text-muted">Resets end of month</p>
          <QuestCard quest={data.monthly} onClaim={claimQuest} highlight />
        </section>
      )}
    </div>
  );
}

function QuestCard({ quest, onClaim, highlight = false }: { quest: Quest; onClaim: (id: string) => void; highlight?: boolean }) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100);
  const accentColor = highlight ? '#F59E0B' : '#22C55E';

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      quest.claimed ? 'opacity-40 bg-surface-2 border-white/5'
      : quest.completed ? 'bg-football/10 border-football/30'
      : 'bg-surface-1 border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">{quest.title}</h3>
            {quest.claimed && <span className="text-[9px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">Claimed</span>}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{quest.description}</p>
          {!quest.completed && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-text-muted mb-1">
                <span>Progress</span>
                <span className="font-mono">{quest.progress} / {quest.target}</span>
              </div>
              <div className="h-2 bg-surface-0 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accentColor }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="font-black font-mono text-sm text-text-muted">{quest.reward} ⚡</div>
          {quest.completed && !quest.claimed && (
            <button onClick={() => onClaim(quest.id)}
              className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-football text-black hover:bg-football/80">
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
