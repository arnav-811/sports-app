import { PrismaClient } from '@prisma/client';
import { applyGoneDarkPenalty } from './coinService';

const prisma = new PrismaClient();
const goneDarkCache = new Set<string>(); // in-memory cache (Redis unavailable)

export async function checkAllRivalries() {
  const activeRivalries = await prisma.rivalry.findMany({
    where: { status: 'active' },
    include: {
      challenger: { select: { id: true, username: true, lastLoginDate: true } },
      challenged: { select: { id: true, username: true, lastLoginDate: true } },
    },
  });

  const now = Date.now();
  const DARK_THRESHOLD_MS = 72 * 3600 * 1000; // 72 hours

  for (const rivalry of activeRivalries) {
    const { challenger, challenged } = rivalry;

    // Check challenger
    const cacheKeyC = `gone_dark:${rivalry.id}:${challenger.id}`;
    if (!goneDarkCache.has(cacheKeyC)) {
      const lastLogin = challenger.lastLoginDate ? new Date(challenger.lastLoginDate).getTime() : 0;
      if (now - lastLogin > DARK_THRESHOLD_MS) {
        await applyGoneDarkPenalty(challenger.id, challenged.id, rivalry.id);
        goneDarkCache.add(cacheKeyC);
        // Clear cache after 72 hours
        setTimeout(() => goneDarkCache.delete(cacheKeyC), DARK_THRESHOLD_MS);
      }
    }

    // Check challenged
    const cacheKeyD = `gone_dark:${rivalry.id}:${challenged.id}`;
    if (!goneDarkCache.has(cacheKeyD)) {
      const lastLogin = challenged.lastLoginDate ? new Date(challenged.lastLoginDate).getTime() : 0;
      if (now - lastLogin > DARK_THRESHOLD_MS) {
        await applyGoneDarkPenalty(challenged.id, challenger.id, rivalry.id);
        goneDarkCache.add(cacheKeyD);
        setTimeout(() => goneDarkCache.delete(cacheKeyD), DARK_THRESHOLD_MS);
      }
    }
  }
}
