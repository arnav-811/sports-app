import { prisma } from '../lib/prisma';
import * as coinService from './coinService';
import { getReputationTier, calculateReputationScore } from '../data/positionTemplates';

async function notify(userId: string, type: string, title: string, body: string, link?: string) {
  await prisma.notification.create({ data: { userId, type, title, body, link: link || '/director', isRead: false } });
}

function parseNetwork(raw: string): Record<string, number> {
  try { return JSON.parse(raw); } catch { return { football: 0, tennis: 0, cricket: 0, f1: 0, badminton: 0 }; }
}

function incrementNetwork(raw: string, sportId: string, delta: number): string {
  const net = parseNetwork(raw);
  net[sportId] = Math.min(100, Math.max(0, (net[sportId] || 0) + delta));
  return JSON.stringify(net);
}

export async function getOrCreateDirectorProfile(userId: string) {
  const existing = await prisma.directorProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true } });
  return prisma.directorProfile.create({
    data: {
      userId,
      portfolioValue: user.sportcoins,
      portfolioStartValue: user.sportcoins,
    },
  });
}

export async function getAvailablePositions(userId: string, filters: {
  sportId?: string; category?: string; level?: string; timeHorizon?: string; sort?: string;
}) {
  const profile = await getOrCreateDirectorProfile(userId);
  const network = parseNetwork(profile.intelligenceNetwork);

  const heldIds = await prisma.position.findMany({
    where: { director: { userId }, status: 'open', availPosId: { not: null } },
    select: { availPosId: true },
  }).then(rows => rows.map(r => r.availPosId!));

  const where: Record<string, unknown> = {
    isActive: true,
    closesAt: { gt: new Date() },
    ...(filters.sportId ? { sportId: filters.sportId } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.timeHorizon ? { timeHorizon: filters.timeHorizon } : {}),
    ...(heldIds.length > 0 ? { id: { notIn: heldIds } } : {}),
  };

  const positions = await prisma.availablePosition.findMany({
    where,
    include: { sport: true },
    orderBy: filters.sort === 'odds' ? { currentOdds: 'desc' }
      : filters.sort === 'contrarian' ? { holdersCount: 'asc' }
      : { closesAt: 'asc' },
  });

  // Filter by intel network requirement
  return positions.filter(p => {
    if (p.isEarlyIntel) {
      const tier = getReputationTier(profile.reputationScore);
      if (tier.name !== 'Director' && tier.name !== 'Elite Director' && tier.name !== 'Sporting Legend') return false;
    }
    if (p.requiredIntelNetwork > 0) {
      const sportScore = network[p.sportId] || 0;
      if (sportScore < p.requiredIntelNetwork) return false;
    }
    return true;
  });
}

export async function takePosition(userId: string, availPosId: string, coinsStaked: number, isCounter: boolean) {
  const profile = await getOrCreateDirectorProfile(userId);
  const tier = getReputationTier(profile.reputationScore);

  const openCount = await prisma.position.count({ where: { director: { userId }, status: 'open' } });
  if (openCount >= tier.maxPositions) throw new Error(`Tier limit: ${tier.name} can hold ${tier.maxPositions} positions`);

  const avail = await prisma.availablePosition.findUniqueOrThrow({ where: { id: availPosId } });
  if (!avail.isActive || avail.closesAt < new Date()) throw new Error('Position is no longer available');
  if (coinsStaked < avail.minStake) throw new Error(`Minimum stake is ${avail.minStake} coins`);

  const entryOdds = isCounter
    ? parseFloat((1 / (1 - 1 / avail.currentOdds)).toFixed(2))
    : avail.currentOdds;

  const wasContrarian = avail.holdersCount < 10
    ? false
    : (avail.holdersCount / Math.max(1, avail.holdersCount + 1)) < 0.15;

  await coinService.spendCoins(userId, coinsStaked, 'director_take_position', `Position: ${avail.claim}`);

  const position = await prisma.position.create({
    data: {
      directorId: profile.id,
      sportId: avail.sportId,
      category: avail.category,
      level: avail.level,
      subjectType: avail.subjectType,
      subjectId: avail.subjectId,
      subjectName: avail.subjectName,
      claim: avail.claim,
      timeHorizon: avail.timeHorizon,
      expiresAt: avail.expiresAt,
      entryOdds,
      currentOdds: entryOdds,
      coinsStaked,
      currentValue: coinsStaked,
      isCounter,
      wasContrarian,
      communityHoldPct: avail.holdersCount > 0
        ? (avail.holdersCount / (avail.holdersCount + 1)) * 100
        : 0,
      availPosId,
    },
    include: { sport: true },
  });

  await prisma.availablePosition.update({
    where: { id: availPosId },
    data: { holdersCount: { increment: 1 }, totalStaked: { increment: coinsStaked } },
  });

  await prisma.directorProfile.update({
    where: { id: profile.id },
    data: {
      totalPositions: { increment: 1 },
      intelligenceNetwork: incrementNetwork(profile.intelligenceNetwork, avail.sportId, 1),
    },
  });

  return position;
}

