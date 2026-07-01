import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const POST_INCLUDE = {
  author: { select: { username: true, avatarUrl: true, level: true, isPremium: true } },
  community: { select: { name: true, displayName: true, icon: true, sport: true } },
  pollOptions: true,
  awards: true,
};

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = 25;
    const sportId = req.query.sport as string | undefined;

    let communityIds: string[] | undefined;
    if (req.user) {
      const memberships = await prisma.communityMember.findMany({ where: { userId: req.user.userId }, select: { communityId: true } });
      communityIds = memberships.map((m) => m.communityId);
    }

    const posts = await prisma.post.findMany({
      where: {
        ...(communityIds?.length ? { communityId: { in: communityIds } } : {}),
        ...(sportId ? { community: { sportId } } : {}),
      },
      include: POST_INCLUDE,
      orderBy: { voteScore: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json({ posts, page, hasMore: posts.length === limit });
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: { ...POST_INCLUDE, comments: { where: { depth: 0, isDeleted: false }, include: { author: { select: { username: true, avatarUrl: true, level: true } }, replies: { include: { author: { select: { username: true, avatarUrl: true, level: true } } } } }, take: 20 } } });
    if (!post) throw createError('Post not found', 404);
    let userVote: number | null = null;
    if (req.user) {
      const vote = await prisma.vote.findUnique({ where: { userId_postId: { userId: req.user.userId, postId: post.id } } });
      userVote = vote?.value ?? null;
    }
    res.json({ ...post, userVote });
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, body, type, communityId, communityName, flair, matchId, imageUrl, pollOptions } = req.body;
    if (!title) throw createError('Title required', 400);

    let resolvedCommunityId = communityId;
    if (!resolvedCommunityId && communityName) {
      const c = await prisma.community.findUnique({ where: { name: communityName } });
      if (!c) throw createError('Community not found', 404);
      resolvedCommunityId = c.id;
    }
    if (!resolvedCommunityId) throw createError('communityId or communityName required', 400);

    const post = await prisma.post.create({
      data: {
        title,
        body: body || null,
        type: type || 'text',
        authorId: req.user!.userId,
        communityId: resolvedCommunityId,
        flair: flair || null,
        matchId: matchId || null,
        imageUrl: imageUrl || null,
      },
      include: POST_INCLUDE,
    });

    if (type === 'poll' && Array.isArray(pollOptions)) {
      await prisma.pollOption.createMany({ data: pollOptions.map((text: string) => ({ postId: post.id, text })) });
    }

    await prisma.community.update({ where: { id: resolvedCommunityId }, data: { postCount: { increment: 1 } } });
    res.status(201).json(post);
  } catch (err) { next(err); }
}

export async function editPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw createError('Post not found', 404);
    if (post.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { body: req.body.body, flair: req.body.flair },
      include: POST_INCLUDE,
    });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw createError('Post not found', 404);
    if (post.authorId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (err) { next(err); }
}

export async function votePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) throw createError('value must be 1 or -1', 400);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw createError('Post not found', 404);

    const existing = await prisma.vote.findUnique({ where: { userId_postId: { userId: req.user!.userId, postId: post.id } } });

    if (existing) {
      if (existing.value === value) {
        // Remove vote (toggle)
        await prisma.vote.delete({ where: { id: existing.id } });
        await prisma.post.update({ where: { id: post.id }, data: { voteScore: { decrement: value }, ...(value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } }) } });
        res.json({ voteScore: post.voteScore - value, userVote: null });
      } else {
        await prisma.vote.update({ where: { id: existing.id }, data: { value } });
        await prisma.post.update({ where: { id: post.id }, data: { voteScore: { increment: value * 2 }, ...(value === 1 ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } : { downvotes: { increment: 1 }, upvotes: { decrement: 1 } }) } });
        res.json({ voteScore: post.voteScore + value * 2, userVote: value });
      }
    } else {
      await prisma.vote.create({ data: { userId: req.user!.userId, postId: post.id, value } });
      await prisma.post.update({ where: { id: post.id }, data: { voteScore: { increment: value }, ...(value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } }) } });
      res.json({ voteScore: post.voteScore + value, userVote: value });
    }
  } catch (err) { next(err); }
}

export async function awardPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type } = req.body;
    if (!type) throw createError('Award type required', 400);
    const award = await prisma.award.create({ data: { type, giverId: req.user!.userId, postId: req.params.id } });
    res.status(201).json(award);
  } catch (err) { next(err); }
}

export async function getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sort = (req.query.sort as string) || 'best';
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.id, depth: 0, isDeleted: false },
      include: {
        author: { select: { username: true, avatarUrl: true, level: true } },
        awards: true,
        replies: {
          include: {
            author: { select: { username: true, avatarUrl: true, level: true } },
            replies: { include: { author: { select: { username: true, avatarUrl: true, level: true } } } },
          },
        },
      },
      orderBy: sort === 'new' ? { createdAt: 'desc' } : sort === 'top' ? { voteScore: 'desc' } : { voteScore: 'desc' },
      take: 50,
    });
    res.json(comments);
  } catch (err) { next(err); }
}
