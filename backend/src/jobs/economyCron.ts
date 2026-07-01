import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { applyWeeklySVDropTax } from '../services/coinService';
import { checkAllRivalries } from '../services/goneDarkService';
import { generateDailyQuests, generateWeeklyQuest, generateMonthlyQuest } from '../services/questService';
import { generateOddsBoard } from '../services/predictionService';

const prisma = new PrismaClient();

export function startEconomyCronJobs() {
  // Gone Dark check: every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ [Cron] Running Gone Dark check...');
    try { await checkAllRivalries(); } catch (e) { console.error('Gone Dark cron error:', e); }
  });

  // Weekly SV drop tax: every Sunday 23:30
  cron.schedule('30 23 * * 0', async () => {
    console.log('⏰ [Cron] Running weekly SV drop tax...');
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      await Promise.allSettled(users.map(u => applyWeeklySVDropTax(u.id)));
    } catch (e) { console.error('SV drop tax cron error:', e); }
  });

  // Reset weekly net coins: every Monday 00:01
  cron.schedule('1 0 * * 1', async () => {
    console.log('⏰ [Cron] Resetting weekly net coins...');
    try {
      await prisma.user.updateMany({ data: { weeklyNetCoins: 0, lastWeeklyReset: new Date() } });
    } catch (e) { console.error('Weekly reset cron error:', e); }
  });

  // Draft Wars bottom 3 penalty: every Monday 00:05
  cron.schedule('5 0 * * 1', async () => {
    console.log('⏰ [Cron] Running Draft Wars weekly penalties...');
    try {
      const rosters = await prisma.draftRoster.findMany({
        where: { rank: { not: null } },
        orderBy: { rank: 'desc' },
        include: { league: true },
      });
      // Bottom 3 per league
      const byLeague = new Map<string, typeof rosters>();
      for (const r of rosters) {
        if (!byLeague.has(r.leagueId)) byLeague.set(r.leagueId, []);
        byLeague.get(r.leagueId)!.push(r);
      }
      for (const [, rosterList] of byLeague) {
        const sorted = rosterList.sort((a, b) => (b.rank || 0) - (a.rank || 0));
        const bottom3 = sorted.slice(0, 3);
        for (const roster of bottom3) {
          const { loseCoins } = await import('../services/coinService');
          await loseCoins(roster.userId, 50, 'draft_bottom3', `Draft Wars ${roster.league.name} — Bottom 3 finish`).catch(() => {});
        }
      }
    } catch (e) { console.error('Draft penalty cron error:', e); }
  });

  // Daily quest generation: midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Generating daily quests...');
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      await Promise.allSettled(users.map(u => generateDailyQuests(u.id)));
    } catch (e) { console.error('Daily quest cron error:', e); }
  });

  // Weekly quest generation: Monday midnight
  cron.schedule('2 0 * * 1', async () => {
    console.log('⏰ [Cron] Generating weekly quests...');
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      await Promise.allSettled(users.map(u => generateWeeklyQuest(u.id)));
    } catch (e) { console.error('Weekly quest cron error:', e); }
  });

  // Monthly quest generation: 1st of month midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('⏰ [Cron] Generating monthly quests...');
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      await Promise.allSettled(users.map(u => generateMonthlyQuest(u.id)));
    } catch (e) { console.error('Monthly quest cron error:', e); }
  });

  // Odds refresh: every 2 minutes for active matches
  cron.schedule('*/2 * * * *', async () => {
    try {
      const liveMatches = await prisma.match.findMany({ where: { status: 'live' }, select: { id: true, sportId: true, homeTeam: true, awayTeam: true } });
      for (const match of liveMatches) {
        await generateOddsBoard(match.id, match.sportId, { homeTeam: match.homeTeam, awayTeam: match.awayTeam }).catch(() => {});
      }
    } catch (e) { /* silent */ }
  });

  console.log('⏰ Economy cron jobs started');
}
