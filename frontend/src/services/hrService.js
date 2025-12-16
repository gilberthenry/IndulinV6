import api from './api';

const hrService = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/hr/dashboard/stats');
    return res.data;
  },

  // Employee management
  getEmployees: async (params) => {
    const res = await api.get('/hr/employees', { params });
    return res.data;
  },
  getEmployeeById: async (id) => {
    const res = await api.get(`/hr/employees/${id}`);
    return res.data;
  },
  createEmployee: async (employeeData) => {
    const res = await api.post('/hr/employees', employeeData);
    return res.data;
  },
  updateEmployee: async (id, employeeData) => {
    const res = await api.put(`/hr/employees/${id}`, employeeData);
    return res.data;
  },
  
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/hr/employees/bulk-upload', formData);
    return res.data;
  },

  previewBulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/hr/employees/bulk-upload/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  confirmBulkUpload: async (file, autoCreateContracts = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoCreateContracts', autoCreateContracts);
    const res = await api.post('/hr/employees/bulk-upload/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  downloadEmployeeTemplate: async () => {
    const res = await api.get('/hr/employees/template/download', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employee_bulk_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  },
  
  // Contract management
  getContracts: async (params) => {
    const res = await api.get('/hr/contracts', { params });
    return res.data;
  },
  createContract: async (contractData) => {
    const res = await api.post('/hr/contracts', contractData);
    return res.data;
  },
  updateContract: async (id, contractData) => {
    const res = await api.put(`/hr/contracts/${id}`, contractData);
    return res.data;
  },
  renewContract: async (id, renewalData) => {
    const res = await api.post(`/hr/contracts/${id}/renew`, renewalData);
    return res.data;
  },
  terminateContract: async (id, reason) => {
    const res = await api.post(`/hr/contracts/${id}/terminate`, { terminationReason: reason });
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
  getLeaveReport: async () => {
    const res = await api.get('/hr/reports/leaves');
    return res.data;
  },
  getDocumentReport: async () => {
    const res = await api.get('/hr/reports/documents');
    return res.data;
  },
  
  // Certificate management
  getCertificateRequests: async () => {
    return api.get('/hr/certificates/requests');
  },
  approveCertificate: async (id) => {
    return api.put(`/hr/certificates/${id}/approve`);
  },
  rejectCertificate: async (id, remarks) => {
    return api.put(`/hr/certificates/${id}/reject`, { remarks });
  },
  uploadCertificateFile: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/hr/certificates/${id}/upload`, formData);
  },

  // Document management
  getDocuments: async () => {
    const res = await api.get('/hr/documents');
    return res.data;
  },
  viewDocument: async (id) => {
    return api.get(`/hr/documents/${id}/view`, { responseType: 'blob' });
  },
  approveDocument: async (id) => {
    const res = await api.put(`/hr/documents/${id}/approve`);
    return res.data;
  },
  rejectDocument: async (id, reason) => {
    const res = await api.put(`/hr/documents/${id}/reject`, { reason });
    return res.data;
  },
  requestDocument: async (employeeId, documentType, reason) => {
    const res = await api.post('/hr/documents/request', { employeeId, documentType, reason });
    return res.data;
  },

  // Leave management
  getLeaves: async (params) => {
    const res = await api.get('/hr/leaves', { params });
    return res.data;
  },
  getLeaveCalendar: async (month, year) => {
    const res = await api.get('/hr/leaves/calendar', { params: { month, year } });
    return res.data;
  },
  createLeave: async (leaveData) => {
    const res = await api.post('/hr/leaves', leaveData);
    return res.data;
  },
  approveLeave: async (id) => {
    const res = await api.put(`/hr/leaves/${id}/approve`);
    return res.data;
  },
  rejectLeave: async (id, reason) => {
    const res = await api.put(`/hr/leaves/${id}/reject`, { reason });
    return res.data;
  },
  deleteLeave: async (id) => {
    const res = await api.delete(`/hr/leaves/${id}`);
    return res.data;
  },

  // Leave Credits management
  getLeaveCredits: async (schoolYear) => {
    const res = await api.get('/hr/leave-credits', { params: { schoolYear } });
    return res.data;
  },
  getEmployeeLeaveCredits: async (employeeId, schoolYear) => {
    const res = await api.get(`/hr/leave-credits/${employeeId}`, { params: { schoolYear } });
    return res.data;
  },
  getCreditSummary: async (schoolYear) => {
    const res = await api.get('/hr/leave-credits/summary', { params: { schoolYear } });
    return res.data;
  },
  resetLeaveCredits: async (schoolYear) => {
    const res = await api.post('/hr/leave-credits/reset', { schoolYear });
    return res.data;
  },
  updateEmployeeCredits: async (employeeId, employmentType, schoolYear) => {
    const res = await api.put(`/hr/leave-credits/${employeeId}`, { employmentType, schoolYear });
    return res.data;
  },

  // Department management
  getDepartments: async (status = null) => {
    const params = status ? { status } : {};
    const res = await api.get('/hr/departments', { params });
    return res.data;
  },
  getDepartmentById: async (id) => {
    const res = await api.get(`/hr/departments/${id}`);
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/hr/departments', data);
    return res.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/hr/departments/${id}`, data);
    return res.data;
  },
  archiveDepartment: async (id) => {
    const res = await api.put(`/hr/departments/${id}/archive`);
    return res.data;
  },
  unarchiveDepartment: async (id) => {
    const res = await api.put(`/hr/departments/${id}/unarchive`);
    return res.data;
  },

  // Designation management
  getDesignations: async (status = null, departmentId = null) => {
    const params = {};
    if (status) params.status = status;
    if (departmentId) params.departmentId = departmentId;
    const res = await api.get('/hr/designations', { params });
    return res.data;
  },
  getDesignationById: async (id) => {
    const res = await api.get(`/hr/designations/${id}`);
    return res.data;
  },
  createDesignation: async (data) => {
    const res = await api.post('/hr/designations', data);
    return res.data;
  },
  updateDesignation: async (id, data) => {
    const res = await api.put(`/hr/designations/${id}`, data);
    return res.data;
  },
  archiveDesignation: async (id) => {
    const res = await api.put(`/hr/designations/${id}/archive`);
    return res.data;
  },
  unarchiveDesignation: async (id) => {
    const res = await api.put(`/hr/designations/${id}/unarchive`);
    return res.data;
  },

  // Profile change requests
  getProfileChangeRequests: async (status) => {
    const params = status ? { status } : {};
    const res = await api.get('/hr/profile-requests', { params });
    return res.data;
  },
  getProfileChangeRequestById: async (id) => {
    const res = await api.get(`/hr/profile-requests/${id}`);
    return res.data;
  },
  approveProfileChange: async (id, reviewNotes) => {
    const res = await api.put(`/hr/profile-requests/${id}/approve`, { reviewNotes });
    return res.data;
  },
  rejectProfileChange: async (id, reviewNotes) => {
    const res = await api.put(`/hr/profile-requests/${id}/reject`, { reviewNotes });
    return res.data;
  },
};

export default hrService;