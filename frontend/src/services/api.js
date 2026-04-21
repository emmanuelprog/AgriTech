import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    //console.log('Interceptor Token:', token); // <-- Add this to debug the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Prediction API
export const predictionAPI = {
  predict: (formData) => api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  predictBatch: (formData) => api.post('/predict/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Treatment API
export const treatmentAPI = {
  getAllDiseases: () => api.get('/diseases/list'),
  getCropTreatments: (crop) => api.get(`/treatments/${crop}`),
  getDiseaseTreatment: (crop, disease) => api.get(`/treatments/${crop}/${disease}`),
};

// History API
export const historyAPI = {
  getHistory: (params) => api.get('/history', { params }),
  saveHistory: (data) => api.post('/history', data),
  getHistoryById: (id) => api.get(`/history/${id}`),
  updateHistory: (id, data) => api.put(`/history/${id}`, data),
  deleteHistory: (id) => api.delete(`/history/${id}`),
  getStats: () => api.get('/history/stats'),
  clearHistory: () => api.delete('/history/clear'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getDiseaseDistribution: (params) => api.get('/analytics/disease-distribution', { params }),
  getConfidenceAnalysis: () => api.get('/analytics/confidence-analysis'),
  getLocationHeatmap: () => api.get('/analytics/location-heatmap'),
  getTreatmentEffectiveness: () => api.get('/analytics/treatment-effectiveness'),
  exportReport: () => api.get('/analytics/export-report'),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
  warmupAI: () => api.get('/warmup'), // calling the warmup endpoint to pre-load the AI model into memory
  getModelsStatus: () => api.get('/models/status'),
};

export default api;