export async function addToPosition(userId: string, positionId: string, additionalCoins: number) {
  const position = await prisma.position.findFirstOrThrow({
    where: { id: positionId, director: { userId }, status: 'open' },
  });
  await coinService.spendCoins(userId, additionalCoins, 'director_add_position', `Add to: ${position.claim}`);
  return prisma.position.update({
    where: { id: positionId },
    data: {
      coinsStaked: { increment: additionalCoins },
      currentValue: { increment: additionalCoins },
    },
  });
}

export async function exitPosition(userId: string, positionId: string) {
  const position = await prisma.position.findFirstOrThrow({
    where: { id: positionId, director: { userId }, status: 'open' },
    include: { director: true },
  });

  const { coinsStaked, entryOdds, currentOdds } = position;
  let status: string;
  let profitLoss: number;
  let coinsReturned: number;

  if (currentOdds <= entryOdds) {
    // Odds moved in user's favour — profit
    const exitValue = Math.round(coinsStaked * (entryOdds / currentOdds));
    const profit = exitValue - coinsStaked;
    await coinService.addCoins(userId, exitValue, 'director_early_exit_profit', `Early exit profit: ${position.claim}`, positionId);
    status = 'exited_profit';
    profitLoss = profit;
    coinsReturned = exitValue;
  } else {
    // Odds moved against user — loss
    const exitValue = Math.round(coinsStaked * (entryOdds / currentOdds));
    const loss = coinsStaked - exitValue;
    if (exitValue > 0) {
      await coinService.addCoins(userId, exitValue, 'director_early_exit_profit', `Early exit partial return: ${position.claim}`, positionId);
    }
    await coinService.loseCoins(userId, loss, 'director_early_exit_loss', `Early exit loss: ${position.claim}`, positionId);
    status = 'exited_loss';
    profitLoss = -loss;
    coinsReturned = exitValue;
  }

  const updated = await prisma.position.update({
    where: { id: positionId },
    data: { status, exitedAt: new Date(), profitLoss, coinsReturned, currentValue: coinsReturned },
  });

  // Update intelligence network timing score
  const timingDelta = status === 'exited_profit' ? 1 : -0.5;
  await prisma.directorProfile.update({
    where: { id: position.directorId },
    data: {
      intelligenceNetwork: incrementNetwork(position.director.intelligenceNetwork, position.sportId, timingDelta),
      timingScore: { increment: status === 'exited_profit' ? 0.05 : -0.02 },
    },
  });

  await notify(userId, 'director_exit', `Position Exited`, `${position.claim} — ${profitLoss >= 0 ? '+' : ''}⚡ ${profitLoss}`);
  return updated;
}

