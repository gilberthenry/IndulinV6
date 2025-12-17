import api from '@/lib/api';

export interface Notification {
  id: number;
  message: string;
  userId: number;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

const notificationService = {
  getNotifications: async (userId: number): Promise<Notification[]> => {
    const res = await api.get(`/notifications/${userId}`);
    return res.data;
  },

  markAsRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  archiveNotification: async (id: number) => {
    const res = await api.put(`/notifications/${id}/archive`);
    return res.data;
  },

  restoreNotification: async (id: number) => {
    const res = await api.put(`/notifications/${id}/restore`);
    return res.data;
  },

  deleteNotification: async (id: number) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  createNotification: async (message: string, userId: number) => {
    const res = await api.post('/notifications', { message, userId });
    return res.data;
  },
};

export default notificationService;
