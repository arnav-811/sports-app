import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getActivePredictions, placePrediction, getPredictionHistory,
  getPredictionStats, getCoinBalance, getCoinHistory, claimDailyCoins,
} from '../controllers/predictionsController';

export const predictionsRouter = Router();

predictionsRouter.get('/match/:matchId', getActivePredictions);
predictionsRouter.post('/', requireAuth, placePrediction);
predictionsRouter.get('/history', requireAuth, getPredictionHistory);
predictionsRouter.get('/stats', requireAuth, getPredictionStats);
predictionsRouter.get('/coins/balance', requireAuth, getCoinBalance);
predictionsRouter.get('/coins/history', requireAuth, getCoinHistory);
predictionsRouter.post('/coins/daily-claim', requireAuth, claimDailyCoins);
