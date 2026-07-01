import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getMyPassport, getUserPassport, getSportLeaderboard, getFullPassportLeaderboard,
} from '../controllers/passportController';

export const passportRouter = Router();

passportRouter.get('/mine', requireAuth, getMyPassport);
passportRouter.get('/leaderboard/full', getFullPassportLeaderboard);
passportRouter.get('/leaderboard/:sportId', getSportLeaderboard);
passportRouter.get('/user/:username', optionalAuth, getUserPassport);
