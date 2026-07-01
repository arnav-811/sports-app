export interface Sport {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Match {
  id: string;
  sportId: string;
  externalId?: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  status: 'upcoming' | 'live' | 'finished';
  startTime: string;
  venue?: string;
  statsJson?: FootballStats | TennisStats | CricketStats | F1Stats | BadmintonStats | Record<string, unknown>;
  sport: Sport;
}

export interface FootballStats {
  minute: number;
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  xg: { home: number; away: number };
  formation?: { home: string; away: string };
}

export interface TennisStats {
  set: number;
  game: string;
  serving: string;
  aces: { home: number; away: number };
  doubleFaults: { home: number; away: number };
  firstServe: { home: number; away: number };
  winners: { home: number; away: number };
  unforced: { home: number; away: number };
}

export interface CricketStats {
  innings: number;
  over: string;
  requiredRunRate: number;
  currentRunRate: number;
  lastWicket: string;
  partnershipRuns: number;
  partnershipBalls: number;
  recentBalls: string[];
}

export interface F1Stats {
  lap: number;
  totalLaps: number;
  gap: string;
  fastestLap: { driver: string; time: string };
  safetyCarDeployed: boolean;
  drsEnabled: boolean;
}

export interface BadmintonStats {
  game: number;
  rallyCount: number;
  smashSpeed: { home: number; away: number };
  totalPoints: { home: number; away: number };
}

export interface AIAnalysis {
  summary: string;
  winProbability: { home: number; away: number; draw?: number };
  nextEventPrediction: string;
  keyMetric: { label: string; value: string };
  generatedAt: string;
  isAI: boolean;
}
