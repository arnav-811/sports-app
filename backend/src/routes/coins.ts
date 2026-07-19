import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { getBalance, getTransactionHistory, getCoinStats, claimDailyLogin, AlreadyClaimedError } from '../services/coinService';
import { getStoreItems, purchaseItem, getUserPurchases } from '../services/coinStoreService';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/daily-claim', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId }, select: { lastClaimDate: true } });
    const alreadyClaimed = user.lastClaimDate
      ? user.lastClaimDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
      : false;
    res.json({ alreadyClaimed });
  } catch (e) { next(e); }
});

router.get('/gone-dark-status', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 3600000);
    const txn = await prisma.coinTransaction.findFirst({
      where: { userId: req.user!.userId, reason: 'gone_dark', createdAt: { gte: dayAgo } },
      orderBy: { createdAt: 'desc' },
    });
    if (!txn) { res.json({ wasGoneDark: false }); return; }
    const rivalry = txn.referenceId ? await prisma.rivalry.findUnique({
      where: { id: txn.referenceId },
      include: { challenger: { select: { username: true } }, challenged: { select: { username: true } } },
    }) : null;
    const rivalName = rivalry
      ? (rivalry.challengerId === req.user!.userId ? rivalry.challenged.username : rivalry.challenger.username)
      : null;
    res.json({ wasGoneDark: true, coinsLost: Math.abs(txn.amount), rivalName });
  } catch (e) { next(e); }
});

router.get('/balance', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await getBalance(req.user!.userId);
    res.json({ balance });
  } catch (e) { next(e); }
});

router.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    const type = req.query.type as string | undefined;
    const history = await getTransactionHistory(req.user!.userId, limit, offset, type);
    res.json({ transactions: history });
  } catch (e) { next(e); }
});

router.get('/stats', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getCoinStats(req.user!.userId);
    res.json(stats);
  } catch (e) { next(e); }
});

router.post('/daily-claim', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await claimDailyLogin(req.user!.userId);
    res.json(result);
  } catch (e) {
    if (e instanceof AlreadyClaimedError) return res.status(409).json({ error: 'Already claimed today', alreadyClaimed: true });
    next(e);
  }
});

router.get('/store', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await getStoreItems();
    res.json({ items });
  } catch (e) { next(e); }
});

router.post('/store/purchase/:itemId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await purchaseItem(req.user!.userId, req.params.itemId);
    res.json(result);
  } catch (e) { next(e); }
});

router.get('/purchases', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchases = await getUserPurchases(req.user!.userId);
    res.json({ purchases });
  } catch (e) { next(e); }
});

export default router;
