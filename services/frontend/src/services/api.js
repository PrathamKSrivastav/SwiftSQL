import axios from 'axios';

// Use environment variable for API base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Export all API endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
};

export const databaseAPI = {
  getConnections: () => apiClient.get('/database/connections'),
  createConnection: (data) => apiClient.post('/database/connections', data),
  testConnection: (data) => apiClient.post('/database/test', data),
  deleteConnection: (id) => apiClient.delete(`/database/connections/${id}`),
  getTables: (connectionId) => apiClient.get(`/database/connections/${connectionId}/tables`),
};

export const queryAPI = {
  executeQuery: (data) => apiClient.post('/query/execute', data),
  convertToSQL: (data) => apiClient.post('/query/convert', data),
  getHistory: () => apiClient.get('/query/history', { params: { limit: 10 } }),
  deleteQuery: (id) => apiClient.delete(`/query/history/${id}`),
};
