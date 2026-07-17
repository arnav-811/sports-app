import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { awardXP } from '../services/levelService';
import { updateQuestProgress } from '../services/questService';

export async function createReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body, parentId } = req.body;
    if (!body) throw createError('Body required', 400);

    let depth = 0;
    if (parentId) {
      const parent = await prisma.terraceReply.findUnique({ where: { id: parentId } });
      if (!parent) throw createError('Parent reply not found', 404);
      depth = parent.depth + 1;
      if (depth > 2) throw createError('Maximum reply depth reached', 400);
    }

    const reply = await prisma.terraceReply.create({
      data: { body, authorId: req.user!.userId, takeId: req.params.takeId, parentId, depth },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, svScore: true } },
      },
    });

    await prisma.take.update({
      where: { id: req.params.takeId },
      data: { commentCount: { increment: 1 } },
    });

    await awardXP(req.user!.userId, 2, 'terrace_reply');
    await updateQuestProgress(req.user!.userId, 'terrace_reply');

    res.status(201).json(reply);
  } catch (err) { next(err); }
}

export async function editReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reply = await prisma.terraceReply.findUnique({ where: { id: req.params.id } });
    if (!reply) throw createError('Reply not found', 404);
    if (reply.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    const updated = await prisma.terraceReply.update({
      where: { id: req.params.id },
      data: { body: req.body.body },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reply = await prisma.terraceReply.findUnique({ where: { id: req.params.id } });
    if (!reply) throw createError('Reply not found', 404);
    if (reply.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.terraceReply.update({
      where: { id: req.params.id },
      data: { isDeleted: true, body: '[deleted]' },
    });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

export async function signalReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) throw createError('Invalid signal value', 400);

    const existing = await prisma.signal.findUnique({
      where: { userId_replyId: { userId: req.user!.userId, replyId: req.params.id } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.signal.delete({ where: { id: existing.id } });
        await prisma.terraceReply.update({
          where: { id: req.params.id },
          data: { voteScore: { increment: -value } },
        });
        res.json({ signaled: false, newValue: 0 });
      } else {
        await prisma.signal.update({ where: { id: existing.id }, data: { value } });
        await prisma.terraceReply.update({
          where: { id: req.params.id },
          data: { voteScore: { increment: value * 2 } },
        });
        res.json({ signaled: true, newValue: value });
      }
    } else {
      await prisma.signal.create({ data: { userId: req.user!.userId, replyId: req.params.id, value } });
      await prisma.terraceReply.update({
        where: { id: req.params.id },
        data: { voteScore: { increment: value } },
      });
      res.json({ signaled: true, newValue: value });
    }
  } catch (err) { next(err); }
}

export async function awardReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.body;
    await prisma.receipt.create({
      data: { type, giverId: req.user!.userId, replyId: req.params.id },
    });
    res.json({ awarded: true });
  } catch (err) { next(err); }
}
