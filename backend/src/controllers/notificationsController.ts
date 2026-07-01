import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string || '1');
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } });
    res.json({ notifications, unreadCount, page });
  } catch (err) { next(err); }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.userId }, data: { isRead: true } });
    res.json({ read: true });
  } catch (err) { next(err); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.userId }, data: { isRead: true } });
    res.json({ read: true });
  } catch (err) { next(err); }
}
