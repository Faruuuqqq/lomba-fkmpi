import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Try localStorage first, then cookies
  let token = localStorage.getItem('token');
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }
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
  generateMap: (projectId: string, text: string) =>
    api.post('/ai/generate-map', { projectId, text }),
  ethicsCheck: (projectId: string, text: string) =>
    api.post('/ai/ethics-check', { projectId, text }),
  getCitations: (topic: string, content: string) =>
    api.post('/ai/citations', { topic, content }),
  checkGrammar: (projectId: string, text: string) =>
    api.post('/ai/grammar-check', { projectId, text }),
  checkPlagiarism: (projectId: string, text: string) =>
    api.post('/ai/plagiarism-check', { projectId, text }),
};

export const analyticsAPI = {
  logUsage: (data: { userId?: string; feature: string; duration: number; metadata?: any }) =>
    api.post('/analytics/log', data),
  getOverview: () => api.get('/analytics/overview'),
  getDailyStats: (days?: number) => api.get(`/analytics/daily-stats?days=${days || 30}`),
  getPerformance: (feature?: string) => api.get(`/analytics/performance${feature ? `?feature=${feature}` : ''}`),
};

// Gamification API
export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  getDailyChallenge: () => api.get('/gamification/challenge'),
  submitChallenge: (challengeId: number, answerIndex: number) =>
    api.post('/gamification/challenge/submit', { challengeId, answerIndex }),
  checkBalance: (cost: number) => api.post('/gamification/check-balance', { cost }),
};

export default api;
