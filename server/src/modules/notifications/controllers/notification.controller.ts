import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';

class NotificationController {
    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const limit = req.query.limit ? Number(req.query.limit) : 30;
            const offset = req.query.offset ? Number(req.query.offset) : 0;
            const unreadOnly = req.query.unreadOnly === 'true';

            const result = await notificationService.listForUser(userId, {
                limit,
                offset,
                unreadOnly,
            });

            res.status(200).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }

    async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const count = await notificationService.getUnreadCount(userId);
            res.status(200).json({ success: true, data: { count } });
        } catch (err) {
            next(err);
        }
    }

    async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            await notificationService.markRead(userId, id as string);
            res.status(200).json({ success: true });
        } catch (err) {
            next(err);
        }
    }

    async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            await notificationService.markAllRead(userId);
            res.status(200).json({ success: true });
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            await notificationService.deleteNotification(userId, id as string);
            res.status(200).json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}

export const notificationController = new NotificationController();
export default notificationController;
