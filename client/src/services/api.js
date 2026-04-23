import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifeline_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lifeline_token');
      localStorage.removeItem('lifeline_admin');
    }
    return Promise.reject(error);
  }
);

// ============================================================
// HOSPITAL APIs
// ============================================================
export const getHospitals = async (params = {}) => {
  const response = await api.get('/hospitals', { params });
  return response.data;
};

export const getNearbyHospitals = async (params = {}) => {
  const response = await api.get('/hospitals/nearby', { params });
  return response.data;
};

export const getHospitalById = async (id, params = {}) => {
  const response = await api.get(`/hospitals/${id}`, { params });
  return response.data;
};

export const updateHospital = async (data) => {
  const response = await api.post('/hospitals/update', data);
  return response.data;
};

// ============================================================
// SYMPTOM ANALYZER API
// ============================================================
export const analyzeSymptoms = async (symptoms) => {
  const response = await api.post('/analyze', { symptoms });
  return response.data;
};

// ============================================================
// RECOMMENDATION API
// ============================================================
export const getRecommendations = async (location, urgency = 'Medium') => {
  const response = await api.post('/recommend', { location, urgency });
  return response.data;
};

// ============================================================
// AUTH APIs
// ============================================================
export const loginAdmin = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;
