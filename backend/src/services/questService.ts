import { PrismaClient } from '@prisma/client';
import { addCoins } from './coinService';

const prisma = new PrismaClient();

const DAILY_QUEST_POOL = [
  { type: 'predict_any',     description: 'Make 3 predictions in any live match',          req: 3,  coins: 75,  xp: 15 },
  { type: 'predict_correct', description: 'Get 2 predictions correct today',               req: 2,  coins: 100, xp: 25 },
  { type: 'back_takes',      description: 'Back 5 Takes on The Boards',                    req: 5,  coins: 40,  xp: 10 },
  { type: 'enter_debate',    description: 'Enter today\'s debate in any sport',            req: 1,  coins: 60,  xp: 15 },
  { type: 'win_debate',      description: 'Win a debate today',                            req: 1,  coins: 120, xp: 30 },
  { type: 'post_take',       description: 'Post a Take during a live match',               req: 1,  coins: 80,  xp: 20 },
  { type: 'terrace_reply',   description: 'Leave 3 replies in The Terrace',               req: 3,  coins: 45,  xp: 10 },
  { type: 'check_rival',     description: 'View your rival\'s Fan Card',                  req: 1,  coins: 30,  xp: 5  },
  { type: 'draft_lineup',    description: 'Set your Draft Wars lineup before kickoff',     req: 1,  coins: 50,  xp: 10 },
  { type: 'build_parlay',    description: 'Place a 2-leg parlay on any match',             req: 1,  coins: 60,  xp: 15 },
  { type: 'earn_receipt',    description: 'Give a Receipt to a Take or reply today',       req: 1,  coins: 35,  xp: 8  },
  { type: 'live_follow',     description: 'Open a Live Bunker during a live match',        req: 1,  coins: 30,  xp: 8  },
  { type: 'passport_xp',     description: 'Earn Passport XP in 2 different sports today', req: 2,  coins: 90,  xp: 20 },
  { type: 'streak_predict',  description: 'Get 3 predictions correct in one session',      req: 3,  coins: 150, xp: 35 },
  { type: 'capsule_write',   description: 'Write a Time Capsule during a live match',      req: 1,  coins: 70,  xp: 15 },
];

const WEEKLY_QUEST_POOL = [
  { type: 'top25_draft',   description: 'Finish top 25% in your Draft Wars league this gameweek', req: 1, coins: 500,  xp: 50 },
  { type: 'perfect_5',     description: 'Go 5/5 correct predictions in a single session',         req: 1, coins: 800,  xp: 75 },
  { type: 'win_3_debates', description: 'Win 3 debates across any sports this week',              req: 3, coins: 600,  xp: 60 },
  { type: 'multi_sport',   description: 'Make predictions in 3 different sports this week',       req: 3, coins: 450,  xp: 50 },
  { type: 'rival_win',     description: 'Win a rivalry battle this week',                         req: 1, coins: 400,  xp: 40 },
  { type: '100_take',      description: 'Get a Take to 100 backs this week',                      req: 1, coins: 700,  xp: 65 },
];

const MONTHLY_QUEST_POOL = [
  { type: 'all_sports_xp', description: 'Earn Passport XP in all 5 sports this month',  req: 5,  coins: 2000, xp: 200 },
  { type: '50_correct',    description: 'Make 50 correct predictions this month',        req: 50, coins: 2500, xp: 250 },
  { type: 'rival_3sports', description: 'Win rivalry battles in 3 different sports',    req: 3,  coins: 1800, xp: 180 },
  { type: 'debate_master', description: 'Win 15 debates this month',                    req: 15, coins: 3000, xp: 300 },
];

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function endOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}

function endOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function generateDailyQuests(userId: string) {
  const expires = endOfToday();
  // Remove expired quests
  await prisma.dailyQuest.updateMany({
    where: { userId, status: 'active', expiresAt: { lt: new Date() } },
    data: { status: 'expired' },
  });

  // Check if already has quests today
  const existing = await prisma.dailyQuest.findMany({
    where: { userId, expiresAt: { gt: new Date() }, status: { in: ['active', 'completed'] } },
  });
  if (existing.length >= 5) return existing;

  const pool = shuffle(DAILY_QUEST_POOL).slice(0, 5);
  const quests = await Promise.all(pool.map(q =>
    prisma.dailyQuest.create({
      data: { userId, questType: q.type, description: q.description, requirement: q.req, coinReward: q.coins, xpReward: q.xp, expiresAt: expires },
    })
  ));
  return quests;
}

