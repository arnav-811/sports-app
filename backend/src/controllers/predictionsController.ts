import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { spendCoins } from '../services/coinService';
import { getLevelUnlocks } from '../services/levelService';

const QUESTION_TEMPLATES: Record<string, (match: { homeTeam: string; awayTeam: string }) => Array<{ question: string; options: string[]; baseOdds: number[] }>> = {
  football: (m) => [
    { question: `Will ${m.homeTeam} score in the next 10 minutes?`, options: ['Yes', 'No'], baseOdds: [2.1, 1.8] },
    { question: 'How many corners in the next 15 minutes?', options: ['0-1', '2-3', '4+'], baseOdds: [2.0, 2.5, 3.5] },
    { question: 'Will there be a yellow card in the next 10 minutes?', options: ['Yes', 'No'], baseOdds: [2.8, 1.4] },
  ],
  cricket: (m) => [
    { question: `Will ${m.homeTeam} take a wicket this over?`, options: ['Yes', 'No'], baseOdds: [3.5, 1.3] },
    { question: 'How many runs in the next over?', options: ['0-5', '6-10', '11+'], baseOdds: [2.2, 2.0, 3.8] },
    { question: 'Will this over be a maiden?', options: ['Yes', 'No'], baseOdds: [5.0, 1.2] },
  ],
  f1: (m) => [
    { question: 'Will there be a safety car in the next 10 laps?', options: ['Yes', 'No'], baseOdds: [4.0, 1.2] },
    { question: `Will ${m.homeTeam} hold their position to race end?`, options: ['Yes', 'No'], baseOdds: [2.0, 1.8] },
    { question: `Will ${m.homeTeam} pit in the next 3 laps?`, options: ['Yes', 'No'], baseOdds: [3.0, 1.5] },
  ],
  tennis: (m) => [
    { question: `Will ${m.homeTeam} hold serve this game?`, options: ['Yes', 'No'], baseOdds: [1.6, 2.4] },
    { question: 'Will there be a tiebreak in this set?', options: ['Yes', 'No'], baseOdds: [3.2, 1.4] },
    { question: 'Ace on the next service game?', options: ['Yes', 'No'], baseOdds: [2.8, 1.4] },
  ],
  badminton: (m) => [
    { question: 'Will this rally go over 15 shots?', options: ['Yes', 'No'], baseOdds: [3.0, 1.4] },
    { question: `Which player wins the next 3 points?`, options: [m.homeTeam, m.awayTeam, 'Split'], baseOdds: [2.1, 2.1, 4.0] },
    { question: 'Smash over 380km/h in the next game?', options: ['Yes', 'No'], baseOdds: [4.5, 1.2] },
  ],
};

export async function getActivePredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const match = await prisma.match.findUnique({ where: { id: req.params.matchId } });
    if (!match) throw createError('Match not found', 404);

    const templates = QUESTION_TEMPLATES[match.sportId]?.({ homeTeam: match.homeTeam, awayTeam: match.awayTeam }) || [];

    const questions = templates.map((t, i) => ({
      id: `${match.id}-q${i}`,
      matchId: match.id,
      sportId: match.sportId,
      question: t.question,
      options: t.options.map((opt, j) => ({
        label: opt,
        odds: t.baseOdds[j] || 2.0,
        coinDistribution: Math.floor(Math.random() * 60) + 20,
      })),
      status: 'open',
      closesAt: new Date(Date.now() + 10 * 60000).toISOString(),
    }));

    res.json(questions);
  } catch (err) { next(err); }
}

export async function placePrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { matchId, sportId, question, optionChosen, options, oddsAtTime, coinsStaked } = req.body;
    if (!coinsStaked || coinsStaked < 25) throw createError('Minimum stake is 25 coins', 400);

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { level: true } });
    if (!user) throw createError('User not found', 404);
    const maxStake = getLevelUnlocks(user.level).predictionMaxStake;
    if (maxStake !== null && coinsStaked > maxStake) throw createError(`Stake must be ${maxStake} coins or less at your level`, 400);

    const tx = await spendCoins(req.user!.userId, coinsStaked, 'prediction_stake', `Prediction: ${question}`, matchId);

    const prediction = await prisma.livePrediction.create({
      data: {
        userId: req.user!.userId,
        matchId,
        sportId,
        question,
        optionChosen,
        options: JSON.stringify(options),
        oddsAtTime,
        coinsStaked,
        status: 'pending',
      },
    });

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { predictionCount: { increment: 1 } },
    });

    res.status(201).json({ prediction, newBalance: tx.balanceAfter });
  } catch (err) { next(err); }
}

export async function getPredictionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const predictions = await prisma.livePrediction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const total = predictions.length;
    const won = predictions.filter(p => p.status === 'won').length;
    res.json({
      predictions: predictions.map(p => ({
        ...p,
        options: (() => { try { return JSON.parse(p.options); } catch { return []; } })(),
      })),
      stats: { total, won, lost: predictions.filter(p => p.status === 'lost').length, accuracy: total > 0 ? Math.round((won / total) * 100) : 0 },
    });
  } catch (err) { next(err); }
}

export async function getPredictionStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const predictions = await prisma.livePrediction.findMany({ where: { userId: req.user!.userId } });
    const won = predictions.filter(p => p.status === 'won');
    const totalWon = won.reduce((sum, p) => sum + (p.coinsWon || 0), 0);
    const totalStaked = predictions.reduce((sum, p) => sum + p.coinsStaked, 0);
    res.json({
      total: predictions.length,
      won: won.length,
      lost: predictions.filter(p => p.status === 'lost').length,
      pending: predictions.filter(p => p.status === 'pending').length,
      accuracy: predictions.length > 0 ? Math.round((won.length / predictions.length) * 100) : 0,
      totalCoinsWon: totalWon,
      totalCoinsStaked: totalStaked,
      netCoins: totalWon - totalStaked,
    });
  } catch (err) { next(err); }
}

export async function getCoinBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { sportcoins: true, totalCoinsEarned: true, totalCoinsSpent: true },
    });
    if (!user) throw createError('User not found', 404);
    res.json(user);
  } catch (err) { next(err); }
}

export async function getCoinHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(transactions);
  } catch (err) { next(err); }
}

export async function claimDailyCoins(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { sportcoins: true, lastActiveDate: true, dailyStreak: true },
    });
    if (!user) throw createError('User not found', 404);

    const now = new Date();
    const lastClaim = user.lastActiveDate;
    if (lastClaim) {
      const hoursSince = (now.getTime() - lastClaim.getTime()) / 3600000;
      if (hoursSince < 20) throw createError('Already claimed today', 400);
    }

    const DAILY = parseInt(process.env.SPORTCOIN_DAILY_LOGIN || '25');
    const streak = user.dailyStreak + 1;
    let bonus = 0;
    if (streak >= 30) bonus = parseInt(process.env.SPORTCOIN_STREAK_30DAY || '500');
    else if (streak >= 7) bonus = parseInt(process.env.SPORTCOIN_STREAK_7DAY || '100');

    const total = DAILY + bonus;
    const newBalance = user.sportcoins + total;

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        sportcoins: { increment: total },
        totalCoinsEarned: { increment: total },
        lastActiveDate: now,
        dailyStreak: streak,
      },
    });

    await prisma.coinTransaction.create({
      data: {
        userId: req.user!.userId,
        amount: total,
        reason: streak >= 30 ? 'streak_30day' : streak >= 7 ? 'streak_7day' : 'daily_login',
        balance: newBalance,
      },
    });

    res.json({ claimed: true, amount: total, bonus, streak, newBalance });
  } catch (err) { next(err); }
}
