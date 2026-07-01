import { PrismaClient } from '@prisma/client';
import { addCoins, loseCoins, spendCoins, InsufficientCoinsError } from './coinService';
import { getTemplatesForSport, adjustOdds } from '../data/predictionTemplates';

const prisma = new PrismaClient();

interface OddsOption {
  id: string;
  label: string;
  baseOdds: number;
  currentOdds: number;
  coinsStaked: number;
  percentage: number;
}

export async function getOddsBoard(matchId: string) {
  return prisma.oddsBoard.findMany({
    where: { matchId, status: 'open' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function generateOddsBoard(matchId: string, sportId: string, matchData: Record<string, string>) {
  const templates = getTemplatesForSport(sportId, 4);
  const boards = [];

  for (const tmpl of templates) {
    const question = typeof tmpl.question === 'function' ? tmpl.question(matchData) : tmpl.question;
    const options: OddsOption[] = tmpl.options.map(o => ({
      id: o.id,
      label: typeof o.label === 'function' ? (o.label as (d: Record<string, string>) => string)(matchData) : o.label,
      baseOdds: o.baseOdds,
      currentOdds: o.baseOdds,
      coinsStaked: 0,
      percentage: Math.round(100 / tmpl.options.length),
    }));

    const existing = await prisma.oddsBoard.findFirst({ where: { matchId, question } });
    if (existing) { boards.push(existing); continue; }

    const board = await prisma.oddsBoard.create({
      data: { matchId, sportId, question, options: JSON.stringify(options), totalCoins: 0 },
    });
    boards.push(board);
  }
  return boards;
}

export async function placePrediction(
  userId: string, matchId: string, questionId: string,
  optionId: string, coinsStaked: number
) {
  if (coinsStaked < 10 || coinsStaked > 500) throw new Error('Stake must be between 10 and 500 coins');

  const board = await prisma.oddsBoard.findUniqueOrThrow({ where: { id: questionId } });
  if (board.status !== 'open') throw new Error('This question is no longer accepting predictions');

  const existing = await prisma.livePrediction.findFirst({ where: { userId, matchId, question: board.question, status: 'pending' } });
  if (existing) throw new Error('You have already predicted this question');

  const options: OddsOption[] = JSON.parse(board.options);
  const chosen = options.find(o => o.id === optionId);
  if (!chosen) throw new Error('Invalid option');
  const oddsAtTime = chosen.currentOdds;

  await spendCoins(userId, coinsStaked, 'prediction_loss', `Prediction: ${board.question} — ${chosen.label}`, questionId);

  const prediction = await prisma.livePrediction.create({
    data: {
      userId, matchId, sportId: board.sportId, questionId,
      question: board.question, optionChosen: optionId,
      options: board.options, oddsAtTime, coinsStaked, status: 'pending',
    },
  });

  // Update odds board coin totals
  const updatedOptions = options.map(o => ({
    ...o,
    coinsStaked: o.id === optionId ? o.coinsStaked + coinsStaked : o.coinsStaked,
  }));
  const totalCoins = board.totalCoins + coinsStaked;
  const rebalanced = updatedOptions.map(o => ({
    ...o,
    currentOdds: adjustOdds(o.baseOdds, o.coinsStaked, totalCoins),
    percentage: totalCoins > 0 ? Math.round((o.coinsStaked / totalCoins) * 100) : Math.round(100 / options.length),
  }));

  await prisma.oddsBoard.update({
    where: { id: questionId },
    data: { options: JSON.stringify(rebalanced), totalCoins },
  });

  // Update passport XP for prediction placed
  await updatePredictionStreak(userId, true, false); // first pred of day bonus

  return { prediction, oddsAtTime, potentialWin: Math.floor(coinsStaked * oddsAtTime) };
}

export async function createParlay(userId: string, legs: { matchId: string; questionId: string; optionId: string }[], totalStake: number) {
  if (legs.length < 2 || legs.length > 4) throw new Error('Parlay must have 2-4 legs');
  if (totalStake < 10) throw new Error('Minimum parlay stake is 10 coins');

  const boards = await Promise.all(legs.map(l => prisma.oddsBoard.findUniqueOrThrow({ where: { id: l.questionId } })));
  const combinedOdds = boards.reduce((acc, board, i) => {
    const options: OddsOption[] = JSON.parse(board.options);
    const chosen = options.find(o => o.id === legs[i].optionId);
    return acc * (chosen?.currentOdds || 1);
  }, 1);
  const potentialWin = Math.floor(totalStake * combinedOdds);

  await spendCoins(userId, totalStake, 'parlay_loss', `${legs.length}-leg parlay — potential ${potentialWin} ⚡`);

  const parlay = await prisma.parlay.create({
    data: { userId, totalStake, combinedOdds: Math.round(combinedOdds * 100) / 100, potentialWin, legsTotal: legs.length },
  });

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const board = boards[i];
    const options: OddsOption[] = JSON.parse(board.options);
    const chosen = options.find(o => o.id === leg.optionId);
    await prisma.livePrediction.create({
      data: {
        userId, matchId: leg.matchId, sportId: board.sportId, questionId: leg.questionId,
        question: board.question, optionChosen: leg.optionId, options: board.options,
        oddsAtTime: chosen?.currentOdds || 1, coinsStaked: 0, status: 'pending',
        isParlay: true, parlayId: parlay.id,
      },
    });
  }
  return { parlay, combinedOdds: parlay.combinedOdds, potentialWin };
}

async function updatePredictionStreak(userId: string, isCorrect: boolean, alreadyTracked: boolean) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { multiplierStreak: true, predictionMultiplier: true },
  });

  let newStreak = user.multiplierStreak;
  let newMultiplier = user.predictionMultiplier;

  if (isCorrect) {
    newStreak += 1;
    if (newStreak >= 7) newMultiplier = 3.0;
    else if (newStreak >= 5) newMultiplier = 2.0;
    else if (newStreak >= 3) newMultiplier = 1.5;
  } else {
    if (newStreak >= 5) newMultiplier = 2.0;
    else if (newStreak >= 3) newMultiplier = 1.5;
    else newMultiplier = 1.0;
    newStreak = 0;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { multiplierStreak: newStreak, predictionMultiplier: newMultiplier },
  });
  return { newStreak, newMultiplier };
}

