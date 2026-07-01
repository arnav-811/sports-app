export interface PredictionTemplate {
  id: string;
  sport: string;
  question: (data: Record<string, string>) => string;
  options: { id: string; label: string; baseOdds: number }[];
  trigger: string; // when to show
}

export const PREDICTION_TEMPLATES: PredictionTemplate[] = [
  // FOOTBALL
  {
    id: 'football_score_next_10',
    sport: 'football',
    question: (d) => `Will ${d.homeTeam} score in the next 10 minutes?`,
    options: [{ id: 'yes', label: 'Yes', baseOdds: 2.1 }, { id: 'no', label: 'No', baseOdds: 1.7 }],
    trigger: 'minute_lt_60',
  },
  {
    id: 'football_corners',
    sport: 'football',
    question: () => 'Total corners in this match?',
    options: [
      { id: '0_4', label: '0-4', baseOdds: 3.5 },
      { id: '5_7', label: '5-7', baseOdds: 1.9 },
      { id: '8_10', label: '8-10', baseOdds: 2.4 },
      { id: '11_plus', label: '11+', baseOdds: 4.0 },
    ],
    trigger: 'minute_lt_30',
  },
  {
    id: 'football_yellow_card',
    sport: 'football',
    question: () => 'Will there be a yellow card in the next 15 minutes?',
    options: [{ id: 'yes', label: 'Yes', baseOdds: 2.3 }, { id: 'no', label: 'No', baseOdds: 1.6 }],
    trigger: 'anytime',
  },
  {
    id: 'football_match_result',
    sport: 'football',
    question: (d) => 'Match result at full time?',
    options: [
      { id: 'home', label: (d: Record<string, string>) => d.homeTeam + ' Win', baseOdds: 2.1 } as unknown as { id: string; label: string; baseOdds: number },
      { id: 'draw', label: 'Draw', baseOdds: 3.2 },
      { id: 'away', label: (d: Record<string, string>) => d.awayTeam + ' Win', baseOdds: 3.0 } as unknown as { id: string; label: string; baseOdds: number },
    ],
    trigger: 'always',
  },

  // CRICKET
  {
    id: 'cricket_runs_next_over',
    sport: 'cricket',
    question: () => 'Runs scored in the next over?',
    options: [
      { id: '0_5', label: '0-5', baseOdds: 2.8 },
      { id: '6_9', label: '6-9', baseOdds: 1.9 },
      { id: '10_13', label: '10-13', baseOdds: 2.4 },
      { id: '14_plus', label: '14+', baseOdds: 4.2 },
    ],
    trigger: 'before_over',
  },
  {
    id: 'cricket_wickets_2_overs',
    sport: 'cricket',
    question: () => 'Wickets in the next 2 overs?',
    options: [
      { id: '0', label: '0', baseOdds: 1.8 },
      { id: '1', label: '1', baseOdds: 2.2 },
      { id: '2_plus', label: '2+', baseOdds: 3.8 },
    ],
    trigger: 'anytime',
  },
  {
    id: 'cricket_match_winner',
    sport: 'cricket',
    question: (d) => 'Match winner?',
    options: [
      { id: 'home', label: (d: Record<string, string>) => d.homeTeam, baseOdds: 1.9 } as unknown as { id: string; label: string; baseOdds: number },
      { id: 'away', label: (d: Record<string, string>) => d.awayTeam, baseOdds: 2.1 } as unknown as { id: string; label: string; baseOdds: number },
    ],
    trigger: 'chase_active',
  },
  {
    id: 'cricket_maiden',
    sport: 'cricket',
    question: () => 'Will this over be a maiden?',
    options: [{ id: 'yes', label: 'Yes', baseOdds: 4.5 }, { id: 'no', label: 'No', baseOdds: 1.2 }],
    trigger: 'death_overs',
  },

  // F1
  {
    id: 'f1_safety_car',
    sport: 'f1',
    question: () => 'Safety car in the next 10 laps?',
    options: [{ id: 'yes', label: 'Yes', baseOdds: 3.2 }, { id: 'no', label: 'No', baseOdds: 1.4 }],
    trigger: 'every_10_laps',
  },
  {
    id: 'f1_race_winner',
    sport: 'f1',
    question: () => 'Race winner?',
    options: [
      { id: 'p1', label: 'Current P1', baseOdds: 1.6 },
      { id: 'p2', label: 'Current P2', baseOdds: 3.5 },
      { id: 'p3', label: 'Current P3', baseOdds: 6.0 },
      { id: 'other', label: 'Other', baseOdds: 8.0 },
    ],
    trigger: 'always',
  },
  {
    id: 'f1_fastest_lap',
    sport: 'f1',
    question: () => 'Fastest lap — which driver?',
    options: [
      { id: 'p1', label: 'Current P1', baseOdds: 2.2 },
      { id: 'p2', label: 'Current P2', baseOdds: 2.8 },
      { id: 'p3', label: 'Current P3', baseOdds: 3.5 },
      { id: 'other', label: 'Other', baseOdds: 4.5 },
    ],
    trigger: 'last_10_laps',
  },

  // TENNIS
  {
    id: 'tennis_hold_serve',
    sport: 'tennis',
    question: (d) => `Will ${d.homeTeam} hold serve this game?`,
    options: [{ id: 'yes', label: 'Yes', baseOdds: 1.6 }, { id: 'no', label: 'No', baseOdds: 2.4 }],
    trigger: 'before_service_game',
  },
  {
    id: 'tennis_tiebreak',
    sport: 'tennis',
    question: () => 'Will this set go to a tiebreak?',
    options: [{ id: 'yes', label: 'Yes', baseOdds: 2.8 }, { id: 'no', label: 'No', baseOdds: 1.5 }],
    trigger: 'set_at_4_4',
  },
  {
    id: 'tennis_match_winner',
    sport: 'tennis',
    question: () => 'Match winner?',
    options: [
      { id: 'home', label: 'Player 1', baseOdds: 1.8 },
      { id: 'away', label: 'Player 2', baseOdds: 2.2 },
    ],
    trigger: 'always',
  },

  // BADMINTON
  {
    id: 'badminton_smash_380',
    sport: 'badminton',
    question: () => 'Will there be a smash over 380 km/h in the next game?',
    options: [{ id: 'yes', label: 'Yes', baseOdds: 2.1 }, { id: 'no', label: 'No', baseOdds: 1.8 }],
    trigger: 'before_new_game',
  },
  {
    id: 'badminton_game_winner',
    sport: 'badminton',
    question: () => 'Game winner?',
    options: [
      { id: 'home', label: 'Player 1', baseOdds: 1.8 },
      { id: 'away', label: 'Player 2', baseOdds: 2.1 },
    ],
    trigger: 'always',
  },
  {
    id: 'badminton_next_3_points',
    sport: 'badminton',
    question: () => 'Who wins the next 3 consecutive points?',
    options: [
      { id: 'home', label: 'Player 1 (clean run)', baseOdds: 3.5 },
      { id: 'away', label: 'Player 2 (clean run)', baseOdds: 3.5 },
      { id: 'split', label: 'Split (no clean run)', baseOdds: 1.4 },
    ],
    trigger: 'score_at_10_plus',
  },
];

export function getTemplatesForSport(sportId: string, count = 4): PredictionTemplate[] {
  const sportTemplates = PREDICTION_TEMPLATES.filter(t => t.sport === sportId);
  // Shuffle and take count
  const shuffled = [...sportTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function adjustOdds(baseOdds: number, coinsOnOption: number, totalCoins: number): number {
  if (totalCoins === 0) return baseOdds;
  const pct = coinsOnOption / totalCoins;
  let multiplier = 1.0;
  if (pct > 0.75) multiplier = 0.70;
  else if (pct > 0.60) multiplier = 0.85;
  else if (pct < 0.25) multiplier = 1.30;
  else if (pct < 0.40) multiplier = 1.15;
  const adjusted = baseOdds * multiplier;
  return Math.max(1.1, Math.min(8.0, Math.round(adjusted * 100) / 100));
}
