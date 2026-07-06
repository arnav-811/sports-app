export interface PositionTemplate {
  category: 'player' | 'team' | 'trend' | 'counter';
  level: 'speculative' | 'calculated' | 'conviction';
  subjectType: 'player' | 'team' | 'tournament_outcome' | 'statistical_trend';
  timeHorizon: 'match' | 'week' | 'month' | 'tournament' | 'season';
  claimTemplate: string;
  oddsRange: [number, number];
}

export const FOOTBALL_TEMPLATES: PositionTemplate[] = [
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will score in {competition} this gameweek', oddsRange: [1.6, 2.5] },
  { category: 'player', level: 'conviction', subjectType: 'player', timeHorizon: 'season', claimTemplate: '{player} will finish {competition} as top scorer', oddsRange: [2.0, 8.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will win Player of the Match in {fixture}', oddsRange: [3.0, 6.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will complete 90 minutes in {fixture}', oddsRange: [1.4, 2.2] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will get a clean sheet in {fixture}', oddsRange: [1.8, 3.5] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'week', claimTemplate: '{player} will be transferred before the deadline', oddsRange: [2.5, 7.0] },
  { category: 'team', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: "{team}'s xG will exceed {number} this gameweek", oddsRange: [1.9, 3.5] },
  { category: 'team', level: 'calculated', subjectType: 'team', timeHorizon: 'match', claimTemplate: '{team} will win their next match', oddsRange: [1.5, 2.8] },
  { category: 'team', level: 'conviction', subjectType: 'team', timeHorizon: 'season', claimTemplate: '{team} will finish top 4 this season', oddsRange: [1.2, 3.0] },
  { category: 'team', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'tournament', claimTemplate: '{team} will win {competition}', oddsRange: [1.5, 8.0] },
  { category: 'team', level: 'calculated', subjectType: 'team', timeHorizon: 'match', claimTemplate: '{team} will keep a clean sheet in {fixture}', oddsRange: [1.8, 3.5] },
  { category: 'team', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'The match between {teamA} and {teamB} will have over 2.5 goals', oddsRange: [1.6, 2.5] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'week', claimTemplate: 'There will be more than {X} red cards in {competition} this gameweek', oddsRange: [2.5, 5.0] },
  { category: 'trend', level: 'speculative', subjectType: 'tournament_outcome', timeHorizon: 'season', claimTemplate: 'The next {competition} winner will be from outside the current top 3', oddsRange: [3.0, 8.0] },
  { category: 'counter', level: 'calculated', subjectType: 'player', timeHorizon: 'week', claimTemplate: '{player} will NOT score in next 3 matches', oddsRange: [1.8, 3.0] },
  { category: 'counter', level: 'speculative', subjectType: 'tournament_outcome', timeHorizon: 'season', claimTemplate: '{team} will NOT win the championship', oddsRange: [1.2, 2.0] },
];

export const CRICKET_TEMPLATES: PositionTemplate[] = [
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will score 50+ runs in {match}', oddsRange: [1.9, 3.2] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will take 3+ wickets in {match}', oddsRange: [2.2, 4.5] },
  { category: 'player', level: 'conviction', subjectType: 'player', timeHorizon: 'tournament', claimTemplate: '{player} will finish IPL as leading wicket-taker', oddsRange: [2.0, 6.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will be dismissed in single digits in {match}', oddsRange: [2.5, 5.0] },
  { category: 'team', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'tournament', claimTemplate: '{team} will win the {tournament}', oddsRange: [1.8, 7.0] },
  { category: 'team', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: '{team} will win the toss and bat first', oddsRange: [1.8, 2.2] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'This match will go to the final over', oddsRange: [2.0, 4.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'There will be a century in {match}', oddsRange: [1.8, 3.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'The run rate will exceed 9 in the last 5 overs', oddsRange: [1.9, 3.5] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will be named Player of the Match', oddsRange: [3.0, 6.0] },
  { category: 'trend', level: 'calculated', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'This Test will result in a draw', oddsRange: [2.5, 5.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'tournament', claimTemplate: '{player} will score a century in this series', oddsRange: [1.8, 4.0] },
];

export const TENNIS_TEMPLATES: PositionTemplate[] = [
  { category: 'player', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'tournament', claimTemplate: '{player} will win {tournament}', oddsRange: [1.4, 5.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will win their next match in straight sets', oddsRange: [1.6, 3.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'tournament', claimTemplate: '{player} will lose before the quarterfinals', oddsRange: [2.5, 6.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'The {tournament} final will go to 5 sets', oddsRange: [2.0, 4.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will break serve in the first game', oddsRange: [2.0, 3.5] },
  { category: 'player', level: 'calculated', subjectType: 'tournament_outcome', timeHorizon: 'tournament', claimTemplate: '{player} will win the next Grand Slam they play', oddsRange: [1.8, 5.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'A player ranked outside top 10 will win {tournament}', oddsRange: [4.0, 10.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'tournament', claimTemplate: '{player} will retire mid-tournament due to injury', oddsRange: [5.0, 12.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'The {tournament} will be won by someone outside the top 4 seeds', oddsRange: [3.5, 8.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will hit 15+ aces in their next match', oddsRange: [2.0, 4.5] },
];

export const F1_TEMPLATES: PositionTemplate[] = [
  { category: 'player', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'match', claimTemplate: '{driver} will win {race}', oddsRange: [1.5, 6.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{driver} will take pole position at {race}', oddsRange: [1.8, 5.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{driver} will finish on the podium at {race}', oddsRange: [1.5, 4.0] },
  { category: 'player', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'season', claimTemplate: '{driver} will win the championship', oddsRange: [1.4, 8.0] },
  { category: 'team', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'season', claimTemplate: "{constructor} will win the Constructors' Championship", oddsRange: [1.3, 6.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'match', claimTemplate: 'There will be a safety car at {race}', oddsRange: [1.6, 2.5] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{driver} will DNF at {race}', oddsRange: [3.0, 8.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{driver} will gain 5+ positions from grid to finish at {race}', oddsRange: [2.5, 5.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'month', claimTemplate: 'More than 3 different drivers will win the next 4 races', oddsRange: [2.5, 6.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{driver} will beat their teammate in qualifying at {race}', oddsRange: [1.6, 2.8] },
];

export const BADMINTON_TEMPLATES: PositionTemplate[] = [
  { category: 'player', level: 'conviction', subjectType: 'tournament_outcome', timeHorizon: 'tournament', claimTemplate: '{player} will win {tournament}', oddsRange: [1.5, 5.0] },
  { category: 'player', level: 'calculated', subjectType: 'player', timeHorizon: 'match', claimTemplate: '{player} will win their next match in straight games', oddsRange: [1.5, 2.8] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'The final at {tournament} will go to 3 games', oddsRange: [1.9, 3.5] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'A player outside the top 5 will reach the final', oddsRange: [2.5, 5.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'month', claimTemplate: '{player} will win the next 3 consecutive tournaments', oddsRange: [4.0, 10.0] },
  { category: 'trend', level: 'speculative', subjectType: 'statistical_trend', timeHorizon: 'tournament', claimTemplate: 'The {tournament} will be won by a player from {country}', oddsRange: [2.0, 5.0] },
  { category: 'player', level: 'speculative', subjectType: 'player', timeHorizon: 'tournament', claimTemplate: '{player} will retire from a match due to injury', oddsRange: [5.0, 12.0] },
];

export const ALL_TEMPLATES: Record<string, PositionTemplate[]> = {
  football: FOOTBALL_TEMPLATES,
  cricket: CRICKET_TEMPLATES,
  tennis: TENNIS_TEMPLATES,
  f1: F1_TEMPLATES,
  badminton: BADMINTON_TEMPLATES,
};

export const REPUTATION_TIERS = [
  { name: 'Rookie', minScore: 0, maxScore: 499, color: '#9CA3AF', icon: '🌱', maxPositions: 3 },
  { name: 'Scout', minScore: 500, maxScore: 1499, color: '#3B82F6', icon: '👁️', maxPositions: 5 },
  { name: 'Analyst', minScore: 1500, maxScore: 2999, color: '#10B981', icon: '📊', maxPositions: 8 },
  { name: 'Strategist', minScore: 3000, maxScore: 5999, color: '#F97316', icon: '♟️', maxPositions: 12 },
  { name: 'Director', minScore: 6000, maxScore: 8999, color: '#EF4444', icon: '🎯', maxPositions: 999 },
  { name: 'Elite Director', minScore: 9000, maxScore: 9999, color: '#F59E0B', icon: '⭐', maxPositions: 999 },
  { name: 'Sporting Legend', minScore: 10000, maxScore: Infinity, color: '#8B5CF6', icon: '🏆', maxPositions: 999 },
];

export function getReputationTier(score: number) {
  return REPUTATION_TIERS.find(t => score >= t.minScore && score <= t.maxScore) || REPUTATION_TIERS[0];
}

export function calculateReputationScore(profile: {
  accuracyRate: number;
  contrairianWins: number;
  timingScore: number;
  intelligenceNetwork: string;
  followersCount: number;
}): number {
  let network: Record<string, number> = {};
  try { network = JSON.parse(profile.intelligenceNetwork); } catch { network = {}; }
  const maxIntel = Math.max(0, ...Object.values(network));
  return Math.round(
    (profile.accuracyRate * 4000) +
    (profile.contrairianWins * 200) +
    (profile.timingScore * 2000) +
    (maxIntel / 100 * 1500) +
    (profile.followersCount * 10)
  );
}

// Seed data for current week's landscape
export const THIS_WEEK_LANDSCAPE = {
  summary: 'UCL Quarter Finals · IPL Playoffs · Roland Garros R16 · Miami GP',
  sports: {
    football: {
      event: 'UCL Quarter Finals 2nd Legs + PL GW34',
      positions: 10,
      highlight: 'Haaland to score in UCL — 68% community hold',
    },
    cricket: {
      event: 'IPL 2026 Playoff Phase',
      positions: 12,
      highlight: 'MI to win IPL — only 11% hold (contrarian pick)',
    },
    tennis: {
      event: 'Roland Garros Round of 16',
      positions: 8,
      highlight: 'Alcaraz to win Roland Garros — 74% community hold',
    },
    f1: {
      event: 'Miami Grand Prix Race Week',
      positions: 10,
      highlight: 'Safety car at Miami — trending position',
    },
    badminton: {
      event: 'BWF World Tour Finals',
      positions: 8,
      highlight: 'Final to go 3 games — 52% community hold',
    },
  },
};
