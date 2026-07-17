import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { awardXP } from '../services/levelService';
import { updateQuestProgress } from '../services/questService';
import { spendCoins } from '../services/coinService';

const DEBATE_DURATION_MS = 7 * 24 * 3600000;
const VOTING_PHASE_MS = 48 * 3600000;
const ENTRY_STAKE = 25;

function isVotingPhase(closedAt: Date | null): boolean {
  if (!closedAt) return false;
  const now = Date.now();
  return now >= closedAt.getTime() - VOTING_PHASE_MS && now < closedAt.getTime();
}

export async function listDebates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sport = req.query.sport as string | undefined;
    const debates = await prisma.debate.findMany({
      where: { status: { in: ['open', 'voting'] }, ...(sport ? { sportId: sport } : {}) },
      include: {
        sport: true,
        entries: { include: { user: { select: { username: true, avatarUrl: true, svScore: true } } } },
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(debates);
  } catch (err) { next(err); }
}

export async function getDebate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: {
        sport: true,
        entries: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, svScore: true } } },
          orderBy: { votes: 'desc' },
        },
      },
    });
    if (!debate) throw createError('Debate not found', 404);

    let userEntry = null;
    if (req.user) {
      userEntry = debate.entries.find(e => e.userId === req.user!.userId) || null;
    }

    // Arguments are anonymous during the voting phase — hide authorship until closed.
    const voting = debate.status === 'open' && isVotingPhase(debate.closedAt);
    const entries = (voting && debate.status !== 'closed')
      ? debate.entries.map(e => ({ ...e, user: e.userId === req.user?.userId ? e.user : null }))
      : debate.entries;

    const timeRemaining = debate.closedAt
      ? Math.max(0, debate.closedAt.getTime() - Date.now())
      : DEBATE_DURATION_MS;

    res.json({ ...debate, entries, effectiveStatus: voting ? 'voting' : debate.status, userEntry, timeRemaining });
  } catch (err) { next(err); }
}

export async function createDebate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, sideA, sideB, sportId, matchId, trigger } = req.body;
    if (!question || !sideA || !sideB || !sportId) throw createError('Missing required fields', 400);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId }, select: { level: true } });
    if (user.level < 5) throw createError('Reach Level 5 to create your own debates', 403);

    const debate = await prisma.debate.create({
      data: {
        question, sideA, sideB, sportId,
        matchId: matchId || null,
        trigger: trigger || 'manual',
        creatorId: req.user!.userId,
        closedAt: new Date(Date.now() + DEBATE_DURATION_MS),
      },
    });
    res.status(201).json(debate);
  } catch (err) { next(err); }
}

export async function enterDebate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { side, argument } = req.body;
    if (!side || !argument) throw createError('Side and argument required', 400);
    if (!['A', 'B'].includes(side)) throw createError('Side must be A or B', 400);
    if (argument.length > 280) throw createError('Argument must be 280 chars or less', 400);

    const debate = await prisma.debate.findUnique({ where: { id: req.params.id } });
    if (!debate) throw createError('Debate not found', 404);
    if (debate.status !== 'open') throw createError('Debate is no longer accepting entries', 400);
    if (isVotingPhase(debate.closedAt)) throw createError('Debate has entered its voting phase — no new entries', 400);

    await spendCoins(req.user!.userId, ENTRY_STAKE, 'debate_entry', `Entered debate: ${debate.question}`, debate.id);

    const entry = await prisma.debateEntry.create({
      data: { debateId: req.params.id, userId: req.user!.userId, side, argument, coinsStaked: ENTRY_STAKE },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    await prisma.debate.update({
      where: { id: req.params.id },
      data: { totalVoters: { increment: 1 }, coinPool: { increment: ENTRY_STAKE } },
    });

    await awardXP(req.user!.userId, 10, 'enter_debate');
    await updateQuestProgress(req.user!.userId, 'enter_debate');

    res.status(201).json(entry);
  } catch (err) { next(err); }
}

export async function voteOnEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await prisma.debateEntry.findUnique({ where: { id: req.params.entryId }, include: { debate: true } });
    if (!entry) throw createError('Entry not found', 404);
    if (entry.userId === req.user!.userId) throw createError('Cannot vote on your own argument', 400);
    if (!isVotingPhase(entry.debate.closedAt)) throw createError('Voting is only open in the final 48 hours before a debate closes', 400);

    await prisma.debateEntry.update({
      where: { id: req.params.entryId },
      data: { votes: { increment: 1 } },
    });
    res.json({ voted: true });
  } catch (err) { next(err); }
}

export async function getUserDebateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) throw createError('User not found', 404);
    const entries = await prisma.debateEntry.findMany({
      where: { userId: req.params.userId },
      include: { debate: { include: { sport: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(entries);
  } catch (err) { next(err); }
}

export async function getDebateStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [total, recent] = await Promise.all([
      prisma.debate.count(),
      prisma.debateEntry.findMany({
        where: { votes: { gt: 0 } },
        include: { user: { select: { username: true, avatarUrl: true } }, debate: { include: { sport: true } } },
        orderBy: { votes: 'desc' },
        take: 1,
      }),
    ]);
    res.json({ totalDebates: total, mostConvincingArgument: recent[0] || null });
  } catch (err) { next(err); }
}