export async function resolvePosition(availPosId: string, outcome: 'win' | 'loss') {
  const avail = await prisma.availablePosition.findUniqueOrThrow({ where: { id: availPosId } });
  const positions = await prisma.position.findMany({
    where: { availPosId, status: 'open' },
    include: { director: { include: { user: true } }, insurance: true },
  });

  for (const pos of positions) {
    const userId = pos.director.user.id;
    const isWin = (outcome === 'win' && !pos.isCounter) || (outcome === 'loss' && pos.isCounter);

    if (isWin) {
      const coinsWon = Math.round(pos.coinsStaked * pos.entryOdds);
      await coinService.addCoins(userId, coinsWon, 'director_position_win', `Won: ${pos.claim}`, pos.id);

      if (pos.wasContrarian) {
        await coinService.addCoins(userId, 400, 'director_contrarian_bonus', `Contrarian bonus: ${pos.claim}`, pos.id);
      }

      // Check first speculative win
      const prevWins = await prisma.position.count({ where: { directorId: pos.directorId, status: 'closed_win' } });
      if (prevWins === 0) {
        await coinService.addCoins(userId, 200, 'director_first_spec_win', 'First Director position win!', pos.id);
      }

      const newCorrect = pos.director.correctPositions + 1;
      const newStreak = pos.director.currentStreak + 1;
      const longestStreak = Math.max(pos.director.longestStreak, newStreak);
      const profit = coinsWon - pos.coinsStaked;

      let streakBonus = 0;
      if (newStreak === 5) streakBonus = 300;

      if (streakBonus > 0) {
        await coinService.addCoins(userId, streakBonus, 'director_5_consecutive', '5 consecutive winning positions!', pos.id);
      }

      const newPortfolio = pos.director.portfolioValue + profit;
      let portfolioBonus = 0;
      if (newPortfolio >= pos.director.portfolioStartValue * 2 && pos.director.portfolioValue < pos.director.portfolioStartValue * 2) {
        portfolioBonus = 500;
        await coinService.addCoins(userId, portfolioBonus, 'director_portfolio_double', 'Portfolio doubled!', pos.id);
      }

      const newNetwork = incrementNetwork(pos.director.intelligenceNetwork, pos.sportId, 3);
      const newAccuracy = newCorrect / pos.director.totalPositions;

      await prisma.directorProfile.update({
        where: { id: pos.directorId },
        data: {
          correctPositions: { increment: 1 },
          accuracyRate: newAccuracy,
          currentStreak: newStreak,
          longestStreak,
          portfolioValue: { increment: profit },
          biggestWin: coinsWon > pos.director.biggestWin ? coinsWon : undefined,
          intelligenceNetwork: newNetwork,
          timingScore: { increment: 0.1 },
        },
      });

      await prisma.position.update({
        where: { id: pos.id },
        data: { status: 'closed_win', coinsReturned: coinsWon, profitLoss: profit, resolvedAt: new Date(), currentValue: coinsWon },
      });

      // Resolve mirrors
      const mirrors = await prisma.mirroredPosition.findMany({ where: { originalPosId: pos.id, status: 'open' } });
      for (const mirror of mirrors) {
        const mirrorWin = Math.round(mirror.coinsStaked * mirror.entryOdds);
        const mirrorDirector = await prisma.directorProfile.findUniqueOrThrow({ where: { id: mirror.directorId }, include: { user: true } });
        await coinService.addCoins(mirrorDirector.user.id, mirrorWin, 'director_position_win', `Mirror win: ${pos.claim}`, mirror.id);
        await prisma.mirroredPosition.update({ where: { id: mirror.id }, data: { status: 'closed_win', coinsReturned: mirrorWin, profitLoss: mirrorWin - mirror.coinsStaked } });
        // Bonus to original director per mirror
        await coinService.addCoins(userId, 50, 'director_follower_mirrors', `Mirror follower won: ${mirrorDirector.user.username}`, pos.id);
      }

      await notify(userId, 'director_win', '🎯 Position Won!', `${pos.claim} — +⚡ ${profit}`, `/director`);

    } else {
      // Loss
      if (pos.insurance && !pos.insurance.isTriggered) {
        const refund = pos.coinsStaked - pos.insurance.coinsCost;
        await coinService.addCoins(userId, refund, 'director_position_win', `Insurance triggered: ${pos.claim}`, pos.id);
        await prisma.positionInsurance.update({
          where: { id: pos.insurance.id },
          data: { isTriggered: true, triggeredAt: new Date(), reason: 'Position resolved as loss', coinsReturned: refund },
        });
        await notify(userId, 'director_insurance', '🛡️ Insurance Triggered', `${pos.claim} — ⚡ ${refund} refunded`, `/director`);
      } else {
        await notify(userId, 'director_loss', '❌ Position Lost', `${pos.claim} — ⚡ ${pos.coinsStaked} lost`, `/director`);
      }

      await prisma.directorProfile.update({
        where: { id: pos.directorId },
        data: {
          currentStreak: 0,
          portfolioValue: { decrement: pos.coinsStaked },
          biggestLoss: pos.coinsStaked > pos.director.biggestLoss ? pos.coinsStaked : undefined,
          accuracyRate: pos.director.correctPositions / pos.director.totalPositions,
          intelligenceNetwork: incrementNetwork(pos.director.intelligenceNetwork, pos.sportId, -1),
          timingScore: { increment: -0.05 },
        },
      });

      await prisma.position.update({
        where: { id: pos.id },
        data: { status: 'closed_loss', coinsReturned: 0, profitLoss: -pos.coinsStaked, resolvedAt: new Date(), currentValue: 0 },
      });

      // Mirrors lost too
      const mirrors = await prisma.mirroredPosition.findMany({ where: { originalPosId: pos.id, status: 'open' } });
      for (const mirror of mirrors) {
        await prisma.mirroredPosition.update({ where: { id: mirror.id }, data: { status: 'closed_loss', coinsReturned: 0, profitLoss: -mirror.coinsStaked } });
      }
    }
  }

  const resolved = await prisma.availablePosition.update({
    where: { id: availPosId },
    data: { outcome, resolvedAt: new Date(), isActive: false },
  });
  return { position: resolved, positionsResolved: positions.length };
}

