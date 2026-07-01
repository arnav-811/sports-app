import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

interface QuestData {
  daily: Quest[];
  weekly: Quest | null;
  monthly: Quest | null;
}

export default function QuestPanel() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [open, setOpen] = useState(true);

  const { data } = useQuery<QuestData>({
    queryKey: ['user-quests'],
    queryFn: () => api.get('/quests').then(r => r.data),
    enabled: !!user,
    refetchInterval: 60000,
  });

  const { mutate: claimQuest } = useMutation({
    mutationFn: (questId: string) => api.post(`/quests/claim/${questId}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-quests'] }); qc.invalidateQueries({ queryKey: ['coin-balance'] }); },
  });

  if (!user || !data) return null;

  const allQuests = [
    ...(data.daily || []),
    ...(data.weekly ? [data.weekly] : []),
    ...(data.monthly ? [data.monthly] : []),
  ];
  const completedCount = allQuests.filter(q => q.completed).length;
  const claimable = allQuests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="card">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="text-xs font-bold text-text-primary">Quests</span>
          {claimable > 0 && (
            <span className="w-4 h-4 rounded-full bg-football text-black text-[9px] font-bold flex items-center justify-center">{claimable}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-text-muted">{completedCount}/{allQuests.length}</span>
          {open ? <ChevronDown className="w-3 h-3 text-text-muted" /> : <ChevronRight className="w-3 h-3 text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-1.5">
          {(data.daily || []).slice(0, 5).map(q => <QuestRow key={q.id} quest={q} onClaim={claimQuest} />)}
          {data.weekly && (
            <div className="pt-1.5 border-t border-white/5">
              <div className="text-[9px] text-text-muted mb-1 uppercase tracking-wide">Weekly</div>
              <QuestRow quest={data.weekly} onClaim={claimQuest} accent />
            </div>
          )}
          {data.monthly && (
            <div className="pt-1.5 border-t border-white/5">
              <div className="text-[9px] text-text-muted mb-1 uppercase tracking-wide">Monthly</div>
              <QuestRow quest={data.monthly} onClaim={claimQuest} accent />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestRow({ quest, onClaim, accent = false }: { quest: Quest; onClaim: (id: string) => void; accent?: boolean }) {
  const pct = Math.min((quest.progress / quest.target) * 100, 100);

  return (
    <div className={`rounded-lg p-2 transition-colors ${quest.claimed ? 'opacity-40' : quest.completed ? 'bg-football/10 border border-football/20' : 'bg-surface-2'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-text-primary leading-tight">{quest.title}</p>
          <p className="text-[9px] text-text-muted mt-0.5">{quest.description}</p>
          {!quest.completed && (
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-surface-0 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent ? '#F59E0B' : '#22C55E' }} />
              </div>
              <span className="text-[9px] text-text-muted font-mono">{quest.progress}/{quest.target}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          {quest.completed && !quest.claimed ? (
            <button onClick={() => onClaim(quest.id)}
              className="px-2 py-1 rounded text-[10px] font-bold bg-football text-black hover:bg-football/80">
              +{quest.reward}⚡
            </button>
          ) : (
            <span className="text-[10px] font-bold font-mono text-text-muted">{quest.reward}⚡</span>
          )}
        </div>
      </div>
    </div>
  );
}
