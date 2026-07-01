export interface RivalryStats {
  id: string;
  rivalryId: string;
  challengerWins: number;
  challengedWins: number;
  draws: number;
  totalBattles: number;
  challengerSVHistory: number[];
  challengedSVHistory: number[];
  lastBattleAt: string | null;
  streakHolder: string | null;
  streakLength: number;
}

export interface Rivalry {
  id: string;
  challengerId: string;
  challengedId: string;
  status: 'pending' | 'active' | 'declined';
  createdAt: string;
  acceptedAt: string | null;
  stats: RivalryStats | null;
  challenger: { id: string; username: string; displayName: string | null; avatarUrl: string | null; svScore: number; cred: number };
  challenged: { id: string; username: string; displayName: string | null; avatarUrl: string | null; svScore: number; cred: number };
}
