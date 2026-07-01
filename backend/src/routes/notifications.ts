import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationsController';
import { requireAuth } from '../middleware/auth';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, getNotifications);
notificationsRouter.patch('/read-all', requireAuth, markAllRead);
notificationsRouter.patch('/:id/read', requireAuth, markRead);
