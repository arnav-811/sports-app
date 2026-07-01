import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  sendRivalryRequest, acceptRivalry, declineRivalry,
  getMyRivalries, getRivalryCard, getRivalrySuggestions,
} from '../controllers/rivalriesController';

export const rivalriesRouter = Router();

rivalriesRouter.get('/mine', requireAuth, getMyRivalries);
rivalriesRouter.get('/suggestions', requireAuth, getRivalrySuggestions);
rivalriesRouter.get('/:id', requireAuth, getRivalryCard);
rivalriesRouter.post('/request/:targetUserId', requireAuth, sendRivalryRequest);
rivalriesRouter.post('/:id/accept', requireAuth, acceptRivalry);
rivalriesRouter.post('/:id/decline', requireAuth, declineRivalry);
