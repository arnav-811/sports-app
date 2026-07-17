import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { spendCoins } from '../services/coinService';

const MAX_ACTIVE_RIVALRIES = 5;

const RIVAL_INCLUDE = {
  challenger: { select: { id: true, username: true, displayName: true, avatarUrl: true, svScore: true, cred: true } },
  challenged: { select: { id: true, username: true, displayName: true, avatarUrl: true, svScore: true, cred: true } },
  stats: true,
};

export async function sendRivalryRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.targetUserId } });
    if (!target) throw createError('User not found', 404);
    if (target.id === req.user!.userId) throw createError('Cannot rival yourself', 400);

    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId }, select: { level: true } });
    if (me.level < 10) throw createError('Reach Level 10 to unlock Rivalries', 403);
    if (target.level < 10) throw createError('This user has not unlocked Rivalries yet', 400);

    const activeCount = await prisma.rivalry.count({
      where: { status: { in: ['pending', 'active'] }, OR: [{ challengerId: req.user!.userId }, { challengedId: req.user!.userId }] },
    });
    if (activeCount >= MAX_ACTIVE_RIVALRIES) throw createError(`Max ${MAX_ACTIVE_RIVALRIES} active rivalries`, 400);

    const rivalry = await prisma.rivalry.create({
      data: { challengerId: req.user!.userId, challengedId: target.id },
      include: RIVAL_INCLUDE,
    });

    await prisma.rivalry.update({
      where: { id: rivalry.id },
      data: { stats: { create: {} } },
    });

    res.status(201).json(rivalry);
  } catch (err) { next(err); }
}

export async function acceptRivalry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rivalry = await prisma.rivalry.findUnique({ where: { id: req.params.id } });
    if (!rivalry) throw createError('Rivalry not found', 404);
    if (rivalry.challengedId !== req.user!.userId) throw createError('Forbidden', 403);
    const updated = await prisma.rivalry.update({
      where: { id: req.params.id },
      data: { status: 'active', acceptedAt: new Date() },
      include: RIVAL_INCLUDE,
    });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function declineRivalry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rivalry = await prisma.rivalry.findUnique({ where: { id: req.params.id } });
    if (!rivalry) throw createError('Rivalry not found', 404);
    if (rivalry.challengedId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.rivalry.update({ where: { id: req.params.id }, data: { status: 'declined' } });
    res.json({ declined: true });
  } catch (err) { next(err); }
}

export async function getMyRivalries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rivalries = await prisma.rivalry.findMany({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: { in: ['active', 'pending'] },
      },
      include: RIVAL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    res.json(rivalries);
  } catch (err) { next(err); }
}

export async function getRivalryCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rivalry = await prisma.rivalry.findUnique({
      where: { id: req.params.id },
      include: RIVAL_INCLUDE,
    });
    if (!rivalry) throw createError('Rivalry not found', 404);

    const stats = rivalry.stats;
    const challengerSVHistory = (() => {
      if (!stats?.challengerSVHistory) return [];
      try { return JSON.parse(stats.challengerSVHistory); } catch { return []; }
    })();
    const challengedSVHistory = (() => {
      if (!stats?.challengedSVHistory) return [];
      try { return JSON.parse(stats.challengedSVHistory); } catch { return []; }
    })();

    res.json({ ...rivalry, stats: stats ? { ...stats, challengerSVHistory, challengedSVHistory } : null });
  } catch (err) { next(err); }
}

export async function raiseStakes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rivalry = await prisma.rivalry.findUnique({ where: { id: req.params.id } });
    if (!rivalry) throw createError('Rivalry not found', 404);
    if (rivalry.status !== 'active') throw createError('Rivalry is not active', 400);
    if (![rivalry.challengerId, rivalry.challengedId].includes(req.user!.userId)) throw createError('Forbidden', 403);
    if (rivalry.isHighStakes) throw createError('Already high stakes for the next battle', 400);

    await spendCoins(req.user!.userId, 100, 'rivalry_high_stakes', 'Raised rivalry stakes to 400 coins', rivalry.id);
    const updated = await prisma.rivalry.update({ where: { id: req.params.id }, data: { isHighStakes: true } });

    const rivalId = rivalry.challengerId === req.user!.userId ? rivalry.challengedId : rivalry.challengerId;
    await prisma.notification.create({
      data: { userId: rivalId, type: 'rivalry_high_stakes', title: '🔥 High Stakes!', body: 'Your rival raised the next battle to a 400-coin pot.', link: '/rivalries', isRead: false },
    });

    res.json(updated);
  } catch (err) { next(err); }
}

export async function getRivalrySuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { svScore: true, favoriteSports: true },
    });
    if (!user) throw createError('User not found', 404);

    const range = 500;
    const existing = await prisma.rivalry.findMany({
      where: { OR: [{ challengerId: req.user!.userId }, { challengedId: req.user!.userId }] },
      select: { challengerId: true, challengedId: true },
    });
    const existingIds = new Set(existing.flatMap(r => [r.challengerId, r.challengedId]));
    existingIds.add(req.user!.userId);

    const suggestions = await prisma.user.findMany({
      where: {
        svScore: { gte: user.svScore - range, lte: user.svScore + range },
        id: { notIn: Array.from(existingIds) },
      },
      select: { id: true, username: true, displayName: true, avatarUrl: true, svScore: true, cred: true, favoriteSports: true },
      take: 5,
      orderBy: { svScore: 'desc' },
    });

    res.json(suggestions.map(s => ({
      ...s,
      favoriteSports: (() => { try { return JSON.parse(s.favoriteSports); } catch { return []; } })(),
    })));
  } catch (err) { next(err); }
}
