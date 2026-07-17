import { PrismaClient } from '@prisma/client';
import { emitToUser } from './socketService';

const prisma = new PrismaClient();

const SV_MILESTONES = [500, 2000, 4000, 6000, 8000, 9500];

export class InsufficientCoinsError extends Error {
  constructor(public balance: number, public required: number) {
    super(`Insufficient coins: have ${balance}, need ${required}`);
  }
}

export class AlreadyClaimedError extends Error {
  constructor() { super('Daily login already claimed today'); }
}

async function sendNotification(userId: string, type: string, title: string, body: string, link?: string) {
  await prisma.notification.create({ data: { userId, type, title, body, link: link || '/', isRead: false } });
  emitToUser(userId, 'notification:new', { type, title, body, link });
}

export async function addCoins(
  userId: string, amount: number, reason: string,
  description: string, referenceId?: string, sportId?: string
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true, svScore: true, totalCoinsEarned: true } });
  const balanceBefore = user.sportcoins;
  const balanceAfter = balanceBefore + amount;

  const [tx] = await prisma.$transaction([
    prisma.coinTransaction.create({
      data: { userId, amount, type: 'earn', reason, referenceId, balanceBefore, balanceAfter, description, sportId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { sportcoins: { increment: amount }, totalCoinsEarned: { increment: amount }, weeklyNetCoins: { increment: amount } },
    }),
  ]);

  // Check SV Score milestones
  for (const milestone of SV_MILESTONES) {
    if (user.svScore >= milestone && balanceBefore < milestone * 0.9) continue; // rough check
  }

  emitToUser(userId, 'coin:update', { balance: balanceAfter, delta: amount });
  return tx;
}

export async function spendCoins(
  userId: string, amount: number, reason: string,
  description: string, referenceId?: string
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true } });
  if (user.sportcoins < amount) throw new InsufficientCoinsError(user.sportcoins, amount);

  const balanceBefore = user.sportcoins;
  const balanceAfter = balanceBefore - amount;

  const [tx] = await prisma.$transaction([
    prisma.coinTransaction.create({
      data: { userId, amount: -amount, type: 'spend', reason, referenceId, balanceBefore, balanceAfter, description },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { sportcoins: { decrement: amount }, totalCoinsSpent: { increment: amount }, weeklyNetCoins: { decrement: amount } },
    }),
  ]);
  emitToUser(userId, 'coin:update', { balance: balanceAfter, delta: -amount });
  return tx;
}

export async function loseCoins(
  userId: string, amount: number, reason: string,
  description: string, referenceId?: string, sportId?: string
) {
  if (amount <= 0) throw new Error('Amount must be positive');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true, weeklyNetCoins: true } });
  const actual = Math.min(amount, user.sportcoins); // can't lose more than you have
  const balanceBefore = user.sportcoins;
  const balanceAfter = Math.max(0, balanceBefore - actual);

  const [tx] = await prisma.$transaction([
    prisma.coinTransaction.create({
      data: { userId, amount: -actual, type: 'lose', reason, referenceId, balanceBefore, balanceAfter, description, sportId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { sportcoins: { decrement: actual }, totalCoinsLost: { increment: actual }, weeklyNetCoins: { decrement: actual } },
    }),
  ]);

  await sendNotification(userId, 'coin_loss', `Lost ${actual} ⚡`, description, '/fancard/' + userId);
  emitToUser(userId, 'coin:update', { balance: balanceAfter, delta: -actual });

  // Weekly warning if net drops below -200
  if (user.weeklyNetCoins - actual < -200) {
    await sendNotification(userId, 'coin_warning', '⚠️ Rough week on coins', 'Your weekly net is below -200 ⚡. Make some predictions count!', '/');
  }
  return tx;
}

export async function getBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { sportcoins: true } });
  return user.sportcoins;
}

