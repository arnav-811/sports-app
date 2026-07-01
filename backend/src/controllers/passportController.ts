import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export async function getMyPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let passport = await prisma.sportPassport.findUnique({
      where: { userId: req.user!.userId },
      include: { stamps: { include: { sport: true } } },
    });

    if (!passport) {
      passport = await prisma.sportPassport.create({
        data: { userId: req.user!.userId },
        include: { stamps: { include: { sport: true } } },
      });
    }

    res.json(passport);
  } catch (err) { next(err); }
}

export async function getUserPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) throw createError('User not found', 404);

    const passport = await prisma.sportPassport.findUnique({
      where: { userId: user.id },
      include: { stamps: { include: { sport: true } } },
    });

    res.json(passport || { userId: user.id, stamps: [] });
  } catch (err) { next(err); }
}

export async function getSportLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stamps = await prisma.sportStamp.findMany({
      where: { sportId: req.params.sportId },
      include: {
        passport: {
          include: { user: { select: { username: true, displayName: true, avatarUrl: true, svScore: true } } },
        },
        sport: true,
      },
      orderBy: { xp: 'desc' },
      take: 50,
    });

    const total = await prisma.sportStamp.count({ where: { sportId: req.params.sportId } });

    res.json({
      stamps: stamps.map((s, i) => ({ ...s, rank: i + 1 })),
      total,
      levelDistribution: await getLevelDistribution(req.params.sportId),
    });
  } catch (err) { next(err); }
}

export async function getFullPassportLeaderboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const passports = await prisma.sportPassport.findMany({
      include: {
        stamps: { include: { sport: true } },
        user: { select: { username: true, displayName: true, avatarUrl: true, svScore: true } },
      },
    });

    const scored = passports.map(p => ({
      ...p,
      completionScore: p.stamps.reduce((sum, s) => sum + s.level, 0),
      legendStamps: p.stamps.filter(s => s.level >= 4).length,
    }));

    scored.sort((a, b) => b.completionScore - a.completionScore);
    res.json(scored.slice(0, 50).map((p, i) => ({ ...p, rank: i + 1 })));
  } catch (err) { next(err); }
}

async function getLevelDistribution(sportId: string) {
  const levels = [0, 1, 2, 3, 4];
  const dist: Record<number, number> = {};
  for (const l of levels) {
    dist[l] = await prisma.sportStamp.count({ where: { sportId, level: l } });
  }
  return dist;
}
