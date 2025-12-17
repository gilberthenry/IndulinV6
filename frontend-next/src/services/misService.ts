import api from '@/lib/api';

const misService = {
  // User management
  getAllUsers: async () => {
    const res = await api.get('/mis/users');
    return res.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const res = await api.put(`/mis/users/${id}/role`, { role });
    return res.data;
  },

  deleteUser: async (id: number) => {
    const res = await api.delete(`/mis/users/${id}`);
    return res.data;
  },

  resetUserPassword: async (id: number, password: string) => {
    const res = await api.put(`/mis/users/${id}/password`, { password });
    return res.data;
  },

  // Audit logs
  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string }) => {
    const res = await api.get('/mis/audit-logs', { params });
    return res.data;
  },

  // System backups
  getBackups: async () => {
    const res = await api.get('/mis/backups');
    return res.data;
  },

  createBackup: async () => {
    const res = await api.post('/mis/backups');
    return res.data;
  },

  restoreBackup: async (filename: string) => {
    const res = await api.post('/mis/backups/restore', { filename });
    return res.data;
  },

  deleteBackup: async (filename: string) => {
    const res = await api.delete(`/mis/backups/${filename}`);
    return res.data;
  },

  // System reports
  getSystemReports: async () => {
    const res = await api.get('/mis/system-reports');
    return res.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/mis/dashboard');
    return res.data;
  },

  // Notifications management
  getAllNotifications: async () => {
    const res = await api.get('/mis/notifications');
    return res.data;
  },

  sendNotification: async (data: { userId: number; message: string }) => {
    const res = await api.post('/mis/notifications', data);
    return res.data;
  },

  // Leave management
  getLeaveCredits: async () => {
    const res = await api.get('/mis/leave-credits');
    return res.data;
  },

  updateLeaveCredits: async (employeeId: number, credits: Record<string, number>) => {
    const res = await api.put(`/mis/leave-credits/${employeeId}`, credits);
    return res.data;
  },

  // Config requests
  getConfigRequests: async () => {
    const res = await api.get('/mis/config-requests');
    return res.data;
  },

  approveConfigRequest: async (id: number) => {
    const res = await api.put(`/mis/config-requests/${id}/approve`);
    return res.data;
  },

  rejectConfigRequest: async (id: number, reason: string) => {
    const res = await api.put(`/mis/config-requests/${id}/reject`, { reason });
    return res.data;
  },
};

export default misService;