export async function generateWeeklyQuest(userId: string) {
  const expires = endOfWeek();
  const existing = await prisma.weeklyQuest.findFirst({
    where: { userId, expiresAt: { gt: new Date() }, status: { in: ['active', 'completed'] } },
  });
  if (existing) return existing;

  const q = shuffle(WEEKLY_QUEST_POOL)[0];
  return prisma.weeklyQuest.create({
    data: { userId, questType: q.type, description: q.description, requirement: q.req, coinReward: q.coins, xpReward: q.xp, expiresAt: expires },
  });
}

export async function generateMonthlyQuest(userId: string) {
  const expires = endOfMonth();
  const existing = await prisma.monthlyQuest.findFirst({
    where: { userId, expiresAt: { gt: new Date() }, status: { in: ['active', 'completed'] } },
  });
  if (existing) return existing;

  const q = shuffle(MONTHLY_QUEST_POOL)[0];
  return prisma.monthlyQuest.create({
    data: { userId, questType: q.type, description: q.description, requirement: q.req, coinReward: q.coins, xpReward: q.xp, expiresAt: expires },
  });
}

export async function updateQuestProgress(userId: string, action: string, value = 1) {
  const activeDaily = await prisma.dailyQuest.findMany({
    where: { userId, status: 'active', expiresAt: { gt: new Date() } },
  });
  const activeWeekly = await prisma.weeklyQuest.findMany({
    where: { userId, status: 'active', expiresAt: { gt: new Date() } },
  });
  const activeMonthly = await prisma.monthlyQuest.findMany({
    where: { userId, status: 'active', expiresAt: { gt: new Date() } },
  });

  for (const quest of [...activeDaily, ...activeWeekly, ...activeMonthly]) {
    if (quest.questType !== action) continue;
    const newProgress = Math.min(quest.progress + value, quest.requirement);
    const completed = newProgress >= quest.requirement;

    if ('coinReward' in quest) {
      if ('expiresAt' in quest && activeDaily.includes(quest as typeof activeDaily[0])) {
        await prisma.dailyQuest.update({
          where: { id: quest.id },
          data: { progress: newProgress, status: completed ? 'completed' : 'active', completedAt: completed ? new Date() : null },
        });
      }
    }

    if (completed) {
      await addCoins(userId, quest.coinReward, 'quest_daily', `Quest complete: ${quest.description}`, quest.id);
      await prisma.notification.create({
        data: { userId, type: 'quest_complete', title: '🎯 Quest complete!', body: `${quest.description} — +${quest.coinReward} ⚡`, isRead: false },
      });
    }
  }

  // Handle weekly/monthly separately
  for (const quest of activeWeekly) {
    if (quest.questType !== action) continue;
    const newProgress = Math.min(quest.progress + value, quest.requirement);
    const completed = newProgress >= quest.requirement;
    await prisma.weeklyQuest.update({
      where: { id: quest.id },
      data: { progress: newProgress, status: completed ? 'completed' : 'active', completedAt: completed ? new Date() : null },
    });
    if (completed) {
      await addCoins(userId, quest.coinReward, 'quest_weekly', `Weekly quest complete: ${quest.description}`, quest.id);
      await prisma.notification.create({
        data: { userId, type: 'quest_complete', title: '🎯 Weekly quest complete!', body: `${quest.description} — +${quest.coinReward} ⚡`, isRead: false },
      });
    }
  }

  for (const quest of activeMonthly) {
    if (quest.questType !== action) continue;
    const newProgress = Math.min(quest.progress + value, quest.requirement);
    const completed = newProgress >= quest.requirement;
    await prisma.monthlyQuest.update({
      where: { id: quest.id },
      data: { progress: newProgress, status: completed ? 'completed' : 'active', completedAt: completed ? new Date() : null },
    });
    if (completed) {
      await addCoins(userId, quest.coinReward, 'quest_monthly', `Monthly quest complete: ${quest.description}`, quest.id);
    }
  }
}

export async function getUserQuests(userId: string) {
  const [daily, weekly, monthly] = await Promise.all([
    prisma.dailyQuest.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'asc' } }),
    prisma.weeklyQuest.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 1 }),
    prisma.monthlyQuest.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 1 }),
  ]);
  return { daily, weekly: weekly[0] || null, monthly: monthly[0] || null };
}
