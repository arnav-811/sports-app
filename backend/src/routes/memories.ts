import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  getArchive, getArchiveStats, getMatchMemory, addNote,
  createTimeCapsule, getMyTimeCapsules, getRevealedTimeCapsules, likeTimeCapsule,
} from '../controllers/memoriesController';

export const memoriesRouter = Router();

memoriesRouter.get('/archive', requireAuth, getArchive);
memoriesRouter.get('/archive/stats', requireAuth, getArchiveStats);
memoriesRouter.get('/archive/:matchId', requireAuth, getMatchMemory);
memoriesRouter.patch('/archive/:matchId/notes', requireAuth, addNote);
memoriesRouter.post('/capsules', requireAuth, createTimeCapsule);
memoriesRouter.get('/capsules/mine', requireAuth, getMyTimeCapsules);
memoriesRouter.get('/capsules/revealed', optionalAuth, getRevealedTimeCapsules);
memoriesRouter.post('/capsules/:id/like', requireAuth, likeTimeCapsule);
