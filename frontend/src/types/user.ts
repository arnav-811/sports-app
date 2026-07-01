export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface SVScoreBreakdown {
  fantasyScore: number;
  predictionScore: number;
  credScore: number;
  breadthScore: number;
  consistencyScore: number;
  total: number;
}

export interface SportStamp {
  id: string;
  sportId: string;
  level: number;
  levelName: string;
  xp: number;
  xpToNextLevel: number;
  matchesFollowed: number;
  takesPosted: number;
  debatesEntered: number;
  predictionsPlaced: number;
  draftWarsPlayed: number;
  badgesEarned: string[];
  sport?: { id: string; name: string; color: string; icon: string };
}

export interface SportPassport {
  id: string;
  userId: string;
  stamps: SportStamp[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  cred: number;
  xp: number;
  isPremium: boolean;
  emailVerified: boolean;
  favoriteSports: string[];
  favoriteClubs: string[];
  country: string | null;
  city: string | null;
  svScore: number;
  svScoreBreakdown: SVScoreBreakdown | null;
  svScoreUpdatedAt: string | null;
  sportcoins: number;
  dailyStreak: number;
  predictionCount: number;
  correctPredictions: number;
  debateWins: number;
  debateLosses: number;
  debateWinRate: number;
  createdAt: string;
  updatedAt: string;
  badges?: UserBadge[];
  passport?: SportPassport;
}
