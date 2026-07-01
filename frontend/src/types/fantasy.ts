export interface FantasyLeague {
  id: string;
  sportId: string;
  name: string;
  format: 'fpl' | 'dream11' | 'constructor' | 'bracket' | 'squad';
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  deadline: string;
  matchId?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { teams: number };
}

export interface FantasyTeam {
  id: string;
  userId: string;
  leagueId: string;
  name: string;
  playersJson: { players: FantasyPlayer[]; captain?: string; viceCaptain?: string };
  totalPoints: number;
  rank?: number;
  createdAt: string;
  updatedAt: string;
  league?: FantasyLeague;
  user?: { username: string; avatarUrl?: string; level: number };
}

export interface FantasyPlayer {
  id: string;
  name: string;
  club?: string;
  team?: string;
  country?: string;
  position?: string;
  price: number;
  form: number;
  totalPoints: number;
  imageUrl?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  ranking?: number;
}
