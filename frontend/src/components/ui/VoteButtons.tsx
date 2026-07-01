import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

interface VoteButtonsProps {
  score: number;
  userVote?: number | null;
  onVote: (value: 1 | -1) => void;
  vertical?: boolean;
  disabled?: boolean;
}

export function VoteButtons({ score, userVote, onVote, vertical = false, disabled }: VoteButtonsProps) {
  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <button
        onClick={() => onVote(1)}
        disabled={disabled}
        className={cn('p-1 rounded transition-colors', userVote === 1 ? 'text-orange-400' : 'text-text-3 hover:text-orange-400 hover:bg-surface-4')}
      >
        <ChevronUp size={16} />
      </button>
      <span className={cn('text-xs font-bold font-mono', userVote === 1 ? 'text-orange-400' : userVote === -1 ? 'text-blue-400' : 'text-text-2')}>
        {formatNumber(score)}
      </span>
      <button
        onClick={() => onVote(-1)}
        disabled={disabled}
        className={cn('p-1 rounded transition-colors', userVote === -1 ? 'text-blue-400' : 'text-text-3 hover:text-blue-400 hover:bg-surface-4')}
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
