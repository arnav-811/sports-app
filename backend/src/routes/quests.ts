import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { getUserQuests, generateDailyQuests, generateWeeklyQuest, generateMonthlyQuest } from '../services/questService';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Auto-generate if missing
    await Promise.allSettled([
      generateDailyQuests(req.user!.userId),
      generateWeeklyQuest(req.user!.userId),
      generateMonthlyQuest(req.user!.userId),
    ]);
    const quests = await getUserQuests(req.user!.userId);
    res.json(quests);
  } catch (e) { next(e); }
});

router.get('/daily', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quests = await generateDailyQuests(req.user!.userId);
    res.json({ quests });
  } catch (e) { next(e); }
});

router.get('/weekly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quest = await generateWeeklyQuest(req.user!.userId);
    res.json({ quest });
  } catch (e) { next(e); }
});

router.get('/monthly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quest = await generateMonthlyQuest(req.user!.userId);
    res.json({ quest });
  } catch (e) { next(e); }
});

// Dev only: force regenerate
router.post('/daily/generate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV !== 'development') return res.status(403).json({ error: 'Dev only' });
    const quests = await generateDailyQuests(req.user!.userId);
    res.json({ quests });
  } catch (e) { next(e); }
});

export default router;