export async function purchaseInsurance(userId: string, positionId: string) {
  const position = await prisma.position.findFirstOrThrow({
    where: { id: positionId, director: { userId }, status: 'open' },
  });
  const existing = await prisma.positionInsurance.findUnique({ where: { positionId } });
  if (existing) throw new Error('Insurance already purchased for this position');
  await coinService.spendCoins(userId, 150, 'director_position_insurance', `Insurance: ${position.claim}`, positionId);
  const insurance = await prisma.positionInsurance.create({ data: { positionId, coinsCost: 150 } });
  await prisma.position.update({ where: { id: positionId }, data: { hasInsurance: true } });
  return insurance;
}

export async function mirrorPosition(userId: string, originalPosId: string, coinsStaked: number) {
  const original = await prisma.position.findUniqueOrThrow({
    where: { id: originalPosId },
    include: { director: { include: { user: true } } },
  });
  if (original.director.user.id === userId) throw new Error('Cannot mirror your own position');
  if (original.status !== 'open') throw new Error('Position is no longer open');

  const myProfile = await getOrCreateDirectorProfile(userId);
  const mirrorOdds = parseFloat((original.entryOdds * 0.95).toFixed(2));

  await coinService.spendCoins(userId, coinsStaked, 'director_mirror_position', `Mirror: ${original.claim}`, originalPosId);

  const mirror = await prisma.mirroredPosition.create({
    data: { directorId: myProfile.id, originalPosId, coinsStaked, entryOdds: mirrorOdds },
  });

  await notify(original.director.user.id, 'director_mirror', '🔄 Position Mirrored', `Someone mirrored your position: ${original.claim}`, `/director`);
  return mirror;
}

