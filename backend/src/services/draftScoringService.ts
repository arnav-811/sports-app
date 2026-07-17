// Real per-sport fantasy scoring formulas (spec Part 8). Driven by admin-entered
// raw match performance (PlayerMatchStats), not random simulation — there is no
// live sports data feed, so an admin enters what actually happened and points
// are computed deterministically from that, same pattern as Director resolution.

export interface FootballPlayerStats {
  role: 'GKP' | 'DEF' | 'MID' | 'FWD';
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  saves: number;
  yellowCards: number;
  redCards: number;
  bonusPoints: number; // 0-3
}

export function scoreFootballPlayer(s: FootballPlayerStats): number {
  let pts = 0;
  if (s.minutesPlayed >= 60) pts += 2;
  if (s.goals > 0) {
    const perGoal = s.role === 'FWD' ? 4 : s.role === 'MID' ? 5 : 6; // DEF/GKP
    pts += s.goals * perGoal;
  }
  pts += s.assists * 3;
  if (s.cleanSheet) pts += (s.role === 'GKP' || s.role === 'DEF') ? 4 : s.role === 'MID' ? 1 : 0;
  if (s.role === 'GKP') pts += Math.floor(s.saves / 3);
  pts -= s.yellowCards * 1;
  pts -= s.redCards * 3;
  pts += s.bonusPoints;
  return pts;
}

export interface CricketPlayerStats {
  runs: number;
  fours: number;
  sixes: number;
  isDismissedForZero: boolean;
  wickets: number;
  bowledOrLbwWickets: number;
  maidens: number;
  catches: number;
  stumpings: number;
  runOuts: number;
  battingPhase?: 'powerplay' | 'middle' | 'death';
  bowlingPhase?: 'powerplay' | 'middle' | 'death';
}

export function scoreCricketPlayer(s: CricketPlayerStats): number {
  let batting = s.runs * 0.5 + s.fours * 1 + s.sixes * 2;
  if (s.runs >= 100) batting += 16;
  else if (s.runs >= 50) batting += 8;
  if (s.isDismissedForZero) batting -= 2;
  if (s.battingPhase === 'powerplay') batting *= 1.5;

  let bowling = s.wickets * 25 + s.bowledOrLbwWickets * 8 + s.maidens * 4;
  if (s.bowlingPhase === 'death') bowling *= 1.5;

  const fielding = s.catches * 8 + s.stumpings * 12 + s.runOuts * 6;
  return batting + bowling + fielding;
}

export interface F1DriverStats {
  finishPosition: number | null; // null = DNF
  gridPosition: number;
  fastestLap: boolean;
}

const F1_POSITION_POINTS: Record<number, number> = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };

export function scoreF1Driver(s: F1DriverStats): number {
  if (s.finishPosition === null) return -10;
  let pts = F1_POSITION_POINTS[s.finishPosition] || 0;
  if (s.fastestLap && s.finishPosition <= 10) pts += 5;
  const gained = s.gridPosition - s.finishPosition;
  if (gained > 0) pts += gained * 2;
  if (s.gridPosition === 1) pts += 5;
  return pts;
}

export function scoreF1Constructor(driverAPoints: number, driverBPoints: number): number {
  return (driverAPoints + driverBPoints) * 1.05;
}

const TENNIS_ROUND_POINTS: Record<string, number> = {
  R128: 5, R64: 5, R32: 8, R16: 12, QF: 20, SF: 30, F: 50, W: 80,
};

export interface TennisPlayerStats {
  roundsWon: string[]; // e.g. ['R64', 'R32', 'R16'] — every round this player won
  upsetRounds?: string[]; // subset of roundsWon that were upsets (beat a player ranked 20+ higher)
}

export function scoreTennisPlayer(s: TennisPlayerStats): number {
  return s.roundsWon.reduce((sum, round) => {
    const base = TENNIS_ROUND_POINTS[round] || 0;
    const isUpset = s.upsetRounds?.includes(round);
    return sum + (isUpset ? base * 1.5 : base);
  }, 0);
}

export interface BadmintonPlayerStats {
  matchWins: number;
  straightGameWins: number; // subset of matchWins that were 2-0
  upsetWins: number; // subset of matchWins that were upsets
  gamesWith20Plus: number;
  reachedFinal: boolean;
  isTournamentWinner: boolean;
  finalMatchPoints: number; // points earned in the final match specifically (for the 2x-on-win rule)
}

export function scoreBadmintonPlayer(s: BadmintonPlayerStats): number {
  let pts = s.matchWins * 15 + s.straightGameWins * 5 + s.upsetWins * 10 + s.gamesWith20Plus * 5;
  if (s.reachedFinal) pts += 25;
  if (s.isTournamentWinner) pts += s.finalMatchPoints; // final match points count double on a win
  return pts;
}

export type SportId = 'football' | 'cricket' | 'f1' | 'tennis' | 'badminton';

/** Computes total roster points from picked player IDs + raw stats, applying captain/vice multipliers where the sport defines them. */
export function computeRosterPoints(
  sportId: SportId,
  playerIds: string[],
  statsByPlayer: Record<string, unknown>,
  captain: string | null,
  viceCaptain: string | null,
): number {
  let total = 0;
  for (const playerId of playerIds) {
    const raw = statsByPlayer[playerId];
    if (!raw) continue;

    let base = 0;
    switch (sportId) {
      case 'football': base = scoreFootballPlayer(raw as FootballPlayerStats); break;
      case 'cricket': base = scoreCricketPlayer(raw as CricketPlayerStats); break;
      case 'f1': base = scoreF1Driver(raw as F1DriverStats); break;
      case 'tennis': base = scoreTennisPlayer(raw as TennisPlayerStats); break;
      case 'badminton': base = scoreBadmintonPlayer(raw as BadmintonPlayerStats); break;
    }

    // Captain/vice-captain multipliers apply only where spec defines them (football, cricket).
    if (sportId === 'football' || sportId === 'cricket') {
      const playedAtAll = sportId === 'football' ? (raw as FootballPlayerStats).minutesPlayed > 0 : true;
      if (playerId === captain && playedAtAll) base *= 2;
      else if (playerId === viceCaptain && (captain === null || !playedAtAll)) base *= 1.5;
    }

    total += base;
  }
  return Math.round(total * 10) / 10;
}
