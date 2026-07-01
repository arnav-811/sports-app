import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export async function listGrounds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sport = req.query.sport as string | undefined;
    const grounds = await prisma.ground.findMany({
      where: sport ? { sportId: sport } : undefined,
      include: { sport: true, _count: { select: { members: true, takes: true } } },
      orderBy: { memberCount: 'desc' },
    });
    res.json(grounds);
  } catch (err) { next(err); }
}

export async function getGround(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ground = await prisma.ground.findUnique({
      where: { name: req.params.name },
      include: { sport: true, flairs: true, _count: { select: { members: true, takes: true } } },
    });
    if (!ground) throw createError('Ground not found', 404);

    let isMember = false;
    if (req.user) {
      const membership = await prisma.groundMember.findUnique({
        where: { userId_groundId: { userId: req.user.userId, groundId: ground.id } },
      });
      isMember = !!membership;
    }
    res.json({ ...ground, isMember });
  } catch (err) { next(err); }
}

export async function getGroundTakes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ground = await prisma.ground.findUnique({ where: { name: req.params.name } });
    if (!ground) throw createError('Ground not found', 404);

    const sort = (req.query.sort as string) || 'hot';
    const page = parseInt(req.query.page as string || '1');
    const limit = 20;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'top') orderBy = { voteScore: 'desc' };
    if (sort === 'new') orderBy = { createdAt: 'desc' };

    const takes = await prisma.take.findMany({
      where: { groundId: ground.id },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, cred: true, svScore: true } },
        ground: { select: { id: true, name: true, displayName: true } },
        pollOptions: true,
        _count: { select: { terraceReplies: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = sort === 'hot' ? takes.sort((a, b) => hotScore(b) - hotScore(a)) : takes;
    res.json({ takes: result, page, hasMore: takes.length === limit });
  } catch (err) { next(err); }
}

export async function createGround(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, displayName, description, sportId, icon } = req.body;
    if (!name || !displayName || !sportId) throw createError('Missing required fields', 400);
    const ground = await prisma.ground.create({
      data: { name: name.toLowerCase(), displayName, description: description || '', sportId, icon: icon || '🏟️' },
    });
    res.status(201).json(ground);
  } catch (err) { next(err); }
}

export async function joinGround(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ground = await prisma.ground.findUnique({ where: { name: req.params.name } });
    if (!ground) throw createError('Ground not found', 404);
    await prisma.groundMember.upsert({
      where: { userId_groundId: { userId: req.user!.userId, groundId: ground.id } },
      create: { userId: req.user!.userId, groundId: ground.id },
      update: {},
    });
    await prisma.ground.update({ where: { id: ground.id }, data: { memberCount: { increment: 1 } } });
    res.json({ joined: true });
  } catch (err) { next(err); }
}

export async function leaveGround(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ground = await prisma.ground.findUnique({ where: { name: req.params.name } });
    if (!ground) throw createError('Ground not found', 404);
    await prisma.groundMember.delete({
      where: { userId_groundId: { userId: req.user!.userId, groundId: ground.id } },
    }).catch(() => {});
    await prisma.ground.update({
      where: { id: ground.id },
      data: { memberCount: { decrement: 1 } },
    });
    res.json({ left: true });
  } catch (err) { next(err); }
}

export async function getGroundFlairs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ground = await prisma.ground.findUnique({ where: { name: req.params.name } });
    if (!ground) throw createError('Ground not found', 404);
    const flairs = await prisma.flair.findMany({ where: { groundId: ground.id } });
    res.json(flairs);
  } catch (err) { next(err); }
}

function hotScore(take: { upvotes: number; downvotes: number; createdAt: Date; type: string }): number {
  const score = take.upvotes - take.downvotes - 1;
  const ageHours = (Date.now() - take.createdAt.getTime()) / 3600000;
  const base = score / Math.pow(ageHours + 2, 1.8);
  const recentBoost = ageHours < 1 ? 2 : 1;
  const threadBoost = take.type === 'match_thread' ? 3 : 1;
  return base * recentBoost * threadBoost;
}
