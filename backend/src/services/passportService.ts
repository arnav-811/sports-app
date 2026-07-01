import { prisma } from '../lib/prisma';

const LEVEL_THRESHOLDS = [0, 100, 500, 1500, 4000];
const LEVEL_NAMES = ['Casual', 'Fan', 'Enthusiast', 'Expert', 'Legend'];

function getLevelFromXP(xp: number): { level: number; levelName: string; xpToNextLevel: number } {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  const xpToNextLevel = level < 4 ? LEVEL_THRESHOLDS[level + 1] - xp : 0;
  return { level, levelName: LEVEL_NAMES[level], xpToNextLevel };
}

export async function addXP(userId: string, sportId: string, amount: number, reason: string): Promise<void> {
  try {
    let passport = await prisma.sportPassport.findUnique({ where: { userId } });
    if (!passport) {
      passport = await prisma.sportPassport.create({ data: { userId } });
    }

    let stamp = await prisma.sportStamp.findUnique({
      where: { passportId_sportId: { passportId: passport.id, sportId } },
    });

    if (!stamp) {
      stamp = await prisma.sportStamp.create({
        data: { passportId: passport.id, sportId, xp: 0 },
      });
    }

    const newXP = stamp.xp + amount;
    const { level, levelName, xpToNextLevel } = getLevelFromXP(newXP);
    const leveledUp = level > stamp.level;

    await prisma.sportStamp.update({
      where: { id: stamp.id },
      data: {
        xp: newXP,
        level,
        levelName,
        xpToNextLevel,
        ...(leveledUp && level === 4 ? { legacyAt: new Date() } : {}),
        ...(reason === 'take' ? { takesPosted: { increment: 1 } } : {}),
        ...(reason === 'prediction' || reason === 'prediction_win' ? { predictionsPlaced: { increment: 1 } } : {}),
        ...(reason === 'debate' || reason === 'debate_win' ? { debatesEntered: { increment: 1 } } : {}),
        ...(reason === 'live_follow' ? { matchesFollowed: { increment: 1 } } : {}),
        ...(reason === 'draftwars' ? { draftWarsPlayed: { increment: 1 } } : {}),
      },
    });

    if (leveledUp) {
      // Award coins for leveling up
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { sportcoins: true } });
      if (user) {
        const newBalance = user.sportcoins + 100;
        await prisma.user.update({ where: { id: userId }, data: { sportcoins: { increment: 100 }, totalCoinsEarned: { increment: 100 } } });
        await prisma.coinTransaction.create({
          data: { userId, amount: 100, reason: `passport_levelup_${sportId}_${levelName}`, balance: newBalance },
        });
        await prisma.notification.create({
          data: {
            userId,
            type: 'passport_levelup',
            title: `${LEVEL_NAMES[level]} ${sportId} fan! 🎉`,
            body: `You reached ${levelName} on your ${sportId} Sport Stamp! +100 Sportcoins awarded.`,
          },
        });
      }
    }
  } catch { /* non-fatal */ }
}

export async function getPassport(userId: string) {
  return prisma.sportPassport.findUnique({
    where: { userId },
    include: { stamps: { include: { sport: true } } },
  });
}
