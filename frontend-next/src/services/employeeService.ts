import api from '@/lib/api';

const employeeService = {
  getProfile: async () => {
    const res = await api.get('/employee/profile');
    return res.data;
  },

  updateProfile: async (data: FormData) => {
    const res = await api.put('/employee/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getLeaves: async () => {
    const res = await api.get('/employee/leaves');
    return res.data;
  },

  applyLeave: async (data: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const res = await api.post('/employee/leaves', data);
    return res.data;
  },

  getContracts: async () => {
    const res = await api.get('/employee/contracts');
    return res.data;
  },

  getDocuments: async () => {
    const res = await api.get('/employee/documents');
    return res.data;
  },

  uploadDocument: async (data: FormData) => {
    const res = await api.post('/employee/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getCertificates: async () => {
    const res = await api.get('/employee/certificates');
    return res.data;
  },

  requestCertificate: async (data: { type: string; purpose: string }) => {
    const res = await api.post('/employee/certificates/request', data);
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/employee/dashboard');
    return res.data;
  },
};

export default employeeService;
