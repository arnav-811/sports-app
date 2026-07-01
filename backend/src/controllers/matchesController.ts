import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';
import { createError } from '../middleware/errorHandler';
import { generateMatchAnalysis } from '../services/aiService';

export async function getLiveMatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await cacheGet<unknown[]>('matches:live');
    if (cached) { res.json(cached); return; }
    const matches = await prisma.match.findMany({
      where: { status: 'live' },
      include: { sport: true },
      orderBy: { startTime: 'asc' },
    });
    await cacheSet('matches:live', matches, 15);
    res.json(matches);
  } catch (err) { next(err); }
}

export async function getUpcomingMatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const in24h = new Date(Date.now() + 24 * 3600000);
    const matches = await prisma.match.findMany({
      where: { status: 'upcoming', startTime: { lte: in24h } },
      include: { sport: true },
      orderBy: { startTime: 'asc' },
    });
    res.json(matches);
  } catch (err) { next(err); }
}

export async function getMatchesBySport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const matches = await prisma.match.findMany({
      where: { sportId: req.params.sportId },
      include: { sport: true },
      orderBy: { startTime: 'desc' },
      take: 20,
    });
    res.json(matches);
  } catch (err) { next(err); }
}

export async function getMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: { sport: true },
    });
    if (!match) throw createError('Match not found', 404);
    res.json(match);
  } catch (err) { next(err); }
}

export async function getMatchAIAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = `ai:match:${req.params.id}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) { res.json(cached); return; }

    const match = await prisma.match.findUnique({ where: { id: req.params.id }, include: { sport: true } });
    if (!match) throw createError('Match not found', 404);

    let parsedStats: unknown = undefined;
    try { if (match.statsJson) parsedStats = JSON.parse(match.statsJson); } catch { /* leave undefined */ }
    const analysis = await generateMatchAnalysis({ ...match, statsJson: parsedStats });
    await cacheSet(cacheKey, analysis, 60);
    res.json(analysis);
  } catch (err) { next(err); }
}
