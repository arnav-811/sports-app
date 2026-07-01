import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export async function createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body, postId, parentId } = req.body;
    if (!body || !postId) throw createError('body and postId required', 400);

    let depth = 0;
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) throw createError('Parent comment not found', 404);
      depth = Math.min(parent.depth + 1, 2);
    }

    const comment = await prisma.comment.create({
      data: { body, postId, authorId: req.user!.userId, parentId: parentId || null, depth },
      include: { author: { select: { username: true, avatarUrl: true, level: true } } },
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    res.status(201).json(comment);
  } catch (err) { next(err); }
}

export async function editComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw createError('Comment not found', 404);
    if (comment.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    const updated = await prisma.comment.update({ where: { id: req.params.id }, data: { body: req.body.body } });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw createError('Comment not found', 404);
    if (comment.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.comment.update({ where: { id: req.params.id }, data: { isDeleted: true, body: '[deleted]' } });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

export async function voteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) throw createError('value must be 1 or -1', 400);
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw createError('Comment not found', 404);

    const existing = await prisma.vote.findUnique({ where: { userId_commentId: { userId: req.user!.userId, commentId: comment.id } } });
    if (existing) {
      if (existing.value === value) {
        await prisma.vote.delete({ where: { id: existing.id } });
        await prisma.comment.update({ where: { id: comment.id }, data: { voteScore: { decrement: value } } });
        res.json({ voteScore: comment.voteScore - value, userVote: null });
      } else {
        await prisma.vote.update({ where: { id: existing.id }, data: { value } });
        await prisma.comment.update({ where: { id: comment.id }, data: { voteScore: { increment: value * 2 } } });
        res.json({ voteScore: comment.voteScore + value * 2, userVote: value });
      }
    } else {
      await prisma.vote.create({ data: { userId: req.user!.userId, commentId: comment.id, value } });
      await prisma.comment.update({ where: { id: comment.id }, data: { voteScore: { increment: value } } });
      res.json({ voteScore: comment.voteScore + value, userVote: value });
    }
  } catch (err) { next(err); }
}

export async function awardComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.body;
    if (!type) throw createError('Award type required', 400);
    const award = await prisma.award.create({ data: { type, giverId: req.user!.userId, commentId: req.params.id } });
    res.status(201).json(award);
  } catch (err) { next(err); }
}
