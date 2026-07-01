import { Router } from 'express';
import { getLiveMatches, getUpcomingMatches, getMatchesBySport, getMatch, getMatchAIAnalysis } from '../controllers/matchesController';
import { optionalAuth } from '../middleware/auth';

export const matchesRouter = Router();

matchesRouter.get('/live', optionalAuth, getLiveMatches);
matchesRouter.get('/upcoming', optionalAuth, getUpcomingMatches);
matchesRouter.get('/sport/:sportId', optionalAuth, getMatchesBySport);
matchesRouter.get('/:id', optionalAuth, getMatch);
matchesRouter.get('/:id/ai-analysis', optionalAuth, getMatchAIAnalysis);
