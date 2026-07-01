import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

interface MatchData {
  sportId: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: string | null;
  awayScore?: string | null;
  status: string;
  statsJson?: unknown;
}

interface AIAnalysis {
  summary: string;
  winProbability: { home: number; away: number; draw?: number };
  nextEventPrediction: string;
  keyMetric: { label: string; value: string };
  generatedAt: string;
  isAI: boolean;
}

const FALLBACK_ANALYSIS: Record<string, (match: MatchData) => AIAnalysis> = {
  football: (m) => ({
    summary: `${m.homeTeam} and ${m.awayTeam} are locked in a tight battle in the ${m.competition}. The current score of ${m.homeScore}-${m.awayScore} could change at any moment as both sides push for the decisive goal.`,
    winProbability: { home: 45, away: 35, draw: 20 },
    nextEventPrediction: 'Goal or substitution within next 10 minutes',
    keyMetric: { label: 'xG Difference', value: '+0.87 Home' },
    generatedAt: new Date().toISOString(),
    isAI: false,
  }),
  tennis: (m) => ({
    summary: `An absorbing match between ${m.homeTeam} and ${m.awayTeam} at ${m.competition}. The momentum has shifted multiple times and either player could emerge victorious.`,
    winProbability: { home: 52, away: 48 },
    nextEventPrediction: 'Service break likely in next 3 games',
    keyMetric: { label: 'First Serve %', value: '68%' },
    generatedAt: new Date().toISOString(),
    isAI: false,
  }),
  cricket: (m) => ({
    summary: `${m.homeTeam} are pushing hard in the ${m.competition}. The required run rate is climbing and wickets in hand will be crucial for the result.`,
    winProbability: { home: 62, away: 38 },
    nextEventPrediction: 'Boundary or wicket in next over',
    keyMetric: { label: 'Required Run Rate', value: '9.8' },
    generatedAt: new Date().toISOString(),
    isAI: false,
  }),
  f1: (m) => ({
    summary: `${m.homeTeam} leads in ${m.competition} with a comfortable margin. Tyre strategy will be the decisive factor in the closing laps of this race.`,
    winProbability: { home: 71, away: 29 },
    nextEventPrediction: 'Final pit stop window opens in 8 laps',
    keyMetric: { label: 'Gap to Leader', value: '+4.2s' },
    generatedAt: new Date().toISOString(),
    isAI: false,
  }),
  badminton: (m) => ({
    summary: `${m.homeTeam} and ${m.awayTeam} are producing a captivating contest at ${m.competition}. Smash speed and net play will determine who takes this match.`,
    winProbability: { home: 48, away: 52 },
    nextEventPrediction: 'Smash winner to decide next rally',
    keyMetric: { label: 'Max Smash Speed', value: '396 km/h' },
    generatedAt: new Date().toISOString(),
    isAI: false,
  }),
};

export async function generateMatchAnalysis(match: MatchData): Promise<AIAnalysis> {
  const openai = getOpenAI();

  if (!openai) {
    return (FALLBACK_ANALYSIS[match.sportId] || FALLBACK_ANALYSIS['football'])(match);
  }

  try {
    const prompt = `You are a professional sports analyst. Analyze this live ${match.sportId} match and respond with JSON only.

Match: ${match.homeTeam} vs ${match.awayTeam}
Competition: ${match.competition}
Score: ${match.homeScore ?? '?'} - ${match.awayScore ?? '?'}
Status: ${match.status}
Stats: ${JSON.stringify(match.statsJson)}

Respond with this exact JSON structure:
{
  "summary": "2-3 sentence live analysis",
  "winProbability": {"home": number, "away": number, "draw": number_or_null},
  "nextEventPrediction": "one prediction string",
  "keyMetric": {"label": "stat name", "value": "stat value"},
  "generatedAt": "${new Date().toISOString()}",
  "isAI": true
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    return content ? (JSON.parse(content) as AIAnalysis) : (FALLBACK_ANALYSIS[match.sportId] || FALLBACK_ANALYSIS['football'])(match);
  } catch {
    return (FALLBACK_ANALYSIS[match.sportId] || FALLBACK_ANALYSIS['football'])(match);
  }
}

export async function generateFantasyTip(playerName: string, sport: string): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    return `${playerName} is in excellent form this week — strong captain choice with high ceiling potential.`;
  }
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Give a one-sentence fantasy ${sport} captain recommendation for ${playerName}. Be specific and cite a stat.` }],
      max_tokens: 80,
    });
    return response.choices[0].message.content || `${playerName} is in excellent form — worth captaining this week.`;
  } catch {
    return `${playerName} is in excellent form this week — strong captain choice.`;
  }
}

export async function generatePostTitle(event: { type: string; player?: string; team?: string; sport: string }): Promise<string> {
  const templates: Record<string, string> = {
    goal: `⚽ GOAL! ${event.player} scores for ${event.team}!`,
    wicket: `🎳 WICKET! ${event.player} dismissed — massive moment in the game!`,
    overtake: `🏎️ OVERTAKE! ${event.player} goes past ${event.team}!`,
    ace: `🎾 ACE! ${event.player} fires down a thunderbolt!`,
    smash: `🏸 SMASH! ${event.player} with an unstoppable winner!`,
  };
  return templates[event.type] || `🚨 Major event in the ${event.sport} match!`;
}
