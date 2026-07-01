import { prisma } from '../lib/prisma';

interface SVScoreBreakdown {
  fantasyScore: number;
  predictionScore: number;
  directorScore: number;
  credScore: number;
  breadthScore: number;
  consistencyScore: number;
  total: number;
}

export async function calculateSVScore(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      cred: true, predictionCount: true, correctPredictions: true,
      dailyStreak: true, activeSports: true,
      draftRosters: { select: { rank: true, league: { select: { _count: { select: { rosters: true } } } } } },
      directorProfile: { select: { reputationScore: true } },
    },
  });
  if (!user) return 0;

  // Fantasy score: percentile rank across leagues
  let fantasyScore = 0;
  if (user.draftRosters.length > 0) {
    const percentiles = user.draftRosters.map(r => {
      if (!r.rank || !r.league._count.rosters) return 0;
      return Math.max(0, (1 - r.rank / r.league._count.rosters) * 10000);
    });
    fantasyScore = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;
  }

  // Prediction score
  let predictionScore = 0;
  if (user.predictionCount >= 10) {
    predictionScore = (user.correctPredictions / user.predictionCount) * 10000;
  }

  // Director score: based on Director Reputation (0–10000)
  const directorScore = user.directorProfile
    ? Math.min(10000, user.directorProfile.reputationScore)
    : 0;

  // Cred score: log scale capped at 50k
  const credScore = (Math.log10(user.cred + 1) / Math.log10(50001)) * 10000;

  // Breadth score: sports active in last 30 days
  let activeSports: string[] = [];
  try { activeSports = JSON.parse(user.activeSports); } catch { activeSports = []; }
  const breadthScore = (Math.min(activeSports.length, 5) / 5) * 10000;

  // Consistency score: daily streak capped at 365
  const consistencyScore = (Math.min(user.dailyStreak, 365) / 365) * 10000;

  const total = Math.round(
    fantasyScore * 0.25 +
    predictionScore * 0.20 +
    directorScore * 0.20 +
    credScore * 0.15 +
    breadthScore * 0.10 +
    consistencyScore * 0.10
  );

  const breakdown: SVScoreBreakdown = {
    fantasyScore: Math.round(fantasyScore),
    predictionScore: Math.round(predictionScore),
    directorScore: Math.round(directorScore),
    credScore: Math.round(credScore),
    breadthScore: Math.round(breadthScore),
    consistencyScore: Math.round(consistencyScore),
    total,
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      svScore: total,
      svScoreBreakdown: JSON.stringify(breakdown),
      svScoreUpdatedAt: new Date(),
    },
  });

  await prisma.sVScoreHistory.create({
    data: { userId, score: total, breakdown: JSON.stringify(breakdown) },
  });

  return total;
}

export async function getSVScoreRank(userId: string): Promise<{ rank: number; total: number; percentile: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { svScore: true } });
  if (!user) return { rank: 0, total: 0, percentile: 0 };
  const [rank, total] = await Promise.all([
    prisma.user.count({ where: { svScore: { gt: user.svScore } } }),
    prisma.user.count(),
  ]);
  return { rank: rank + 1, total, percentile: total > 0 ? Math.round(((total - rank) / total) * 100) : 0 };
}

export async function updateAllSVScores(): Promise<void> {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    try { await calculateSVScore(user.id); } catch { /* non-fatal per user */ }
  }
}

export function getSVScoreTier(score: number): { name: string; color: string } {
  if (score >= 9501) return { name: 'Legend', color: '#FFD700' };
  if (score >= 8001) return { name: 'Elite', color: '#FF0038' };
  if (score >= 6001) return { name: 'Expert', color: '#FFD23F' };
  if (score >= 4001) return { name: 'Enthusiast', color: '#00E5B4' };
  if (score >= 2001) return { name: 'Fan', color: '#3B82F6' };
  return { name: 'Getting Started', color: '#6B7280' };
}
