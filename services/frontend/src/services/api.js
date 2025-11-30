import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  googleCallback: (code) => apiClient.post('/auth/google/callback', { code }),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
};

// Query APIs
export const queryAPI = {
  executeQuery: (data) => apiClient.post('/query/execute', data),
  convertToSQL: (data) => apiClient.post('/query/convert', data),
  getHistory: () => apiClient.get('/query/history'),
  deleteQuery: (id) => apiClient.delete(`/query/history/${id}`),
};

// Database APIs
export const databaseAPI = {
  getConnections: () => apiClient.get('/database/connections'),
  createConnection: (data) => apiClient.post('/database/connections', data),
  testConnection: (data) => apiClient.post('/database/test', data),
  deleteConnection: (connectionId) => apiClient.delete(`/database/connections/${connectionId}`),
  getTables: (connectionId) => apiClient.get(`/database/connections/${connectionId}/tables`),
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
};

export default apiClient;
