import api from './api';

const hrRequestService = {
  // HR: Create new configuration request
  createRequest: async (requestData) => {
    const response = await api.post('/hr/config-requests', requestData);
    return response.data;
  },

  // HR: Get my requests
  getMyRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/hr/config-requests?${params}`);
    return response.data;
  },

  // HR: Get my request statistics
  getMyStats: async () => {
    const response = await api.get('/hr/config-requests/stats');
    return response.data;
  },

  // HR: Get single request by ID
  getRequestById: async (id) => {
    const response = await api.get(`/hr/config-requests/${id}`);
    return response.data;
  },

  // MIS: Get all requests
  getAllRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/mis/config-requests?${params}`);
    return response.data;
  },

  // MIS: Get queue statistics
  getQueueStats: async () => {
    const response = await api.get('/mis/config-requests/stats');
    return response.data;
  },

  // MIS: Assign request to MIS user
  assignRequest: async (id, assignedTo) => {
    const response = await api.put(`/mis/config-requests/${id}/assign`, { assignedTo });
    return response.data;
  },

  // MIS: Approve request
  approveRequest: async (id, reviewNotes = '') => {
    const response = await api.put(`/mis/config-requests/${id}/approve`, { reviewNotes });
    return response.data;
  },

  // MIS: Reject request
  rejectRequest: async (id, rejectionReason) => {
    const response = await api.put(`/mis/config-requests/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // MIS: Complete request
  completeRequest: async (id, completionNote = '') => {
    const response = await api.put(`/mis/config-requests/${id}/complete`, { completionNote });
    return response.data;
  },
};

export default hrRequestService;
