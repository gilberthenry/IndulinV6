import api from './api';

const employeeService = {
  getProfile: async () => {
    const res = await api.get('/employee/profile');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/employee/profile', profileData);
    return res.data;
  },
  uploadProfileImage: async (formData) => {
    const res = await api.post('/employee/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  requestProfileChange: async (changeData) => {
    const res = await api.post('/employee/profile/request-change', changeData);
    return res.data;
  },
  getMyChangeRequests: async () => {
    const res = await api.get('/employee/profile/change-requests');
    return res.data;
  },
  getCurrentContract: async () => {
    const res = await api.get('/employee/contract/current');
    return res.data;
  },
  getAllContracts: async () => {
    const res = await api.get('/employee/contracts');
    return res.data;
  },
  getLeaves: async () => {
    const res = await api.get('/employee/leaves');
    return res.data;
  },
  getLeaveCredits: async () => {
    const res = await api.get('/employee/leave-credits');
    return res.data;
  },
  requestLeave: async (leaveData) => {
    const res = await api.post('/employee/leave', leaveData);
    return res.data;
  },
  getDocuments: async () => {
    const res = await api.get('/employee/documents');
    return res.data;
  },
  uploadDocument: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/employee/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  requestCertificate: async (certificates) => {
    const res = await api.post('/employee/certificate', { certificates });
    return res.data;
  },
  getCertificateRequests: async () => {
    const res = await api.get('/employee/certificates');
    return res.data;
  },
};

export default employeeService;