export async function getDirectorDashboard(userId: string) {
  const profile = await getOrCreateDirectorProfile(userId);

  const [openPositions, closedPositions, alerts, followers, following] = await Promise.all([
    prisma.position.findMany({
      where: { directorId: profile.id, status: 'open' },
      include: { sport: true, events: { orderBy: { createdAt: 'desc' }, take: 3 }, insurance: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.position.findMany({
      where: { directorId: profile.id, status: { not: 'open' } },
      include: { sport: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.intelligenceAlert.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.directorFollow.findMany({ where: { followedId: profile.id }, include: { follower: { include: { user: true } } } }),
    prisma.directorFollow.findMany({ where: { followerId: profile.id }, include: { followed: { include: { user: true } } } }),
  ]);

  const portfolioValue = openPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true } });
  const totalValue = portfolioValue + user.sportcoins;
  const pnl = totalValue - profile.portfolioStartValue;

  const availablePositions = await getAvailablePositions(userId, {});

  return {
    profile: { ...profile, intelligenceNetwork: parseNetwork(profile.intelligenceNetwork) },
    openPositions,
    closedPositions,
    alerts,
    followers: followers.map(f => f.follower),
    following: following.map(f => f.followed),
    portfolio: { totalValue, openPositionsValue: portfolioValue, coinsBalance: user.sportcoins, pnl, pnlPct: profile.portfolioStartValue > 0 ? (pnl / profile.portfolioStartValue * 100) : 0 },
    reputation: getReputationDetails(profile),
    availablePositions: availablePositions.slice(0, 12),
  };
}

export async function getPortfolioValue(userId: string) {
  const profile = await getOrCreateDirectorProfile(userId);
  const openPositions = await prisma.position.findMany({
    where: { directorId: profile.id, status: 'open' },
    include: { sport: true },
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true } });

  const openValue = openPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalValue = openValue + user.sportcoins;
  const pnl = totalValue - profile.portfolioStartValue;

  const best = openPositions.reduce<typeof openPositions[0] | null>((b, p) => (!b || p.currentValue > b.currentValue ? p : b), null);
  const worst = openPositions.reduce<typeof openPositions[0] | null>((w, p) => (!w || p.currentValue < w.currentValue ? p : w), null);

  return {
    totalValue, openPositionsValue: openValue, coinsBalance: user.sportcoins,
    totalPnL: pnl, totalPnLPct: profile.portfolioStartValue > 0 ? pnl / profile.portfolioStartValue * 100 : 0,
    bestPosition: best, worstPosition: worst, openCount: openPositions.length,
  };
}

export function getReputationDetails(profile: {
  reputationScore: number;
  reputationTier: string;
  accuracyRate: number;
  contrairianWins: number;
  totalPositions: number;
  correctPositions: number;
  followersCount: number;
}) {
  const current = getReputationTier(profile.reputationScore);
  const tiers = [
    { name: 'Rookie', minScore: 0, color: '#9CA3AF', icon: '🌱', maxPositions: 3 },
    { name: 'Scout', minScore: 500, color: '#3B82F6', icon: '👁️', maxPositions: 5 },
    { name: 'Analyst', minScore: 1500, color: '#10B981', icon: '📊', maxPositions: 8 },
    { name: 'Strategist', minScore: 3000, color: '#F97316', icon: '♟️', maxPositions: 12 },
    { name: 'Director', minScore: 6000, color: '#EF4444', icon: '🎯', maxPositions: 999 },
    { name: 'Elite Director', minScore: 9000, color: '#F59E0B', icon: '⭐', maxPositions: 999 },
    { name: 'Sporting Legend', minScore: 10000, color: '#8B5CF6', icon: '🏆', maxPositions: 999 },
  ];
  const idx = tiers.findIndex(t => t.name === current.name);
  const next = tiers[idx + 1] || null;
  const progressToNext = next ? (profile.reputationScore - current.minScore) / (next.minScore - current.minScore) * 100 : 100;

  return { current, next, progressToNext, score: profile.reputationScore };
}

export async function updateOdds(availPosId: string) {
  const avail = await prisma.availablePosition.findUniqueOrThrow({ where: { id: availPosId } });
  if (!avail.isActive) return;

  let newOdds = avail.baseOdds;
  // Shorten odds if community heavily backing one side
  const holdRatio = avail.holdersCount / Math.max(1, avail.holdersCount + 10);
  if (holdRatio > 0.6) newOdds *= 0.95;
  if (holdRatio > 0.8) newOdds *= 0.92;

  // Time decay — as expiry approaches speculative positions shorten slightly
  const msToExpiry = avail.expiresAt.getTime() - Date.now();
  const daysToExpiry = msToExpiry / 86400000;
  if (daysToExpiry < 3 && avail.level === 'speculative') newOdds *= 0.97;

  newOdds = Math.max(1.05, parseFloat(newOdds.toFixed(2)));
  if (Math.abs(newOdds - avail.currentOdds) < 0.01) return;

  await prisma.availablePosition.update({ where: { id: availPosId }, data: { currentOdds: newOdds } });

  // Update all open positions on this available position
  const positions = await prisma.position.findMany({ where: { availPosId, status: 'open' } });
  for (const pos of positions) {
    const newValue = Math.round(pos.coinsStaked * (pos.entryOdds / newOdds));
    const impact = newValue - pos.currentValue;
    await prisma.position.update({ where: { id: pos.id }, data: { currentOdds: newOdds, currentValue: newValue } });
    if (Math.abs(impact) >= 20) {
      await prisma.positionEvent.create({
        data: {
          positionId: pos.id,
          eventType: 'odds_change',
          description: `Odds moved from ${pos.currentOdds.toFixed(2)}× to ${newOdds.toFixed(2)}×`,
          oddsImpact: newOdds - pos.currentOdds,
          valueImpact: impact,
          severity: impact >= 0 ? 'positive' : 'negative',
        },
      });
    }
  }
}

export async function getScoutReport(availPosId: string) {
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000);
  const cached = await prisma.scoutReport.findFirst({ where: { positionId: availPosId, generatedAt: { gt: sixHoursAgo } } });
  if (cached) return cached;

  const avail = await prisma.availablePosition.findUniqueOrThrow({ where: { id: availPosId }, include: { sport: true } });

  // Generate mock scout report
  const forms = [
    { result: 'W', detail: 'Won convincingly', score: '6-2 6-3' },
    { result: 'W', detail: 'Narrow victory', score: '7-5 6-4' },
    { result: 'L', detail: 'Tough loss', score: '4-6 3-6' },
    { result: 'W', detail: 'Dominant display', score: '6-1 6-2' },
    { result: 'W', detail: 'Comeback win', score: '4-6 7-5 6-3' },
  ];
  const isRising = Math.random() > 0.4;
  const confidence = 40 + Math.round(Math.random() * 50);

  const riskFactors = JSON.parse(avail.riskFactors as string);
  const supportFactors = JSON.parse(avail.supportFactors as string);

  return prisma.scoutReport.create({
    data: {
      positionId: availPosId,
      sportId: avail.sportId,
      subjectName: avail.subjectName,
      recentForm: JSON.stringify(forms),
      injuryHistory: JSON.stringify([]),
      headToHead: JSON.stringify({ wins: 8, losses: 3, draws: 1 }),
      pressureStats: JSON.stringify({ bigMatchWinRate: 0.71 }),
      venueStats: JSON.stringify({ surfaceRecord: '24-4' }),
      formTrend: isRising ? 'rising' : 'stable',
      confidenceScore: confidence,
      riskLevel: confidence > 70 ? 'low' : confidence > 50 ? 'medium' : 'high',
      keyRisks: avail.riskFactors,
      keySupport: avail.supportFactors,
      recommendation: confidence > 70 ? 'strong_hold' : confidence > 55 ? 'consider' : confidence > 40 ? 'risky' : 'avoid',
    },
  });
}

export async function getContrarianFinderResults(userId: string) {
  await coinService.spendCoins(userId, 100, 'director_contrarian_finder', 'Contrarian Finder analysis');

  const positions = await prisma.availablePosition.findMany({
    where: { isActive: true, closesAt: { gt: new Date() } },
    include: { sport: true },
  });

  const results = positions
    .filter(p => p.holdersCount > 5)
    .map(p => {
      const communityHoldPct = p.holdersCount / Math.max(1, p.holdersCount + 50);
      const impliedProb = 1 / p.currentOdds;
      const modelProb = impliedProb * (1 + (Math.random() * 0.3 - 0.1));
      const edge = modelProb - impliedProb;
      return { position: p, communityHoldPct: communityHoldPct * 100, impliedProb, modelProb, edge };
    })
    .filter(r => r.edge > 0.05 && r.communityHoldPct < 25)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, 3);

  return results.map(r => ({
    ...r.position,
    communityHoldPctCalc: r.communityHoldPct,
    edge: r.edge,
    modelProb: r.modelProb,
    reasoning: `Model estimates ${(r.modelProb * 100).toFixed(0)}% probability vs market's ${(r.impliedProb * 100).toFixed(0)}% — positive edge of ${(r.edge * 100).toFixed(0)} points`,
  }));
}

