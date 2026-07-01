import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listDraftLeagues, getLeaderboard, getMyRosters, createRoster,
  updateRoster, getPlayers, getLivePoints, joinLeague, saveTeam, deleteRoster,
} from '../controllers/draftwarsController';

export const draftwarsRouter = Router();

draftwarsRouter.get('/leagues',                           listDraftLeagues);
draftwarsRouter.get('/leagues/:leagueId/leaderboard',     getLeaderboard);
draftwarsRouter.post('/leagues/:leagueId/join',           requireAuth, joinLeague);
draftwarsRouter.post('/leagues/:leagueId/save-team',      requireAuth, saveTeam);
draftwarsRouter.get('/my-rosters',                        requireAuth, getMyRosters);
draftwarsRouter.get('/live-points',                       requireAuth, getLivePoints);
draftwarsRouter.get('/players/:sport',                    getPlayers);
draftwarsRouter.post('/rosters',                          requireAuth, createRoster);
draftwarsRouter.put('/rosters/:id',                       requireAuth, updateRoster);
draftwarsRouter.delete('/rosters/:id',                    requireAuth, deleteRoster);
