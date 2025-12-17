import api from '@/lib/api';

const hrService = {
  // Employee management
  getAllEmployees: async () => {
    const res = await api.get('/hr/employees');
    return res.data;
  },

  getEmployee: async (id: number) => {
    const res = await api.get(`/hr/employees/${id}`);
    return res.data;
  },

  createEmployee: async (data: FormData) => {
    const res = await api.post('/hr/employees', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateEmployee: async (id: number, data: FormData) => {
    const res = await api.put(`/hr/employees/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteEmployee: async (id: number) => {
    const res = await api.delete(`/hr/employees/${id}`);
    return res.data;
  },

  // Leave management
  getAllLeaves: async () => {
    const res = await api.get('/hr/leaves');
    return res.data;
  },

  approveLeave: async (id: number) => {
    const res = await api.put(`/hr/leaves/${id}/approve`);
    return res.data;
  },

  rejectLeave: async (id: number, reason: string) => {
    const res = await api.put(`/hr/leaves/${id}/reject`, { reason });
    return res.data;
  },

  // Contract management
  getAllContracts: async () => {
    const res = await api.get('/hr/contracts');
    return res.data;
  },

  createContract: async (data: FormData) => {
    const res = await api.post('/hr/contracts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateContract: async (id: number, data: FormData) => {
    const res = await api.put(`/hr/contracts/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Certificate management
  getAllCertificates: async () => {
    const res = await api.get('/hr/certificates');
    return res.data;
  },

  approveCertificate: async (id: number) => {
    const res = await api.put(`/hr/certificates/${id}/approve`);
    return res.data;
  },

  rejectCertificate: async (id: number, reason: string) => {
    const res = await api.put(`/hr/certificates/${id}/reject`, { reason });
    return res.data;
  },

  // Document management
  getAllDocuments: async () => {
    const res = await api.get('/hr/documents');
    return res.data;
  },

  // Department management
  getDepartments: async () => {
    const res = await api.get('/hr/departments');
    return res.data;
  },

  createDepartment: async (data: { name: string; description?: string }) => {
    const res = await api.post('/hr/departments', data);
    return res.data;
  },

  updateDepartment: async (id: number, data: { name: string; description?: string }) => {
    const res = await api.put(`/hr/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (id: number) => {
    const res = await api.delete(`/hr/departments/${id}`);
    return res.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/hr/dashboard');
    return res.data;
  },

  // Bulk upload
  bulkUpload: async (data: FormData) => {
    const res = await api.post('/hr/bulk-upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default hrService;