export async function getIntelligenceAlerts(userId: string) {
  return prisma.intelligenceAlert.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function followDirector(followerId: string, followedId: string) {
  const [followerProfile, followedProfile] = await Promise.all([
    getOrCreateDirectorProfile(followerId),
    prisma.directorProfile.findUniqueOrThrow({ where: { userId: followedId } }),
  ]);

  const follow = await prisma.directorFollow.create({
    data: { followerId: followerProfile.id, followedId: followedProfile.id },
  });

  await Promise.all([
    prisma.directorProfile.update({ where: { id: followerProfile.id }, data: { followingCount: { increment: 1 } } }),
    prisma.directorProfile.update({ where: { id: followedProfile.id }, data: { followersCount: { increment: 1 } } }),
  ]);

  return follow;
}

export async function unfollowDirector(followerId: string, followedId: string) {
  const [followerProfile, followedProfile] = await Promise.all([
    getOrCreateDirectorProfile(followerId),
    prisma.directorProfile.findUniqueOrThrow({ where: { userId: followedId } }),
  ]);

  await prisma.directorFollow.deleteMany({
    where: { followerId: followerProfile.id, followedId: followedProfile.id },
  });

  await Promise.all([
    prisma.directorProfile.update({ where: { id: followerProfile.id }, data: { followingCount: { decrement: 1 } } }),
    prisma.directorProfile.update({ where: { id: followedProfile.id }, data: { followersCount: { decrement: 1 } } }),
  ]);
}

export async function getDirectorLeaderboard(period: string, sportId?: string) {
  const profiles = await prisma.directorProfile.findMany({
    include: { user: { select: { username: true, avatarUrl: true } } },
    orderBy: { reputationScore: 'desc' },
    take: 50,
  });

  return profiles.map((p, i) => ({
    rank: i + 1,
    username: p.user.username,
    avatarUrl: p.user.avatarUrl,
    reputationTier: p.reputationTier,
    reputationScore: p.reputationScore,
    accuracyRate: p.accuracyRate,
    contrairianWins: p.contrairianWins,
    portfolioValue: p.portfolioValue,
    portfolioReturn: p.portfolioStartValue > 0 ? ((p.portfolioValue - p.portfolioStartValue) / p.portfolioStartValue * 100) : 0,
    intelligenceNetwork: parseNetwork(p.intelligenceNetwork),
    totalPositions: p.totalPositions,
    correctPositions: p.correctPositions,
    userId: p.userId,
  }));
}

export async function getFollowingFeed(userId: string) {
  const profile = await getOrCreateDirectorProfile(userId);
  const following = await prisma.directorFollow.findMany({
    where: { followerId: profile.id },
    select: { followedId: true },
  });
  const followedIds = following.map(f => f.followedId);
  if (followedIds.length === 0) return [];

  return prisma.position.findMany({
    where: { directorId: { in: followedIds }, status: 'open', createdAt: { gt: new Date(Date.now() - 7 * 86400000) } },
    include: { director: { include: { user: true } }, sport: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function updateAllReputations() {
  const profiles = await prisma.directorProfile.findMany();
  for (const profile of profiles) {
    const score = calculateReputationScore({
      accuracyRate: profile.accuracyRate,
      contrairianWins: profile.contrairianWins,
      timingScore: profile.timingScore,
      intelligenceNetwork: profile.intelligenceNetwork,
      followersCount: profile.followersCount,
    });
    const tier = getReputationTier(score);

    // Milestone bonus if tier changed
    if (tier.name !== profile.reputationTier) {
      const tierBonuses: Record<string, number> = { Scout: 100, Analyst: 200, Strategist: 400, Director: 600, 'Elite Director': 800, 'Sporting Legend': 1000 };
      const bonus = tierBonuses[tier.name] || 100;
      await coinService.addCoins(profile.userId, bonus, 'director_milestone_rep', `Reached ${tier.name} tier!`);
      await notify(profile.userId, 'director_tier', `🏆 New Tier: ${tier.name}!`, `You've reached ${tier.name} — ${bonus} coins awarded`, '/director');
    }

    await prisma.directorProfile.update({
      where: { id: profile.id },
      data: { reputationScore: score, reputationTier: tier.name },
    });
  }
}
