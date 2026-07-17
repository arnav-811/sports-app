import { prisma } from '../lib/prisma';
import { spendCoins, addCoins } from './coinService';
import { awardXP } from './levelService';

async function notify(userId: string, title: string, body: string) {
  await prisma.notification.create({ data: { userId, type: 'rivalry_battle', title, body, link: '/rivalries', isRead: false } });
}

/**
 * Called after a user's prediction resolves. If they're in an active rivalry and
 * their rival has also resolved a prediction on the same match, settles the battle:
 * both stake the pot, whoever predicted correctly (won vs lost) takes it, draws split it.
 */
export async function checkAndSettleBattle(userId: string, matchId: string): Promise<void> {
  const rivalries = await prisma.rivalry.findMany({
    where: { status: 'active', OR: [{ challengerId: userId }, { challengedId: userId }] },
  });

  for (const rivalry of rivalries) {
    const rivalId = rivalry.challengerId === userId ? rivalry.challengedId : rivalry.challengerId;

    const already = await prisma.rivalryBattle.findUnique({
      where: { rivalryId_matchId: { rivalryId: rivalry.id, matchId } },
    }).catch(() => null);
    if (already) continue;

    const [mine, theirs] = await Promise.all([
      prisma.livePrediction.findFirst({ where: { userId, matchId, status: { in: ['won', 'lost'] } }, orderBy: { resolvedAt: 'desc' } }),
      prisma.livePrediction.findFirst({ where: { userId: rivalId, matchId, status: { in: ['won', 'lost'] } }, orderBy: { resolvedAt: 'desc' } }),
    ]);
    if (!mine || !theirs) continue; // rival hasn't also predicted this match yet

    const stakePerUser = rivalry.isHighStakes ? 200 : 100;
    const pot = stakePerUser * 2;

    let winnerId: string | null = null;
    if (mine.status === 'won' && theirs.status === 'lost') winnerId = userId;
    else if (theirs.status === 'won' && mine.status === 'lost') winnerId = rivalId;
    // both won or both lost => draw

    try {
      await spendCoins(userId, stakePerUser, 'rivalry_battle_stake', `Rivalry battle stake vs match`, matchId);
      await spendCoins(rivalId, stakePerUser, 'rivalry_battle_stake', `Rivalry battle stake vs match`, matchId);
    } catch {
      continue; // insufficient coins on one side — skip this battle rather than partially stake
    }

    if (winnerId) {
      await addCoins(winnerId, pot, 'rivalry_battle_win', 'Won rivalry battle', rivalry.id);
    } else {
      await addCoins(userId, stakePerUser, 'rivalry_battle_draw', 'Rivalry battle draw — stake returned', rivalry.id);
      await addCoins(rivalId, stakePerUser, 'rivalry_battle_draw', 'Rivalry battle draw — stake returned', rivalry.id);
    }

    await prisma.rivalryBattle.create({ data: { rivalryId: rivalry.id, matchId, winnerId, potAmount: pot } });

    const isChallengerWin = winnerId === rivalry.challengerId;
    const isChallengedWin = winnerId === rivalry.challengedId;
    const existingStats = await prisma.rivalryStats.findUnique({ where: { rivalryId: rivalry.id } });
    const streakContinues = winnerId && existingStats?.streakHolder === winnerId;
    const newStreakLength = winnerId ? (streakContinues ? (existingStats?.streakLength || 0) + 1 : 1) : 0;

    await prisma.rivalryStats.upsert({
      where: { rivalryId: rivalry.id },
      create: {
        rivalryId: rivalry.id,
        challengerWins: isChallengerWin ? 1 : 0,
        challengedWins: isChallengedWin ? 1 : 0,
        draws: winnerId ? 0 : 1,
        totalBattles: 1,
        streakHolder: winnerId,
        streakLength: winnerId ? 1 : 0,
        lastBattleAt: new Date(),
      },
      update: {
        challengerWins: { increment: isChallengerWin ? 1 : 0 },
        challengedWins: { increment: isChallengedWin ? 1 : 0 },
        draws: { increment: winnerId ? 0 : 1 },
        totalBattles: { increment: 1 },
        streakHolder: winnerId,
        streakLength: newStreakLength,
        lastBattleAt: new Date(),
      },
    });

    if (rivalry.isHighStakes) await prisma.rivalry.update({ where: { id: rivalry.id }, data: { isHighStakes: false } });

    await awardXP(userId, 15, 'rivalry_battle');
    await awardXP(rivalId, 15, 'rivalry_battle');

    const resultText = winnerId ? (winnerId === userId ? 'You won' : 'Your rival won') : 'Draw';
    await notify(userId, '⚔️ Rivalry battle resolved', `${resultText} the ${pot}-coin pot.`);
    await notify(rivalId, '⚔️ Rivalry battle resolved', `${winnerId ? (winnerId === rivalId ? 'You won' : 'Your rival won') : 'Draw'} the ${pot}-coin pot.`);
  }
}
