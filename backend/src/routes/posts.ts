import { Router } from 'express';
import { getFeed, getPost, createPost, editPost, deletePost, votePost, awardPost, getPostComments } from '../controllers/postsController';
import { requireAuth, optionalAuth } from '../middleware/auth';

export const postsRouter = Router();

postsRouter.get('/', optionalAuth, getFeed);
postsRouter.get('/:id', optionalAuth, getPost);
postsRouter.post('/', requireAuth, createPost);
postsRouter.patch('/:id', requireAuth, editPost);
postsRouter.delete('/:id', requireAuth, deletePost);
postsRouter.post('/:id/vote', requireAuth, votePost);
postsRouter.post('/:id/award', requireAuth, awardPost);
postsRouter.get('/:id/comments', optionalAuth, getPostComments);
