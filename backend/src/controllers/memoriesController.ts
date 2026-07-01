import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export async function getArchive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const sport = req.query.sport as string | undefined;
    const page = parseInt(req.query.page as string || '1');
    const limit = 20;

    const memories = await prisma.matchMemory.findMany({
      where: { userId, ...(sport ? { /* join to match for sport filter */ } : {}) },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ memories, page, hasMore: memories.length === limit });
  } catch (err) { next(err); }
}

export async function getArchiveStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const [total, correct, capsules] = await Promise.all([
      prisma.matchMemory.count({ where: { userId } }),
      prisma.matchMemory.count({ where: { userId, predictionCorrect: true } }),
      prisma.timeCapsule.count({ where: { userId } }),
    ]);
    res.json({ totalMatches: total, correctPredictions: correct, timeCapsules: capsules });
  } catch (err) { next(err); }
}

export async function getMatchMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const memory = await prisma.matchMemory.findFirst({
      where: { userId: req.user!.userId, matchId: req.params.matchId },
    });
    if (!memory) throw createError('Memory not found', 404);
    res.json(memory);
  } catch (err) { next(err); }
}

export async function addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notes } = req.body;
    const memory = await prisma.matchMemory.findFirst({
      where: { userId: req.user!.userId, matchId: req.params.matchId },
    });
    if (!memory) throw createError('Memory not found', 404);
    const updated = await prisma.matchMemory.update({
      where: { id: memory.id },
      data: { notes },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function createTimeCapsule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { matchId, content, sportId } = req.body;
    if (!content || !matchId || !sportId) throw createError('Missing required fields', 400);
    if (content.length > 500) throw createError('Content must be 500 chars or less', 400);

    const REVEAL_DAYS = parseInt(process.env.CAPSULE_REVEAL_DAYS || '30');
    const revealAt = new Date(Date.now() + REVEAL_DAYS * 24 * 3600000);

    const capsule = await prisma.timeCapsule.create({
      data: { userId: req.user!.userId, matchId, content, sportId, revealAt },
    });
    res.status(201).json(capsule);
  } catch (err) { next(err); }
}

export async function getMyTimeCapsules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const capsules = await prisma.timeCapsule.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(capsules);
  } catch (err) { next(err); }
}

export async function getRevealedTimeCapsules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sport = req.query.sport as string | undefined;
    const capsules = await prisma.timeCapsule.findMany({
      where: { isRevealed: true, ...(sport ? { sportId: sport } : {}) },
      include: {
        user: { select: { username: true, displayName: true, avatarUrl: true, svScore: true } },
      },
      orderBy: { revealedAt: 'desc' },
      take: 20,
    });
    res.json(capsules);
  } catch (err) { next(err); }
}

export async function likeTimeCapsule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const capsule = await prisma.timeCapsule.findUnique({ where: { id: req.params.id } });
    if (!capsule || !capsule.isRevealed) throw createError('Capsule not found or not revealed', 404);
    const updated = await prisma.timeCapsule.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ likes: updated.likes });
  } catch (err) { next(err); }
}
