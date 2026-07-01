import { Router } from 'express';
import { listCommunities, getCommunity, getCommunityPosts, createCommunity, joinCommunity, leaveCommunity, getCommunityFlairs } from '../controllers/communitiesController';
import { requireAuth, optionalAuth } from '../middleware/auth';

export const communitiesRouter = Router();

communitiesRouter.get('/', optionalAuth, listCommunities);
communitiesRouter.get('/:name', optionalAuth, getCommunity);
communitiesRouter.get('/:name/posts', optionalAuth, getCommunityPosts);
communitiesRouter.get('/:name/flairs', getCommunityFlairs);
communitiesRouter.post('/', requireAuth, createCommunity);
communitiesRouter.post('/:name/join', requireAuth, joinCommunity);
communitiesRouter.delete('/:name/leave', requireAuth, leaveCommunity);
