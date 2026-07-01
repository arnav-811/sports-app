import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, MessageSquare } from 'lucide-react';
import { Debate } from '../../types/debate';
import { api } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { getSportColor } from '../../config/sports';

interface Props {
  debate: Debate;
  onUpdate?: (debate: Debate) => void;
}

export default function DebateCard({ debate, onUpdate }: Props) {
  const { user } = useAuthStore();
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const [argument, setArgument] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userEntry, setUserEntry] = useState(debate.userEntry);

  const sportColor = getSportColor(debate.sportId);
  const entriesA = debate.entries?.filter(e => e.side === 'A') || [];
  const entriesB = debate.entries?.filter(e => e.side === 'B') || [];
  const isOpen = debate.status === 'open' || debate.status === 'voting';
  const isClosed = debate.status === 'closed';

  const timeLeft = debate.closedAt
    ? Math.max(0, new Date(debate.closedAt).getTime() - Date.now())
    : 24 * 3600000;
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);

  async function submitArgument() {
    if (!argument.trim() || !selectedSide) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/debates/${debate.id}/enter`, { side: selectedSide, argument });
      setUserEntry(data);
    } catch { /* show error */ } finally { setSubmitting(false); }
  }

  async function voteOnEntry(entryId: string) {
    if (!user) return;
    try {
      await api.post(`/debates/${debate.id}/entries/${entryId}/vote`, {});
    } catch { /* ignore */ }
  }

  return (
    <div className="card border-t-2 overflow-hidden" style={{ borderTopColor: sportColor }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ background: `${sportColor}20`, color: sportColor }}>
              {debate.sport?.icon} {debate.sport?.name} · Debate
            </span>
            {isOpen && (
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                OPEN
              </span>
            )}
            {isClosed && <span className="text-[10px] text-text-muted">DECIDED</span>}
          </div>
          <p className="font-bold text-sm text-text-primary">{debate.question}</p>
        </div>
        {isOpen && (
          <div className="flex items-center gap-1 text-[10px] text-text-muted shrink-0">
            <Clock className="w-3 h-3" />
            {hoursLeft}h {minutesLeft}m
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {(['A', 'B'] as const).map(side => {
          const entries = side === 'A' ? entriesA : entriesB;
          const sideLabel = side === 'A' ? debate.sideA : debate.sideB;
          const isWinner = isClosed && debate.winningSide === side;
          const sideColor = side === 'A' ? sportColor : '#FF0038';
          const topEntry = entries.sort((a, b) => b.votes - a.votes)[0];

          return (
            <button
              key={side}
              onClick={() => isOpen && !userEntry && setSelectedSide(side)}
              disabled={!isOpen || !!userEntry}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedSide === side ? 'border-current' : 'border-white/10 hover:border-white/20'
              } ${isWinner ? 'ring-1 ring-yellow-500/50' : ''}`}
              style={selectedSide === side ? { borderColor: sideColor, background: `${sideColor}10` } : {}}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold" style={{ color: sideColor }}>Side {side}</span>
                {isWinner && <Trophy className="w-3 h-3 text-yellow-400" />}
              </div>
              <p className="text-xs text-text-secondary leading-tight">{sideLabel}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-text-muted">
                <MessageSquare className="w-3 h-3" />
                {entries.length} arguments
              </div>
              {topEntry && (
                <p className="text-[10px] text-text-muted mt-1 italic leading-tight line-clamp-2">
                  "{topEntry.argument}"
                </p>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedSide && !userEntry && isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-text-muted mb-2">Make your case (280 chars max):</p>
              <textarea
                value={argument}
                onChange={e => setArgument(e.target.value.slice(0, 280))}
                placeholder="Make your case in 280 chars..."
                rows={2}
                className="input-base w-full text-xs resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-text-muted">{argument.length}/280</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedSide(null)} className="text-xs text-text-muted hover:text-white">Cancel</button>
                  <button
                    onClick={submitArgument}
                    disabled={!argument.trim() || submitting}
                    className="text-xs px-3 py-1.5 rounded font-semibold disabled:opacity-40"
                    style={{ background: getSportColor(debate.sportId), color: '#000' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {userEntry && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-[10px] text-text-muted mb-2">Your argument <span className="text-green-400">✓ Submitted (Side {userEntry.side})</span></p>
          <p className="text-xs italic text-text-secondary">"{userEntry.argument}"</p>
          {debate.entries && debate.entries.filter(e => e.userId !== user?.id && e.side !== userEntry.side).slice(0, 2).map(entry => (
            <div key={entry.id} className="mt-2 flex items-start gap-2 p-2 bg-surface-2 rounded">
              <p className="text-[11px] text-text-secondary flex-1 italic">"{entry.argument}"</p>
              <button onClick={() => voteOnEntry(entry.id)} className="text-[10px] text-football shrink-0">👍 {entry.votes}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
