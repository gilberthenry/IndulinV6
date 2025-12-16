import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    // Depending on your backend, you might want to invalidate the token
    console.log('Logged out');
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', email);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post(`/auth/reset-password/${data.token}`, { password: data.password });
    return response.data;
  },
};

export default authService;