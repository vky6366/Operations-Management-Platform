import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.232.18.53:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getKPISummary: () => apiClient.get('/dashboard/kpi-summary'),
  getOrderStatusSummary: () => apiClient.get('/dashboard/order-status-summary'),
  getRiskSummary: () => apiClient.get('/dashboard/risk-summary'),
  getBreachTrend: () => apiClient.get('/dashboard/breach-trend'),
};

export const ordersAPI = {
  getActiveOrders: () => apiClient.get('/orders/active'),
  filterOrders: (params) => apiClient.get('/orders/filter', { params }),
  createOrder: (data) => apiClient.post('/orders/create', data),
  updateOrderStatus: (id, payload) => apiClient.patch(`/orders/${id}/status`, payload),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
};

export const aiAPI = {
  getOrdersAtRisk: () => apiClient.get('/ai/orders-at-risk'),
  chat: (query) => apiClient.post('/ai/chat', { query }),
  getInsights: (page = 'home') => apiClient.get('/ai/insights', { params: { page } }),
  invalidateInsights: (keys) => apiClient.post('/ai/insights/invalidate', keys),
};

export const alertsAPI = {
  checkAlert: (id, force = false) => apiClient.post(`/alerts/check/${id}?force=${force}`),
};

export const inventoryAPI = {
  getStats: () => apiClient.get('/inventory/stats'),
};
