import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  listGrounds, getGround, getGroundTakes, createGround,
  joinGround, leaveGround, getGroundFlairs,
} from '../controllers/groundsController';

export const groundsRouter = Router();

groundsRouter.get('/', optionalAuth, listGrounds);
groundsRouter.get('/:name', optionalAuth, getGround);
groundsRouter.get('/:name/takes', optionalAuth, getGroundTakes);
groundsRouter.get('/:name/flairs', getGroundFlairs);
groundsRouter.post('/', requireAuth, createGround);
groundsRouter.post('/:name/join', requireAuth, joinGround);
groundsRouter.post('/:name/leave', requireAuth, leaveGround);
