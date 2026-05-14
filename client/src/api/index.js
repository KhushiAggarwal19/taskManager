import axios from 'axios';

// Base URL from environment variable (set VITE_SERVER_URL in .env)
const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

// Create an axios instance with the base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  auth: {
    login: (data) => axiosInstance.post('/auth/login', data),
    signup: (data) => axiosInstance.post('/auth/signup', data),
  },
  projects: {
    getAll: () => axiosInstance.get('/projects'),
    getById: (id) => axiosInstance.get(`/projects/${id}`),
    create: (data) => axiosInstance.post('/projects', data),
    addMember: (id, email) => axiosInstance.post(`/projects/${id}/members`, { email }),
  },
  tasks: {
    getAll: (projectId) => axiosInstance.get(`/projects/${projectId}/tasks`),
    create: (projectId, data) => axiosInstance.post(`/projects/${projectId}/tasks`, data),
    updateStatus: (projectId, taskId, status) => axiosInstance.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
    delete: (projectId, taskId) => axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`),
  }
};
