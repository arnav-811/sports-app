import cron from 'node-cron';
import { updateAllSVScores } from '../services/svScoreService';
import { addCoins } from '../services/coinService';
import { awardXP } from '../services/levelService';
import { updateQuestProgress } from '../services/questService';
import { prisma } from '../lib/prisma';

export function startCronJobs(): void {
  // SV Score update — every hour
  cron.schedule(process.env.CRON_SV_SCORE_UPDATE || '0 * * * *', async () => {
    console.log('⚙️  Updating SV Scores...');
    try { await updateAllSVScores(); console.log('✅ SV Scores updated'); } catch (e) { console.error('SV Score cron error:', e); }
  });

  // Close debates past their 7-day closesAt — every 10 minutes
  cron.schedule(process.env.CRON_DEBATE_CLOSE || '*/10 * * * *', async () => {
    try {
      const stale = await prisma.debate.findMany({
        where: { status: 'open', closedAt: { lte: new Date() } },
        include: { entries: true },
      });
      for (const debate of stale) {
        const sideAVotes = debate.entries.filter(e => e.side === 'A').reduce((s, e) => s + e.votes, 0);
        const sideBVotes = debate.entries.filter(e => e.side === 'B').reduce((s, e) => s + e.votes, 0);
        const winningSide = sideAVotes >= sideBVotes ? 'A' : 'B';

        await prisma.debate.update({
          where: { id: debate.id },
          data: { status: 'closed', closedAt: new Date(), winningSide },
        });

        const winners = debate.entries.filter(e => e.side === winningSide);
        const losers = debate.entries.filter(e => e.side !== winningSide);
        const loserPool = losers.reduce((s, e) => s + e.coinsStaked, 0);
        const share = winners.length > 0 ? Math.floor(loserPool / winners.length) : 0;

        for (const entry of winners) {
          const payout = entry.coinsStaked + share;
          await prisma.user.update({
            where: { id: entry.userId },
            data: { cred: { increment: 50 }, debateWins: { increment: 1 } },
          });
          await addCoins(entry.userId, payout, 'debate_win', `Won debate: ${debate.question}`, debate.id, debate.sportId);
          await prisma.debateEntry.update({ where: { id: entry.id }, data: { isWinner: true, coinsWon: payout } });
          await awardXP(entry.userId, 25, 'debate_win');
          await updateQuestProgress(entry.userId, 'win_debate');
        }
        for (const entry of losers) {
          await prisma.user.update({ where: { id: entry.userId }, data: { debateLosses: { increment: 1 } } });
        }

        if (debate.creatorId && debate.entries.length >= 50) {
          await addCoins(debate.creatorId, 100, 'debate_creator_bonus', `Your debate "${debate.question}" reached 50+ entries`, debate.id);
        }

        const bestWinner = [...winners].sort((a, b) => b.votes - a.votes)[0];
        if (bestWinner) await addCoins(bestWinner.userId, 100, 'debate_best_argument', 'Best argument on the winning side', debate.id);
        const bestLoser = [...losers].sort((a, b) => b.votes - a.votes)[0];
        if (bestLoser) await addCoins(bestLoser.userId, 25, 'debate_best_argument_consolation', 'Best argument on the losing side', debate.id);
      }
    } catch (e) { console.error('Debate cron error:', e); }
  });

  // Reveal time capsules — daily at 9am
  cron.schedule(process.env.CRON_CAPSULE_REVEAL || '0 9 * * *', async () => {
    try {
      const due = await prisma.timeCapsule.findMany({
        where: { isRevealed: false, revealAt: { lte: new Date() } },
      });
      for (const capsule of due) {
        await prisma.timeCapsule.update({
          where: { id: capsule.id },
          data: { isRevealed: true, revealedAt: new Date() },
        });
        await prisma.notification.create({
          data: {
            userId: capsule.userId,
            type: 'capsule_revealed',
            title: '⏰ Your Time Capsule is now revealed!',
            body: 'Your match reaction from 30 days ago is now visible to the Ground.',
            link: `/memories`,
          },
        });
      }
    } catch (e) { console.error('Capsule cron error:', e); }
  });

  console.log('⏰ Cron jobs started');
}
