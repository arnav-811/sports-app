import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) { res.json({ takes: [], grounds: [], users: [] }); return; }

    const [takes, grounds, users] = await Promise.all([
      prisma.take.findMany({
        where: { title: { contains: q } },
        include: { author: { select: { username: true, avatarUrl: true } }, ground: true },
        take: 10,
      }),
      prisma.ground.findMany({
        where: { OR: [{ name: { contains: q } }, { displayName: { contains: q } }] },
        include: { sport: true },
        take: 5,
      }),
      prisma.user.findMany({
        where: { OR: [{ username: { contains: q } }, { displayName: { contains: q } }] },
        select: { id: true, username: true, displayName: true, avatarUrl: true, level: true, cred: true, svScore: true },
        take: 5,
      }),
    ]);

    res.json({ takes, grounds, users });
  } catch (err) { next(err); }
}
