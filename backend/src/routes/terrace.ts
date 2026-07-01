import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createReply, editReply, deleteReply, signalReply, awardReply } from '../controllers/terraceController';

export const terraceRouter = Router();

terraceRouter.post('/takes/:takeId/replies', requireAuth, createReply);
terraceRouter.put('/:id', requireAuth, editReply);
terraceRouter.delete('/:id', requireAuth, deleteReply);
terraceRouter.post('/:id/signal', requireAuth, signalReply);
terraceRouter.post('/:id/receipt', requireAuth, awardReply);
