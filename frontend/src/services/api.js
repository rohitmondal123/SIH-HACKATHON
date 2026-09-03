import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses Vite proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mplads_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const projectService = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  getHighRiskProjects: async () => {
    const response = await api.get('/high-risk-projects');
    return response.data;
  },
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  getProjectRisk: async (projectId) => {
    const response = await api.get(`/risk/${projectId}`);
    return response.data;
  },
  submitVerification: async (projectId, payload) => {
    const response = await api.post(`/projects/${projectId}/verify`, payload);
    return response.data;
  }
};

export const dashboardService = {
  getDashboardStats: async (params = {}) => {
    const response = await api.get('/dashboard', { params });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  }
};

export const alertService = {
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },
  resolveAlert: async (alertId, notes) => {
    const response = await api.post(`/alerts/${alertId}/resolve`, null, {
      params: { resolution_notes: notes }
    });
    return response.data;
  }
};

export const simulationService = {
  analyzeCustomProject: async (payload) => {
    const response = await api.post('/analyze', payload);
    return response.data;
  }
};

export default api;
