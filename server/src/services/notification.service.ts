import { prisma } from '../lib/prisma.js';

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export const notificationService = {
  /**
   * Create a notification for a user
   */
  notify: async (userId: string, title: string, message: string, type: NotificationType = 'INFO') => {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      }
    });
  },

  /**
   * Get unread notifications for a user
   */
  getUnread: async (userId: string) => {
    return await prisma.notification.findMany({
      where: {
        userId,
        read: false
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  },

  /**
   * Get recent notifications for a user
   */
  getRecent: async (userId: string, limit: number = 10) => {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (userId: string) => {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }
};
