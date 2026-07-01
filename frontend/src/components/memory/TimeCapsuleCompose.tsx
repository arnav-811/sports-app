import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { api } from '../../config/api';

interface Props { matchId: string; sportId: string }

export default function TimeCapsuleCompose({ matchId, sportId }: Props) {
  const [content, setContent] = useState('');
  const [sealed, setSealed] = useState(false);
  const [sealing, setSealing] = useState(false);

  const revealDate = new Date(Date.now() + 30 * 24 * 3600000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  async function seal() {
    if (!content.trim()) return;
    setSealing(true);
    try {
      await api.post('/memories/capsules', { matchId, content, sportId });
      setSealed(true);
    } catch { /* show error */ } finally { setSealing(false); }
  }

  if (sealed) return (
    <div className="card text-center py-4">
      <div className="text-2xl mb-1">🕯️</div>
      <p className="text-sm font-semibold text-text-primary">Time Capsule sealed!</p>
      <p className="text-xs text-text-muted mt-1">Opens on {revealDate}</p>
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold text-text-primary">Write a Time Capsule</span>
      </div>
      <p className="text-[10px] text-text-muted mb-2">Revealed to this Ground in 30 days · Opens {revealDate}</p>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value.slice(0, 500))}
        placeholder="What are you feeling right now? How do you think this match ends?"
        rows={3}
        className="input-base w-full text-xs resize-none mb-2"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-muted">{content.length}/500</span>
        <button
          onClick={seal}
          disabled={!content.trim() || sealing}
          className="text-xs px-3 py-1.5 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 font-semibold disabled:opacity-40"
        >
          {sealing ? 'Sealing...' : '🕯️ Seal it'}
        </button>
      </div>
    </div>
  );
}
