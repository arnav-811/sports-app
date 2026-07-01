import cron from 'node-cron';
import { updateAllSVScores } from '../services/svScoreService';
import { prisma } from '../lib/prisma';

export function startCronJobs(): void {
  // SV Score update — every hour
  cron.schedule(process.env.CRON_SV_SCORE_UPDATE || '0 * * * *', async () => {
    console.log('⚙️  Updating SV Scores...');
    try { await updateAllSVScores(); console.log('✅ SV Scores updated'); } catch (e) { console.error('SV Score cron error:', e); }
  });

  // Close debates older than 24h — every 10 minutes
  cron.schedule(process.env.CRON_DEBATE_CLOSE || '*/10 * * * *', async () => {
    try {
      const stale = await prisma.debate.findMany({
        where: { status: { in: ['open', 'voting'] }, closedAt: { lte: new Date() } },
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

        // Award cred to winners
        const winners = debate.entries.filter(e => e.side === winningSide);
        for (const entry of winners) {
          await prisma.user.update({
            where: { id: entry.userId },
            data: { cred: { increment: 50 }, debateWins: { increment: 1 }, sportcoins: { increment: 50 }, totalCoinsEarned: { increment: 50 } },
          });
        }
        const losers = debate.entries.filter(e => e.side !== winningSide);
        for (const entry of losers) {
          await prisma.user.update({ where: { id: entry.userId }, data: { debateLosses: { increment: 1 } } });
        }
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
