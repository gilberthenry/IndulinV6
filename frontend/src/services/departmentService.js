import api from './api';

const departmentService = {
  // Get all departments
  getDepartments: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/hr/departments', { params });
    return response.data;
  },

  // Get single department
  getDepartmentById: async (id) => {
    const response = await api.get(`/hr/departments/${id}`);
    return response.data;
  },

  // Create department
  createDepartment: async (data) => {
    const response = await api.post('/hr/departments', data);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, data) => {
    const response = await api.put(`/hr/departments/${id}`, data);
    return response.data;
  },

  // Archive department
  archiveDepartment: async (id) => {
    const response = await api.put(`/hr/departments/${id}/archive`);
    return response.data;
  },

  // Unarchive department
  unarchiveDepartment: async (id) => {
    const response = await api.put(`/hr/departments/${id}/unarchive`);
    return response.data;
  },

  // Get all designations
  getDesignations: async (status = null, departmentId = null) => {
    const params = {};
    if (status) params.status = status;
    if (departmentId) params.departmentId = departmentId;
    const response = await api.get('/hr/designations', { params });
    return response.data;
  },

  // Get single designation
  getDesignationById: async (id) => {
    const response = await api.get(`/hr/designations/${id}`);
    return response.data;
  },

  // Create designation
  createDesignation: async (data) => {
    const response = await api.post('/hr/designations', data);
    return response.data;
  },

  // Update designation
  updateDesignation: async (id, data) => {
    const response = await api.put(`/hr/designations/${id}`, data);
    return response.data;
  },

  // Archive designation
  archiveDesignation: async (id) => {
    const response = await api.put(`/hr/designations/${id}/archive`);
    return response.data;
  },

  // Unarchive designation
  unarchiveDesignation: async (id) => {
    const response = await api.put(`/hr/designations/${id}/unarchive`);
    return response.data;
  }
};

export default departmentService;
