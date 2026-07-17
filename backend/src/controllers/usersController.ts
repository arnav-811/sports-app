import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { sanitizeUser } from './authController';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        badges: { include: { badge: true } },
        groundMembers: { include: { ground: true } },
        passport: { include: { stamps: { include: { sport: true } } } },
      },
    });
    if (!user) throw createError('User not found', 404);
    res.json(sanitizeUser(user as Record<string, unknown>));
  } catch (err) { next(err); }
}

export async function getUserTakes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw createError('User not found', 404);
    const page = parseInt(req.query.page as string || '1');
    const limit = 20;
    const takes = await prisma.take.findMany({
      where: { authorId: user.id },
      include: { ground: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ takes, page, hasMore: takes.length === limit });
  } catch (err) { next(err); }
}

export async function getUserReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw createError('User not found', 404);
    const replies = await prisma.terraceReply.findMany({
      where: { authorId: user.id, isDeleted: false },
      include: { take: { include: { ground: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(replies);
  } catch (err) { next(err); }
}

export async function getUserBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw createError('User not found', 404);
    const badges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
    res.json(badges);
  } catch (err) { next(err); }
}

export async function getUserDraftRosters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw createError('User not found', 404);
    const rosters = await prisma.draftRoster.findMany({
      where: { userId: user.id },
      include: { league: true },
      orderBy: { totalPoints: 'desc' },
    });
    res.json(rosters);
  } catch (err) { next(err); }
}

export async function getSVScore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, svScore: true, svScoreBreakdown: true, svScoreUpdatedAt: true },
    });
    if (!user) throw createError('User not found', 404);

    const [rank, total] = await Promise.all([
      prisma.user.count({ where: { svScore: { gt: user.svScore } } }),
      prisma.user.count(),
    ]);

    const history = await prisma.sVScoreHistory.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 30,
    });

    let breakdown = null;
    if (user.svScoreBreakdown) {
      try { breakdown = JSON.parse(user.svScoreBreakdown); } catch { /* ignore */ }
    }

    res.json({
      svScore: user.svScore,
      breakdown,
      rank: rank + 1,
      total,
      percentile: total > 0 ? Math.round(((total - rank) / total) * 100) : 0,
      history,
      updatedAt: user.svScoreUpdatedAt,
    });
  } catch (err) { next(err); }
}

export async function getGlobalSVLeaderboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { svScore: 'desc' },
      take: 100,
      select: {
        id: true, username: true, displayName: true, avatarUrl: true,
        svScore: true, svScoreBreakdown: true, level: true, cred: true,
        favoriteSports: true, badges: { include: { badge: true }, take: 3 },
      },
    });
    res.json(users.map((u, i) => ({
      ...u,
      rank: i + 1,
      favoriteSports: (() => { try { return JSON.parse(u.favoriteSports); } catch { return []; } })(),
      svScoreBreakdown: (() => { if (!u.svScoreBreakdown) return null; try { return JSON.parse(u.svScoreBreakdown); } catch { return null; } })(),
    })));
  } catch (err) { next(err); }
}

export async function getLevelLeaderboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ level: 'desc' }, { xp: 'desc' }],
      take: 100,
      select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, xp: true, svScore: true },
    });
    res.json(users.map((u, i) => ({ ...u, rank: i + 1 })));
  } catch (err) { next(err); }
}

export async function getCoinsLeaderboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { sportcoins: 'desc' },
      take: 100,
      select: { id: true, username: true, displayName: true, avatarUrl: true, sportcoins: true, level: true },
    });
    res.json(users.map((u, i) => ({ ...u, rank: i + 1 })));
  } catch (err) { next(err); }
}
