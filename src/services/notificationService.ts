import api from "./api";

export const notificationService = {
    getRecent: async () => {
        const response = await api.get('/notifications/recent');
        return response.data;
    },

    getUnread: async () => {
        const response = await api.get('/notifications/unread');
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.post('/notifications/mark-all-read');
        return response.data;
    }
};
