import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getFeed, getTake, createTake, editTake, deleteTake,
  signalTake, awardTake, getTakeReplies, getCIFeed,
} from '../controllers/takesController';

export const takesRouter = Router();

takesRouter.get('/', optionalAuth, getFeed);
takesRouter.get('/ci-feed', optionalAuth, getCIFeed);
takesRouter.get('/:id', optionalAuth, getTake);
takesRouter.get('/:id/terrace', optionalAuth, getTakeReplies);
takesRouter.post('/', requireAuth, createTake);
takesRouter.put('/:id', requireAuth, editTake);
takesRouter.delete('/:id', requireAuth, deleteTake);
takesRouter.post('/:id/signal', requireAuth, signalTake);
takesRouter.post('/:id/receipt', requireAuth, awardTake);
