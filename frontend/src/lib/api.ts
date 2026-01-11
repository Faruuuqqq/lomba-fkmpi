import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const projectsAPI = {
  create: (title: string) => api.post('/projects', { title }),
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  save: (id: string, content: string) =>
    api.patch(`/projects/${id}/save`, { content }),
  finish: (id: string, reflection?: string) =>
    api.patch(`/projects/${id}/finish`, { reflection }),
  getSnapshots: (id: string) => api.get(`/projects/${id}/snapshots`),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const aiAPI = {
  analyze: (projectId: string, currentText: string, userQuery: string) =>
    api.post('/ai/analyze', { projectId, currentText, userQuery }),
  getChatHistory: (projectId: string) => api.get(`/ai/chat-history/${projectId}`),
};

export default api;