export async function resolvePrediction(predictionId: string, winningOptionId: string) {
  const pred = await prisma.livePrediction.findUniqueOrThrow({
    where: { id: predictionId },
    include: { user: { select: { predictionMultiplier: true, multiplierStreak: true } } },
  });
  if (pred.status !== 'pending') return;

  const isWin = pred.optionChosen === winningOptionId;

  if (isWin) {
    const baseWin = Math.floor(pred.coinsStaked * pred.oddsAtTime);
    const multipliedWin = Math.floor(baseWin * (pred.user.predictionMultiplier || 1.0));
    await addCoins(pred.userId, multipliedWin, 'prediction_win', `Correct prediction: ${pred.question} ${pred.user.predictionMultiplier > 1 ? `(${pred.user.predictionMultiplier}× multiplier)` : ''}`, pred.id, pred.sportId);
    await prisma.livePrediction.update({
      where: { id: predictionId },
      data: { status: 'won', coinsWon: multipliedWin, resolvedAt: new Date() },
    });
    await prisma.user.update({ where: { id: pred.userId }, data: { correctPredictions: { increment: 1 } } });
  } else {
    await prisma.livePrediction.update({
      where: { id: predictionId },
      data: { status: 'lost', coinsLost: pred.coinsStaked, resolvedAt: new Date() },
    });
  }

  await updatePredictionStreak(pred.userId, isWin, false);
  await prisma.user.update({ where: { id: pred.userId }, data: { predictionCount: { increment: 1 } } });
}

export async function resolveParlay(parlayId: string, results: { legId: string; won: boolean }[]) {
  const parlay = await prisma.parlay.findUniqueOrThrow({ where: { id: parlayId }, include: { legs: true } });
  let allWon = true;
  let failedLeg = '';

  for (const result of results) {
    await prisma.livePrediction.update({
      where: { id: result.legId },
      data: { status: result.won ? 'won' : 'lost', resolvedAt: new Date() },
    });
    if (!result.won) { allWon = false; failedLeg = result.legId; }
  }

  if (allWon) {
    await addCoins(parlay.userId, parlay.potentialWin, 'parlay_win', `${parlay.legsTotal}-leg parlay won! ${parlay.combinedOdds}× odds`);
    await prisma.parlay.update({ where: { id: parlayId }, data: { status: 'won', coinsWon: parlay.potentialWin, legsWon: parlay.legsTotal, resolvedAt: new Date() } });
  } else {
    const failedPred = parlay.legs.find(l => l.id === failedLeg);
    await prisma.notification.create({
      data: { userId: parlay.userId, type: 'parlay_bust', title: '💸 Parlay busted', body: `Leg failed: ${failedPred?.question || ''}. Better luck next time.`, isRead: false },
    });
    await prisma.parlay.update({ where: { id: parlayId }, data: { status: 'bust', legsFailed: 1, resolvedAt: new Date() } });
  }
}

export async function getUserPredictionStats(userId: string) {
  const preds = await prisma.livePrediction.findMany({ where: { userId, isParlay: false } });
  const total = preds.length;
  const correct = preds.filter(p => p.status === 'won').length;
  const lost = preds.filter(p => p.status === 'lost').length;
  const totalStaked = preds.reduce((s, p) => s + p.coinsStaked, 0);
  const totalWon = preds.filter(p => p.coinsWon).reduce((s, p) => s + (p.coinsWon || 0), 0);
  const totalLost = preds.filter(p => p.coinsLost).reduce((s, p) => s + (p.coinsLost || 0), 0);

  // By sport
  const bySport: Record<string, { total: number; correct: number }> = {};
  for (const p of preds) {
    if (!bySport[p.sportId]) bySport[p.sportId] = { total: 0, correct: 0 };
    bySport[p.sportId].total += 1;
    if (p.status === 'won') bySport[p.sportId].correct += 1;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { predictionMultiplier: true, multiplierStreak: true } });

  return {
    total, correct, lost, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    totalStaked, totalWon, totalLost,
    roi: totalStaked > 0 ? (((totalWon - totalStaked) / totalStaked) * 100).toFixed(1) : '0',
    currentMultiplier: user?.predictionMultiplier || 1.0,
    currentStreak: user?.multiplierStreak || 0,
    accuracyBySport: bySport,
  };
}
