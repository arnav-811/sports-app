import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  listDraftLeagues, getLeaderboard, getMyRosters, createRoster,
  updateRoster, getPlayers, getLivePoints, joinLeague, saveTeam, deleteRoster,
  createLeague, joinLeagueByInvite, setPlayerStats, resolveLeague,
} from '../controllers/draftwarsController';

export const draftwarsRouter = Router();

draftwarsRouter.get('/leagues',                           listDraftLeagues);
draftwarsRouter.post('/leagues',                          requireAuth, createLeague);
draftwarsRouter.post('/leagues/join',                     requireAuth, joinLeagueByInvite);
draftwarsRouter.get('/leagues/:leagueId/leaderboard',     getLeaderboard);
draftwarsRouter.post('/leagues/:leagueId/join',           requireAuth, joinLeague);
draftwarsRouter.post('/leagues/:leagueId/save-team',      requireAuth, saveTeam);
draftwarsRouter.post('/leagues/:leagueId/player-stats',   requireAuth, requireAdmin, setPlayerStats);
draftwarsRouter.post('/leagues/:leagueId/resolve',        requireAuth, requireAdmin, resolveLeague);
draftwarsRouter.get('/my-rosters',                        requireAuth, getMyRosters);
draftwarsRouter.get('/live-points',                       requireAuth, getLivePoints);
draftwarsRouter.get('/players/:sport',                    getPlayers);
draftwarsRouter.post('/rosters',                          requireAuth, createRoster);
draftwarsRouter.put('/rosters/:id',                       requireAuth, updateRoster);
draftwarsRouter.delete('/rosters/:id',                    requireAuth, deleteRoster);
