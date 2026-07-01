import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  listDebates, getDebate, createDebate, enterDebate,
  voteOnEntry, getUserDebateHistory, getDebateStats,
} from '../controllers/debatesController';

export const debatesRouter = Router();

debatesRouter.get('/', optionalAuth, listDebates);
debatesRouter.get('/stats', getDebateStats);
debatesRouter.get('/user/:userId/history', getUserDebateHistory);
debatesRouter.get('/:id', optionalAuth, getDebate);
debatesRouter.post('/', requireAuth, createDebate);
debatesRouter.post('/:id/enter', requireAuth, enterDebate);
debatesRouter.post('/:id/entries/:entryId/vote', requireAuth, voteOnEntry);
