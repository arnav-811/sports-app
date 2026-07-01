import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { getOddsBoard, generateOddsBoard, placePrediction, createParlay, getUserPredictionStats } from '../services/predictionService';

const prisma = new PrismaClient();
const router = Router();

// Get odds board for a match
router.get('/match/:matchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;
    let boards = await getOddsBoard(matchId);
    if (boards.length === 0) {
      const match = await prisma.match.findUnique({ where: { id: matchId } });
      if (match && match.status === 'live') {
        boards = await generateOddsBoard(matchId, match.sportId, { homeTeam: match.homeTeam, awayTeam: match.awayTeam });
      }
    }
    res.json({ boards: boards.map(b => ({ ...b, options: JSON.parse(b.options) })) });
  } catch (e) { next(e); }
});

// Place a prediction
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId, questionId, optionId, coinsStaked } = req.body;
    if (!matchId || !questionId || !optionId || !coinsStaked) {
      return res.status(400).json({ error: 'matchId, questionId, optionId, coinsStaked are required' });
    }
    const result = await placePrediction(req.user!.userId, matchId, questionId, optionId, parseInt(coinsStaked));
    res.json(result);
  } catch (e) { next(e); }
});

// Place a parlay
router.post('/parlay', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { legs, totalStake } = req.body;
    if (!legs || !Array.isArray(legs) || legs.length < 2) {
      return res.status(400).json({ error: 'At least 2 legs required for a parlay' });
    }
    const result = await createParlay(req.user!.userId, legs, parseInt(totalStake));
    res.json(result);
  } catch (e) { next(e); }
});

// Prediction history
router.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    const predictions = await prisma.livePrediction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: limit, skip: offset,
    });
    const parlays = await prisma.parlay.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { legs: true },
    });
    res.json({ predictions, parlays });
  } catch (e) { next(e); }
});

// Prediction stats
router.get('/stats', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getUserPredictionStats(req.user!.userId);
    res.json(stats);
  } catch (e) { next(e); }
});

// Live multiplier
router.get('/multiplier', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.userId },
      select: { predictionMultiplier: true, multiplierStreak: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});

export default router;
