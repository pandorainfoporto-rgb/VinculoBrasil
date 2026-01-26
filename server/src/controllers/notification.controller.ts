import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export const notificationController = {
    getRecent: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const notifications = await notificationService.getRecent(userId);
            return res.json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to get notifications' });
        }
    },

    getUnread: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const notifications = await notificationService.getUnread(userId);
            return res.json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to get unread notifications' });
        }
    },

    markAsRead: async (req: Request, res: Response) => {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : '';
            if (!id) {
                return res.status(400).json({ error: 'Invalid notification ID' });
            }
            await notificationService.markAsRead(id);
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to mark as read' });
        }
    },

    markAllAsRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await notificationService.markAllAsRead(userId);
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to mark all as read' });
        }
    }
};
