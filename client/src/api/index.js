import axios from 'axios';

// Add a request interceptor to attach the JWT token
axios.interceptors.request.use((config) => {
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
    login: (data) => axios.post('/auth/login', data),
    signup: (data) => axios.post('/auth/signup', data),
  },
  projects: {
    getAll: () => axios.get('/projects'),
    getById: (id) => axios.get(`/projects/${id}`),
    create: (data) => axios.post('/projects', data),
    addMember: (id, email) => axios.post(`/projects/${id}/members`, { email }),
  },
  tasks: {
    getAll: (projectId) => axios.get(`/projects/${projectId}/tasks`),
    create: (projectId, data) => axios.post(`/projects/${projectId}/tasks`, data),
    updateStatus: (projectId, taskId, status) => axios.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
    delete: (projectId, taskId) => axios.delete(`/projects/${projectId}/tasks/${taskId}`),
  }
};
