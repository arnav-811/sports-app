export interface DebateEntry {
  id: string;
  debateId: string;
  userId: string;
  side: 'A' | 'B';
  argument: string;
  votes: number;
  isTopArgument: boolean;
  createdAt: string;
  user?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; svScore?: number };
}

export interface Debate {
  id: string;
  question: string;
  sideA: string;
  sideB: string;
  matchId: string | null;
  sportId: string;
  trigger: string;
  status: 'open' | 'voting' | 'closed';
  openAt: string;
  closedAt: string | null;
  winningSide: 'A' | 'B' | null;
  totalVoters: number;
  createdAt: string;
  entries?: DebateEntry[];
  sport?: { id: string; name: string; color: string; icon: string };
  userEntry?: DebateEntry | null;
  timeRemaining?: number;
  _count?: { entries: number };
}
