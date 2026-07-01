import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getProfile, getUserTakes, getUserReplies, getUserBadges,
  getUserDraftRosters, getSVScore, getGlobalSVLeaderboard,
} from '../controllers/usersController';

export const usersRouter = Router();

usersRouter.get('/sv-leaderboard', getGlobalSVLeaderboard);
usersRouter.get('/:username', getProfile);
usersRouter.get('/:username/takes', getUserTakes);
usersRouter.get('/:username/replies', getUserReplies);
usersRouter.get('/:username/badges', getUserBadges);
usersRouter.get('/:username/rosters', getUserDraftRosters);
usersRouter.get('/:username/sv-score', getSVScore);
