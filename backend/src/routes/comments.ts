import { Router } from 'express';
import { createComment, editComment, deleteComment, voteComment, awardComment } from '../controllers/commentsController';
import { requireAuth } from '../middleware/auth';

export const commentsRouter = Router();

commentsRouter.post('/', requireAuth, createComment);
commentsRouter.patch('/:id', requireAuth, editComment);
commentsRouter.delete('/:id', requireAuth, deleteComment);
commentsRouter.post('/:id/vote', requireAuth, voteComment);
commentsRouter.post('/:id/award', requireAuth, awardComment);
