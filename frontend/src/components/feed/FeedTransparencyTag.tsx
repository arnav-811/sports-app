import React from 'react';

interface Props { count: number; action?: string; timeframe?: string }

export default function FeedTransparencyTag({ count, action = 'backed', timeframe = 'last hour' }: Props) {
  if (!count || count < 5) return null;
  return (
    <span className="text-[10px] text-text-muted/60 flex items-center gap-0.5">
      ↑ {count} fans with your SV Score {action} this in the {timeframe}
    </span>
  );
}
