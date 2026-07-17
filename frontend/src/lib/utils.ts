import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatScore(home: string | undefined | null, away: string | undefined | null): string {
  if (!home && !away) return 'vs';
  return `${home ?? '0'} – ${away ?? '0'}`;
}

export function getSportColorClass(sportId: string): string {
  const map: Record<string, string> = {
    football: 'text-sport-football',
    tennis: 'text-sport-tennis',
    cricket: 'text-sport-cricket',
    f1: 'text-sport-f1',
    badminton: 'text-sport-badminton',
  };
  return map[sportId] || 'text-text-2';
}

export function getSportBgClass(sportId: string): string {
  const map: Record<string, string> = {
    football: 'bg-sport-football',
    tennis: 'bg-sport-tennis',
    cricket: 'bg-sport-cricket',
    f1: 'bg-sport-f1',
    badminton: 'bg-sport-badminton',
  };
  return map[sportId] || 'bg-surface-4';
}
