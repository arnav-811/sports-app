export interface Sport {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DirectorProfile {
  id: string;
  userId: string;
  reputationScore: number;
  reputationTier: string;
  totalPositions: number;
  correctPositions: number;
  accuracyRate: number;
  contrairianWins: number;
  portfolioValue: number;
  portfolioStartValue: number;
  followersCount: number;
  followingCount: number;
  intelligenceNetwork: Record<string, number>;
  timingScore: number;
  longestStreak: number;
  currentStreak: number;
  biggestWin: number;
  biggestLoss: number;
  createdAt: string;
  updatedAt: string;
}

export interface PositionEvent {
  id: string;
  positionId: string;
  eventType: string;
  description: string;
  oddsImpact: number;
  valueImpact: number;
  severity: 'positive' | 'negative' | 'neutral';
  createdAt: string;
}

export interface PositionInsurance {
  id: string;
  positionId: string;
  coinsCost: number;
  isTriggered: boolean;
  triggeredAt?: string;
  reason?: string;
  coinsReturned?: number;
}

export interface Position {
  id: string;
  directorId: string;
  sportId: string;
  sport: Sport;
  category: string;
  level: string;
  subjectType: string;
  subjectId: string;
  subjectName: string;
  claim: string;
  detail?: string;
  timeHorizon: string;
  expiresAt: string;
  entryOdds: number;
  currentOdds: number;
  coinsStaked: number;
  currentValue: number;
  isCounter: boolean;
  hasInsurance: boolean;
  status: 'open' | 'closed_win' | 'closed_loss' | 'exited_profit' | 'exited_loss' | 'void';
  coinsReturned?: number;
  profitLoss?: number;
  wasContrarian: boolean;
  communityHoldPct: number;
  resolvedAt?: string;
  exitedAt?: string;
  availPosId?: string;
  createdAt: string;
  events?: PositionEvent[];
  insurance?: PositionInsurance;
}

export interface AvailablePosition {
  id: string;
  sportId: string;
  sport: Sport;
  category: string;
  level: string;
  subjectType: string;
  subjectId: string;
  subjectName: string;
  claim: string;
  description: string;
  timeHorizon: string;
  openAt: string;
  closesAt: string;
  expiresAt: string;
  baseOdds: number;
  currentOdds: number;
  minStake: number;
  totalStaked: number;
  holdersCount: number;
  isEarlyIntel: boolean;
  requiredIntelNetwork: number;
  realWorldContext: string;
  riskFactors: string;
  supportFactors: string;
  isActive: boolean;
  resolvedAt?: string;
  outcome?: string;
}

export interface ScoutReport {
  id: string;
  positionId: string;
  sportId: string;
  subjectName: string;
  recentForm: string;
  injuryHistory: string;
  headToHead: string;
  pressureStats: string;
  venueStats: string;
  formTrend: 'rising' | 'falling' | 'stable';
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyRisks: string;
  keySupport: string;
  recommendation: 'strong_hold' | 'consider' | 'risky' | 'avoid';
  generatedAt: string;
}

export interface IntelligenceAlert {
  id: string;
  userId: string;
  positionId: string;
  alertType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContrarianResult extends AvailablePosition {
  communityHoldPctCalc: number;
  edge: number;
  modelProb: number;
  reasoning: string;
}

export interface PortfolioStats {
  totalValue: number;
  openPositionsValue: number;
  coinsBalance: number;
  totalPnL: number;
  totalPnLPct: number;
  bestPosition: Position | null;
  worstPosition: Position | null;
  openCount: number;
}

export interface ReputationTier {
  name: string;
  minScore: number;
  color: string;
  icon: string;
  maxPositions: number;
}

export interface ReputationDetails {
  current: ReputationTier;
  next: ReputationTier | null;
  progressToNext: number;
  score: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl?: string;
  reputationTier: string;
  reputationScore: number;
  accuracyRate: number;
  contrairianWins: number;
  portfolioValue: number;
  portfolioReturn: number;
  intelligenceNetwork: Record<string, number>;
  totalPositions: number;
  correctPositions: number;
  userId: string;
}

export interface DirectorDashboard {
  profile: DirectorProfile;
  openPositions: Position[];
  closedPositions: Position[];
  alerts: IntelligenceAlert[];
  followers: DirectorProfile[];
  following: DirectorProfile[];
  portfolio: {
    totalValue: number;
    openPositionsValue: number;
    coinsBalance: number;
    pnl: number;
    pnlPct: number;
  };
  reputation: ReputationDetails;
  availablePositions: AvailablePosition[];
}

export interface MirroredPosition {
  id: string;
  directorId: string;
  originalPosId: string;
  coinsStaked: number;
  entryOdds: number;
  status: string;
  coinsReturned?: number;
  profitLoss?: number;
  createdAt: string;
}

export type MarketSort = 'closing' | 'odds' | 'contrarian' | 'trending';
export type MarketFilter = {
  sportId?: string;
  category?: string;
  level?: string;
  timeHorizon?: string;
  sort?: MarketSort;
};
