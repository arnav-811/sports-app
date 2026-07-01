import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as directorService from '../services/directorService';
import { THIS_WEEK_LANDSCAPE } from '../data/positionTemplates';

const router = Router();
router.use(requireAuth);

function userId(req: Request): string {
  return (req.user as { userId: string }).userId;
}

// Profile
router.get('/profile', async (req, res: Response) => {
  try {
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    res.json(profile);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/dashboard', async (req, res: Response) => {
  try {
    const data = await directorService.getDirectorDashboard(userId(req));
    res.json(data);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/portfolio', async (req, res: Response) => {
  try {
    const data = await directorService.getPortfolioValue(userId(req));
    res.json(data);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

// Market
router.get('/market', async (req, res: Response) => {
  try {
    const { sportId, category, level, timeHorizon, sort } = req.query as Record<string, string>;
    const positions = await directorService.getAvailablePositions(userId(req), { sportId, category, level, timeHorizon, sort });
    res.json(positions);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/market/landscape', (_req, res: Response) => {
  res.json(THIS_WEEK_LANDSCAPE);
});

router.get('/market/contrarian', async (req, res: Response) => {
  try {
    const results = await directorService.getContrarianFinderResults(userId(req));
    res.json(results);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/market/:id', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const pos = await prisma.availablePosition.findUniqueOrThrow({ where: { id: req.params.id }, include: { sport: true } });
    res.json(pos);
  } catch (e: unknown) { res.status(404).json({ error: 'Position not found' }); }
});

router.get('/market/:id/scout-report', async (req, res: Response) => {
  try {
    const { spendCoins } = await import('../services/coinService');
    await spendCoins(userId(req), 50, 'director_scout_report', `Scout Report: position ${req.params.id}`);
    const report = await directorService.getScoutReport(req.params.id);
    res.json(report);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/market/sport/:sportId', async (req, res: Response) => {
  try {
    const positions = await directorService.getAvailablePositions(userId(req), { sportId: req.params.sportId });
    res.json(positions);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

// User positions
router.get('/positions', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    const positions = await prisma.position.findMany({
      where: { directorId: profile.id },
      include: { sport: true, events: { orderBy: { createdAt: 'desc' }, take: 3 }, insurance: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(positions);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/positions/open', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    const positions = await prisma.position.findMany({
      where: { directorId: profile.id, status: 'open' },
      include: { sport: true, events: { orderBy: { createdAt: 'desc' }, take: 3 }, insurance: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(positions);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/positions/history', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    const positions = await prisma.position.findMany({
      where: { directorId: profile.id, status: { not: 'open' } },
      include: { sport: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(positions);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.post('/positions/take', async (req, res: Response) => {
  try {
    const { availPosId, coinsStaked, isCounter } = req.body;
    if (!availPosId || !coinsStaked) return res.status(400).json({ error: 'availPosId and coinsStaked required' });
    const position = await directorService.takePosition(userId(req), availPosId, parseInt(coinsStaked), !!isCounter);
    res.json(position);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.post('/positions/:id/add', async (req, res: Response) => {
  try {
    const { additionalCoins } = req.body;
    if (!additionalCoins) return res.status(400).json({ error: 'additionalCoins required' });
    const position = await directorService.addToPosition(userId(req), req.params.id, parseInt(additionalCoins));
    res.json(position);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.post('/positions/:id/exit', async (req, res: Response) => {
  try {
    const position = await directorService.exitPosition(userId(req), req.params.id);
    res.json(position);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.post('/positions/:id/insure', async (req, res: Response) => {
  try {
    const insurance = await directorService.purchaseInsurance(userId(req), req.params.id);
    res.json(insurance);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/positions/:id/events', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const events = await prisma.positionEvent.findMany({
      where: { positionId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(events);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

// Intelligence
router.get('/intel/alerts', async (req, res: Response) => {
  try {
    const alerts = await directorService.getIntelligenceAlerts(userId(req));
    res.json(alerts);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.post('/intel/alerts/:id/read', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    await prisma.intelligenceAlert.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ ok: true });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.post('/intel/trend-alert/:positionId', async (req, res: Response) => {
  try {
    const { spendCoins } = await import('../services/coinService');
    await spendCoins(userId(req), 75, 'director_trend_alert', `Trend Alert: position ${req.params.positionId}`);
    res.json({ ok: true, message: 'Trend alerts activated for this position' });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

// Social
router.post('/social/follow/:directorUserId', async (req, res: Response) => {
  try {
    const follow = await directorService.followDirector(userId(req), req.params.directorUserId);
    res.json(follow);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.delete('/social/follow/:directorUserId', async (req, res: Response) => {
  try {
    await directorService.unfollowDirector(userId(req), req.params.directorUserId);
    res.json({ ok: true });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/social/followers', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    const followers = await prisma.directorFollow.findMany({
      where: { followedId: profile.id },
      include: { follower: { include: { user: true } } },
    });
    res.json(followers.map(f => f.follower));
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/social/following', async (req, res: Response) => {
  try {
    const { prisma } = await import('../lib/prisma');
    const profile = await directorService.getOrCreateDirectorProfile(userId(req));
    const following = await prisma.directorFollow.findMany({
      where: { followerId: profile.id },
      include: { followed: { include: { user: true } } },
    });
    res.json(following.map(f => f.followed));
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.post('/social/mirror/:positionId', async (req, res: Response) => {
  try {
    const { coinsStaked } = req.body;
    if (!coinsStaked) return res.status(400).json({ error: 'coinsStaked required' });
    const mirror = await directorService.mirrorPosition(userId(req), req.params.positionId, parseInt(coinsStaked));
    res.json(mirror);
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/social/feed', async (req, res: Response) => {
  try {
    const feed = await directorService.getFollowingFeed(userId(req));
    res.json(feed);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

// Leaderboard
router.get('/leaderboard', async (req, res: Response) => {
  try {
    const { period, sportId } = req.query as Record<string, string>;
    const board = await directorService.getDirectorLeaderboard(period || 'alltime', sportId);
    res.json(board);
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/leaderboard/accuracy', async (req, res: Response) => {
  try {
    const board = await directorService.getDirectorLeaderboard('alltime');
    res.json(board.sort((a, b) => b.accuracyRate - a.accuracyRate));
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/leaderboard/returns', async (req, res: Response) => {
  try {
    const board = await directorService.getDirectorLeaderboard('alltime');
    res.json(board.sort((a, b) => b.portfolioReturn - a.portfolioReturn));
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.get('/leaderboard/contrarian', async (req, res: Response) => {
  try {
    const board = await directorService.getDirectorLeaderboard('alltime');
    res.json(board.sort((a, b) => b.contrairianWins - a.contrairianWins));
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

export { router as directorRouter };
