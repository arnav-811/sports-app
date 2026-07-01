import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { cacheGet, cacheSet } from '../lib/redis';

const TAKE_INCLUDE = {
  author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, cred: true, svScore: true } },
  ground: { select: { id: true, name: true, displayName: true, sportId: true } },
  pollOptions: true,
  _count: { select: { terraceReplies: true } },
};

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sport = req.query.sport as string | undefined;
    const sort = (req.query.sort as string) || 'hot';
    const page = parseInt(req.query.page as string || '1');
    const limit = 20;

    const where = sport ? { ground: { sportId: sport } } : undefined;
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'top') orderBy = { voteScore: 'desc' };

    const takes = await prisma.take.findMany({
      where,
      include: TAKE_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = sort === 'hot' ? takes.sort((a, b) => hotScore(b) - hotScore(a)) : takes;
    res.json({ takes: result, page, hasMore: takes.length === limit });
  } catch (err) { next(err); }
}

export async function getTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const take = await prisma.take.findUnique({
      where: { id: req.params.id },
      include: { ...TAKE_INCLUDE, receipts: { include: { giver: { select: { username: true, avatarUrl: true } } } } },
    });
    if (!take) throw createError('Take not found', 404);

    let userSignal = 0;
    if (req.user) {
      const sig = await prisma.signal.findUnique({
        where: { userId_takeId: { userId: req.user.userId, takeId: take.id } },
      });
      userSignal = sig?.value ?? 0;
    }
    res.json({ ...take, userSignal });
  } catch (err) { next(err); }
}

export async function createTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, body, type, groundId, sportId, flair, matchId, pollOptions } = req.body;
    if (!title || !groundId) throw createError('Missing required fields', 400);

    const take = await prisma.take.create({
      data: { title, body, type: type || 'text', authorId: req.user!.userId, groundId, sportId, flair, matchId },
      include: TAKE_INCLUDE,
    });

    if (type === 'poll' && Array.isArray(pollOptions)) {
      await prisma.pollOption.createMany({
        data: pollOptions.map((text: string) => ({ takeId: take.id, text })),
      });
    }

    await prisma.ground.update({ where: { id: groundId }, data: { takeCount: { increment: 1 } } });
    res.status(201).json(take);
  } catch (err) { next(err); }
}

export async function editTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const take = await prisma.take.findUnique({ where: { id: req.params.id } });
    if (!take) throw createError('Take not found', 404);
    if (take.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    const updated = await prisma.take.update({
      where: { id: req.params.id },
      data: { body: req.body.body, flair: req.body.flair },
      include: TAKE_INCLUDE,
    });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const take = await prisma.take.findUnique({ where: { id: req.params.id } });
    if (!take) throw createError('Take not found', 404);
    if (take.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.take.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

export async function signalTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { value } = req.body; // 1 = back, -1 = doubt
    if (value !== 1 && value !== -1) throw createError('Invalid signal value', 400);

    const existing = await prisma.signal.findUnique({
      where: { userId_takeId: { userId: req.user!.userId, takeId: req.params.id } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.signal.delete({ where: { id: existing.id } });
        await prisma.take.update({
          where: { id: req.params.id },
          data: {
            voteScore: { increment: -value },
            upvotes: value === 1 ? { decrement: 1 } : undefined,
            downvotes: value === -1 ? { decrement: 1 } : undefined,
          },
        });
        res.json({ signaled: false, newValue: 0 });
      } else {
        await prisma.signal.update({ where: { id: existing.id }, data: { value } });
        await prisma.take.update({
          where: { id: req.params.id },
          data: {
            voteScore: { increment: value * 2 },
            upvotes: value === 1 ? { increment: 1 } : { decrement: 1 },
            downvotes: value === -1 ? { increment: 1 } : { decrement: 1 },
          },
        });
        res.json({ signaled: true, newValue: value });
      }
    } else {
      await prisma.signal.create({ data: { userId: req.user!.userId, takeId: req.params.id, value } });
      await prisma.take.update({
        where: { id: req.params.id },
        data: {
          voteScore: { increment: value },
          upvotes: value === 1 ? { increment: 1 } : undefined,
          downvotes: value === -1 ? { increment: 1 } : undefined,
        },
      });
      res.json({ signaled: true, newValue: value });
    }
  } catch (err) { next(err); }
}

export async function awardTake(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.body;
    await prisma.receipt.create({
      data: { type, giverId: req.user!.userId, takeId: req.params.id },
    });
    res.json({ awarded: true });
  } catch (err) { next(err); }
}

export async function getTakeReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const replies = await prisma.terraceReply.findMany({
      where: { takeId: req.params.id, parentId: null },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, svScore: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, svScore: true } },
          },
          where: { isDeleted: false },
        },
      },
      where: { takeId: req.params.id, parentId: null, isDeleted: false } as Parameters<typeof prisma.terraceReply.findMany>[0]['where'],
      orderBy: { voteScore: 'desc' },
    });
    res.json(replies);
  } catch (err) { next(err); }
}

function hotScore(take: { upvotes: number; downvotes: number; createdAt: Date; type: string }): number {
  const score = take.upvotes - take.downvotes - 1;
  const ageHours = (Date.now() - take.createdAt.getTime()) / 3600000;
  const base = score / Math.pow(ageHours + 2, 1.8);
  return base * (ageHours < 1 ? 2 : 1) * (take.type === 'match_thread' ? 3 : 1);
}

export async function getCIFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const sport = req.query.sport as string | undefined;
    const limit = 20;

    // Get user's SV score bucket for peer-group ranking
    let svBucket = 0;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { svScore: true } });
      svBucket = Math.floor((user?.svScore || 0) / 500) * 500;
    }

    // Try cache first
    const cacheKey = `feed:ci:${sport || 'all'}:sv${svBucket}`;
    const cached = await cacheGet<unknown[]>(cacheKey);
    if (cached) { res.json({ takes: cached, svBucket, peerGroupSize: 841 }); return; }

    const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
    const takes = await prisma.take.findMany({
      where: {
        createdAt: { gte: twoHoursAgo },
        ...(sport ? { ground: { sportId: sport } } : {}),
      },
      include: TAKE_INCLUDE,
      orderBy: { voteScore: 'desc' },
      take: limit,
    });

    await cacheSet(cacheKey, takes, 60);
    res.json({ takes, svBucket, peerGroupSize: Math.floor(Math.random() * 2000) + 500 });
  } catch (err) { next(err); }
}
