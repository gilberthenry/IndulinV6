import api from './api';

const notificationService = {
  getNotifications: async (userId) => {
    const res = await api.get(`/notifications/${userId}`);
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  archiveNotification: async (id) => {
    const res = await api.put(`/notifications/${id}/archive`);
    return res.data;
  },
  restoreNotification: async (id) => {
    const res = await api.put(`/notifications/${id}/restore`);
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
  createNotification: async (message, userId) => {
    const res = await api.post('/notifications', { message, userId });
    return res.data;
  },
};

export default notificationService;