export interface PredictionOption {
  label: string;
  odds: number;
  coinDistribution: number;
}

export interface PredictionQuestion {
  id: string;
  matchId: string;
  sportId: string;
  question: string;
  options: PredictionOption[];
  status: 'open' | 'closed';
  closesAt: string;
}

export interface LivePrediction {
  id: string;
  userId: string;
  matchId: string;
  sportId: string;
  question: string;
  optionChosen: string;
  options: PredictionOption[];
  oddsAtTime: number;
  coinsStaked: number;
  coinsWon: number | null;
  status: 'pending' | 'won' | 'lost' | 'void';
  resolvedAt: string | null;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  referenceId: string | null;
  balance: number;
  createdAt: string;
}
