import { Router } from 'express';
import { getLeagues, getLeague, getLeaderboard, getMyTeams, createOrUpdateTeam, getPlayers, getLivePoints } from '../controllers/fantasyController';
import { requireAuth, optionalAuth } from '../middleware/auth';

export const fantasyRouter = Router();

fantasyRouter.get('/leagues', optionalAuth, getLeagues);
fantasyRouter.get('/leagues/:id', optionalAuth, getLeague);
fantasyRouter.get('/leagues/:id/leaderboard', optionalAuth, getLeaderboard);
fantasyRouter.get('/leagues/:id/live-points', optionalAuth, getLivePoints);
fantasyRouter.get('/my-teams', requireAuth, getMyTeams);
fantasyRouter.post('/teams', requireAuth, createOrUpdateTeam);
fantasyRouter.get('/players/:sportId', optionalAuth, getPlayers);