export async function getTransactionHistory(
  userId: string, limit = 20, offset = 0, type?: string
) {
  return prisma.coinTransaction.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getCoinStats(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { sportcoins: true, totalCoinsEarned: true, totalCoinsSpent: true, totalCoinsLost: true, weeklyNetCoins: true },
  });

  const txns = await prisma.coinTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

  // Best single day
  const dayMap = new Map<string, number>();
  for (const t of txns) {
    if (t.type === 'earn') {
      const day = t.createdAt.toISOString().slice(0, 10);
      dayMap.set(day, (dayMap.get(day) || 0) + t.amount);
    }
  }
  const bestDay = Math.max(0, ...dayMap.values());
  const biggestWin = txns.filter(t => t.type === 'earn').reduce((m, t) => Math.max(m, t.amount), 0);
  const biggestLoss = txns.filter(t => t.type === 'lose').reduce((m, t) => Math.max(m, Math.abs(t.amount)), 0);

  const predWins = txns.filter(t => t.reason === 'prediction_win').reduce((s, t) => s + t.amount, 0);
  const predLosses = txns.filter(t => t.reason === 'prediction_loss').reduce((s, t) => s + Math.abs(t.amount), 0);
  const predictionROI = predLosses > 0 ? ((predWins - predLosses) / predLosses * 100).toFixed(1) : '∞';

  return {
    balance: user.sportcoins,
    totalEarned: user.totalCoinsEarned,
    totalSpent: user.totalCoinsSpent,
    totalLost: user.totalCoinsLost,
    weeklyNet: user.weeklyNetCoins,
    bestDay,
    biggestWin,
    biggestLoss,
    predictionROI,
  };
}

export async function claimDailyLogin(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastClaimDate: true, dailyStreak: true, longestStreak: true, sportcoins: true },
  });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (user.lastClaimDate) {
    const lastStr = user.lastClaimDate.toISOString().slice(0, 10);
    if (lastStr === todayStr) throw new AlreadyClaimedError();
  }

  // Streak logic — gap > 25 hours resets streak
  const gapHours = user.lastClaimDate
    ? (now.getTime() - user.lastClaimDate.getTime()) / 3600000
    : 999;
  const newStreak = gapHours <= 25 ? (user.dailyStreak || 0) + 1 : 1;
  const longestStreak = Math.max(user.longestStreak || 0, newStreak);

  let baseAmount = 25;
  let bonusAmount = 0;
  let description = `Daily login bonus — day ${newStreak}`;

  if (newStreak === 7) { bonusAmount = 100; description = '🔥 7-day streak bonus!'; }
  if (newStreak === 30) { bonusAmount = 500; description = '💫 30-day streak bonus!'; }

  const totalAmount = baseAmount + bonusAmount;
  const balanceBefore = user.sportcoins;
  const balanceAfter = balanceBefore + totalAmount;

  const [tx] = await prisma.$transaction([
    prisma.coinTransaction.create({
      data: {
        userId, amount: totalAmount, type: 'earn',
        reason: newStreak === 7 ? 'streak_7' : newStreak === 30 ? 'streak_30' : 'daily_login',
        balanceBefore, balanceAfter, description,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        sportcoins: { increment: totalAmount },
        totalCoinsEarned: { increment: totalAmount },
        weeklyNetCoins: { increment: totalAmount },
        dailyStreak: newStreak,
        longestStreak,
        lastClaimDate: now,
        lastLoginDate: now,
        lastActiveDate: now,
      },
    }),
  ]);

  const { awardXP } = await import('./levelService');
  await awardXP(userId, 10, 'daily_login');

  return { transaction: tx, newStreak, bonusAmount, totalAmount };
}

export async function applyGoneDarkPenalty(userId: string, rivalUserId: string, rivalryId: string) {
  const PENALTY = 50;
  await loseCoins(userId, PENALTY, 'gone_dark', `Gone Dark — ${rivalUserId} claimed your coins`, rivalryId);
  await addCoins(rivalUserId, PENALTY, 'rivalry_pot_win', 'Rival went dark — you claimed their coins', rivalryId);
  await sendNotification(userId, 'gone_dark', '🌑 Gone Dark penalty', `You were inactive 72h. Your rival claimed 50 ⚡ from your wallet.`);
  await sendNotification(rivalUserId, 'rivalry_bonus', '⚡ Rival went dark!', `Your rival was inactive 72h — you claimed 50 ⚡!`);
}

export async function applyWeeklySVDropTax(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [current, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { svScore: true } }),
    prisma.sVScoreHistory.findFirst({
      where: { userId, recordedAt: { lte: sevenDaysAgo } },
      orderBy: { recordedAt: 'desc' },
    }),
  ]);
  if (!current || !history) return;
  const drop = history.score - current.svScore;
  if (drop >= 200) {
    await loseCoins(userId, 30, 'sv_drop_tax', `SV Score dropped ${drop.toFixed(0)} points this week`);
  }
}
