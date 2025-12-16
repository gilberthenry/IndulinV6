import api from './api';

const misService = {
  getAuditLogs: async () => {
    const res = await api.get('/mis/audit-logs');
    return res.data;
  },
  createBackup: async () => {
    const res = await api.post('/mis/backups');
    return res.data;
  },
  updateAccount: async (id, updates) => {
    const res = await api.put(`/mis/accounts/${id}`, updates);
    return res.data;
  },
  getSystemReport: async () => {
    const res = await api.get('/mis/reports/system');
    return res.data;
  },
  getAccounts: async () => {
    const res = await api.get('/mis/accounts');
    return res.data;
  },
  disableAccount: async (id) => {
    const res = await api.patch(`/mis/accounts/${id}/disable`);
    return res.data;
  },
  reactivateAccount: async (id) => {
    const res = await api.patch(`/mis/accounts/${id}/reactivate`);
    return res.data;
  },
  // Contract viewing (read-only for MIS)
  getContracts: async (params) => {
    const res = await api.get('/hr/contracts', { params });
    return res.data;
  },
  getExpiringContracts: async (days = 30) => {
    const res = await api.get('/hr/contracts/expiring', { params: { days } });
    return res.data;
  },
  getContractReport: async () => {
    const res = await api.get('/hr/reports/contracts');
    return res.data;
  },
  
  // Document management (same access as HR)
  getDocuments: async () => {
    return api.get('/hr/documents');
  },
  viewDocument: async (id) => {
    return api.get(`/hr/documents/${id}/view`, { responseType: 'blob' });
  },
  approveDocument: async (id) => {
    return api.put(`/hr/documents/${id}/approve`);
  },
  rejectDocument: async (id, reason) => {
    return api.put(`/hr/documents/${id}/reject`, { reason });
  },
  
  // System notifications (MIS only)
  getSystemNotifications: async () => {
    const res = await api.get('/mis/notifications');
    return res.data;
  },
  createSystemNotification: async (notification) => {
    const res = await api.post('/mis/notifications', notification);
    return res.data;
  },
  markSystemNotificationRead: async (id) => {
    const res = await api.put(`/mis/notifications/${id}/read`);
    return res.data;
  },
  deleteSystemNotification: async (id) => {
    const res = await api.delete(`/mis/notifications/${id}`);
    return res.data;
  },
  
  // Password management
  resetPassword: async (accountId, newPassword) => {
    const res = await api.post(`/mis/accounts/${accountId}/reset-password`, { newPassword });
    return res.data;
  },
};

export default misService;