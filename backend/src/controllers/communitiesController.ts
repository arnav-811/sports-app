import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

function hotScore(upvotes: number, downvotes: number, createdAt: Date): number {
  const score = upvotes - downvotes - 1;
  const ageHours = (Date.now() - createdAt.getTime()) / 3600000;
  return score / Math.pow(ageHours + 2, 1.8);
}

export async function listCommunities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sport } = req.query;
    const communities = await prisma.community.findMany({
      where: sport ? { sportId: sport as string } : undefined,
      include: { sport: true, _count: { select: { members: true } } },
      orderBy: { memberCount: 'desc' },
    });
    res.json(communities);
  } catch (err) { next(err); }
}

export async function getCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const community = await prisma.community.findUnique({
      where: { name: req.params.name },
      include: { sport: true, flairs: true, _count: { select: { members: true, posts: true } } },
    });
    if (!community) throw createError('Community not found', 404);
    let isMember = false;
    if (req.user) {
      const m = await prisma.communityMember.findUnique({ where: { userId_communityId: { userId: req.user.userId, communityId: community.id } } });
      isMember = !!m;
    }
    res.json({ ...community, isMember });
  } catch (err) { next(err); }
}

export async function getCommunityPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const community = await prisma.community.findUnique({ where: { name: req.params.name } });
    if (!community) throw createError('Community not found', 404);
    const sort = (req.query.sort as string) || 'hot';
    const page = parseInt(req.query.page as string || '1');
    const limit = 25;

    const posts = await prisma.post.findMany({
      where: { communityId: community.id },
      include: { author: { select: { username: true, avatarUrl: true, level: true } }, community: true, pollOptions: true },
      orderBy: sort === 'new' ? { createdAt: 'desc' } : sort === 'top' ? { voteScore: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: sort === 'hot' ? limit * 2 : limit, // fetch more for hot sort
    });

    let result = posts;
    if (sort === 'hot') {
      result = posts
        .sort((a, b) => {
          const scoreA = hotScore(a.upvotes, a.downvotes, a.createdAt) * (a.type === 'match_thread' ? 3 : 1) * (Date.now() - a.createdAt.getTime() < 3600000 ? 2 : 1);
          const scoreB = hotScore(b.upvotes, b.downvotes, b.createdAt) * (b.type === 'match_thread' ? 3 : 1) * (Date.now() - b.createdAt.getTime() < 3600000 ? 2 : 1);
          return scoreB - scoreA;
        })
        .slice(0, limit);
    }

    res.json({ posts: result, page, hasMore: posts.length === limit });
  } catch (err) { next(err); }
}

export async function createCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, displayName, description, icon, sportId } = req.body;
    if (!name || !displayName || !sportId) throw createError('name, displayName, sportId required', 400);
    const community = await prisma.community.create({
      data: { name, displayName, description: description || '', icon: icon || '🏟️', sportId, memberCount: 1 },
    });
    await prisma.communityMember.create({ data: { userId: req.user!.userId, communityId: community.id, role: 'admin' } });
    res.status(201).json(community);
  } catch (err) { next(err); }
}

export async function joinCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const community = await prisma.community.findUnique({ where: { name: req.params.name } });
    if (!community) throw createError('Community not found', 404);
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: req.user!.userId, communityId: community.id } },
      update: {},
      create: { userId: req.user!.userId, communityId: community.id },
    });
    await prisma.community.update({ where: { id: community.id }, data: { memberCount: { increment: 1 } } });
    res.json({ joined: true });
  } catch (err) { next(err); }
}

export async function leaveCommunity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const community = await prisma.community.findUnique({ where: { name: req.params.name } });
    if (!community) throw createError('Community not found', 404);
    await prisma.communityMember.deleteMany({ where: { userId: req.user!.userId, communityId: community.id } });
    await prisma.community.update({ where: { id: community.id }, data: { memberCount: { decrement: 1 } } });
    res.json({ left: true });
  } catch (err) { next(err); }
}

export async function getCommunityFlairs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const community = await prisma.community.findUnique({ where: { name: req.params.name } });
    if (!community) throw createError('Community not found', 404);
    const flairs = await prisma.flair.findMany({ where: { communityId: community.id } });
    res.json(flairs);
  } catch (err) { next(err); }
}
