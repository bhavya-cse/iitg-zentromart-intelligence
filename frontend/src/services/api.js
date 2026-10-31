/**
 * ZentroMart Intelligence API Service
 * Centralized API client communicating with FastAPI backend.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: options.body instanceof FormData ? undefined : headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `HTTP error ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Overview / Dashboard
  getOverview: () => request('/overview'),

  // AI Support Chat
  sendChatMessage: (data) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChatHistory: () => request('/chat/history'),
  clearChatHistory: () => request('/chat/history', { method: 'DELETE' }),

  // Voice Studio (Gnani.ai integration)
  processVoice: (formData) =>
    request('/voice/process', {
      method: 'POST',
      body: formData,
    }),
  synthesizeSpeech: (data) =>
    request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getVoiceSettings: () => request('/voice/settings'),

  // Knowledge Base
  getKnowledgeBase: () => request('/knowledge-base'),
  reindexKnowledgeBase: () => request('/knowledge-base/reindex', { method: 'POST' }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  lookupOrder: (data) =>
    request('/orders/lookup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Support Tickets
  getTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tickets${query ? `?${query}` : ''}`);
  },
  createTicket: (data) =>
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Evaluation
  getEvaluationResults: () => request('/evaluation'),
  runEvaluation: (options = {}) =>
    request('/evaluation/run', {
      method: 'POST',
      body: JSON.stringify(options),
    }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) =>
    request('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
