import { Plus, X, Star } from 'lucide-react';
import { FantasyPlayer } from '../../types/fantasy';
import { useFantasyStore } from '../../store/fantasyStore';
import { cn } from '../../lib/utils';

interface PlayerCardProps {
  player: FantasyPlayer;
  sportColor?: string;
}

export function PlayerCard({ player, sportColor = '#00E5B4' }: PlayerCardProps) {
  const { selectedPlayers, addPlayer, removePlayer, captain, viceCaptain, setCaptain, setViceCaptain } = useFantasyStore();
  const isSelected = selectedPlayers.some((p) => p.id === player.id);
  const isCaptain = captain === player.id;
  const isVC = viceCaptain === player.id;

  return (
    <div className={cn('card p-3 flex items-center gap-3 transition-all', isSelected && 'border-[rgba(255,255,255,0.2)]')}>
      {/* Player avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-lg flex-shrink-0" style={{ border: `2px solid ${sportColor}40` }}>
        {player.position?.[0] || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{player.name}</p>
        <p className="text-xs text-text-3 truncate">{player.club || player.team || player.country} · {player.position || player.ranking && `#${player.ranking}`}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xs font-mono" style={{ color: sportColor }}>£{player.price}M</span>
          <span className="text-2xs text-text-3">Form: {player.form.toFixed(1)}</span>
          <span className="text-2xs text-text-3">{player.totalPoints} pts</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {isSelected && (
          <>
            <button onClick={() => setCaptain(player.id)} className={cn('w-6 h-6 rounded-full text-2xs font-bold transition-colors', isCaptain ? 'text-black' : 'bg-surface-4 text-text-3 hover:text-text-1')} style={isCaptain ? { backgroundColor: sportColor } : {}}>C</button>
            <button onClick={() => setViceCaptain(player.id)} className={cn('w-6 h-6 rounded-full text-2xs font-bold transition-colors', isVC ? 'text-black' : 'bg-surface-4 text-text-3 hover:text-text-1')} style={isVC ? { backgroundColor: sportColor } : {}}>V</button>
          </>
        )}
        <button
          onClick={() => isSelected ? removePlayer(player.id) : addPlayer(player)}
          className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all', isSelected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'hover:text-text-1 text-text-3 border border-[rgba(255,255,255,0.13)] hover:border-[rgba(255,255,255,0.3)]')}
        >
          {isSelected ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>
    </div>
  );
}
