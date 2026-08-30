import { jwtDecode } from 'jwt-decode';

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8000';

const getToken = () => localStorage.getItem('token');

const getHeaders = (contentType = 'application/json') => {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
};

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: getHeaders(),
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(url, config);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    const genericMessages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Authentication required. Please sign in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      413: 'File is too large. Please upload a smaller file.',
      422: 'The request could not be processed. Please try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Our team has been notified.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }
    const message = genericMessages[response.status] || `Request failed: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const auth = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.detail || 'Login failed');
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
  },
  register: async (username, email, password) => {
    return request('/api/register', {
      method: 'POST',
      body: { username, email, password },
    });
  },
  updateUser: async (username) => {
    return request('/api/me', {
      method: 'PUT',
      body: { username },
    });
  },
  deleteUser: async () => {
    return request('/api/me', { method: 'DELETE' });
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  decodeToken: () => {
    const token = getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    const token = getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return !!decoded.sub;
    } catch {
      return false;
    }
  },
};

const chat = {
  createSession: (title) => request('/api/chat/create_session', {
    method: 'POST',
    body: { title: title || 'New Chat' },
  }),
  addMessage: (session_id, sender, text) => request('/api/chat/add_message', {
    method: 'POST',
    body: { session_id, sender, text },
  }),
  getMessages: (session_id) => request(`/api/chat/messages/${session_id}`),
  getSessions: (username) => request(`/api/chat/sessions/${username}`),
  updateTitle: (session_id, title) => request(`/api/chat/sessions/${session_id}/title`, {
    method: 'PUT',
    body: { title },
  }),
  deleteSession: (session_id) => request(`/api/chat/sessions/${session_id}`, {
    method: 'DELETE',
  }),
};

const ai = {
  ask: (query) => request('/api/ask', {
    method: 'POST',
    body: { query },
  }),
};

const permissions = {
  get: () => request('/api/permissions/'),
  update: (perms) => request('/api/permissions/', {
    method: 'POST',
    body: perms,
  }),
};

const financeProfile = {
  get: () => request('/api/finance_profile'),
  create: (profile) => request('/api/finance_profile', {
    method: 'POST',
    body: profile,
  }),
  update: (profile) => request('/api/finance_profile', {
    method: 'PUT',
    body: profile,
  }),
};

const summaryFinance = {
  get: () => request('/api/summary_finance'),
  update: (data) => request('/api/summary_finance', {
    method: 'PUT',
    body: data,
  }),
};

const accounts = {
  getAll: () => request('/api/accounts'),
  create: (account) => request('/api/accounts', {
    method: 'POST',
    body: account,
  }),
  update: (id, account) => request(`/api/accounts/${id}`, {
    method: 'PUT',
    body: account,
  }),
  delete: (id) => request(`/api/accounts/${id}`, { method: 'DELETE' }),
  getTransactions: (account_id) => request(`/api/accounts/${account_id}/transactions`),
};

const transactions = {
  getAll: () => request('/api/transactions'),
  create: (tx) => request('/api/transactions', {
    method: 'POST',
    body: tx,
  }),
  update: (id, tx) => request(`/api/transactions/${id}`, {
    method: 'PUT',
    body: tx,
  }),
  delete: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
};

const investments = {
  getAll: () => request('/api/investments'),
  create: (inv) => request('/api/investments', {
    method: 'POST',
    body: inv,
  }),
  update: (id, inv) => request(`/api/investments/${id}`, {
    method: 'PUT',
    body: inv,
  }),
  delete: (id) => request(`/api/investments/${id}`, { method: 'DELETE' }),
};

const goals = {
  getAll: () => request('/api/goals'),
  create: (goal) => request('/api/goals', {
    method: 'POST',
    body: goal,
  }),
  update: (id, goal) => request(`/api/goals/${id}`, {
    method: 'PUT',
    body: goal,
  }),
  delete: (id) => request(`/api/goals/${id}`, { method: 'DELETE' }),
  getProgress: (id) => request(`/api/goal-progress/${id}`),
};

const upload = {
  transactions: async (file, account_id = null) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (account_id) {
      formData.append('account_id', account_id);
    }
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/api/upload/transactions`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      const error = new Error(errorData.detail || 'Upload failed');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  investments: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/api/upload/investments`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      const error = new Error(errorData.detail || 'Upload failed');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
};

const content = {
  getStats: () => request('/api/stats'),
  getTestimonials: () => request('/api/testimonials'),
  getFinanceSummary: () => request('/api/finance-summary'),
  getBudgetSummary: () => request('/api/budget-summary'),
  getInvestmentInsights: () => request('/api/investment-insights'),
};

export {
  BASE_URL,
  request,
  auth,
  chat,
  ai,
  permissions,
  financeProfile,
  summaryFinance,
  accounts,
  transactions,
  investments,
  goals,
  upload,
  content,
};

export default {
  BASE_URL,
  auth,
  chat,
  ai,
  permissions,
  financeProfile,
  summaryFinance,
  accounts,
  transactions,
  investments,
  goals,
  upload,
  content,
};
