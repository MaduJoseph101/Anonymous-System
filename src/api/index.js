import { requestJson } from '../services/apiClient';

const withParams = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  const query = new URLSearchParams(params).toString();
  return query ? `${url}?${query}` : url;
};

const wrap = (promise) => promise.then((data) => ({ data }));

const api = {
  get: (url, config = {}) => wrap(requestJson(withParams(url, config.params), { method: 'GET' })),
  post: (url, data, config = {}) => wrap(requestJson(url, { ...config, method: 'POST', body: JSON.stringify(data) })),
  patch: (url, data, config = {}) => wrap(requestJson(url, { ...config, method: 'PATCH', body: JSON.stringify(data) })),
  delete: (url, config = {}) => wrap(requestJson(url, { ...config, method: 'DELETE' })),
};

export const submitReport = (reportData) =>
  (() => {
    const hasMedia = reportData?.media instanceof File;

    if (!hasMedia) {
      return api.post('/reports/submit', reportData);
    }

    const formData = new FormData();
    Object.entries(reportData).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      formData.append(key, value);
    });

    return wrap(requestJson('/reports/submit', {
      method: 'POST',
      body: formData
    }));
  })();

export const trackReport = (trackingCode) =>
  api.get(`/reports/track/${trackingCode.trim().toUpperCase()}`);

export const replyToReport = (trackingCode, message) =>
  api.post('/reports/reply', { trackingCode, message });

export const retractReport = (retractionCode) =>
  api.post('/reports/retract', { retractionCode: retractionCode.trim() });

export const adminLogin = (email, password) =>
  api.post('/auth/login', { email, password });

export const getAdminReports = (params = {}) =>
  api.get('/admin/reports', { params });

export const getAdminReportById = (id) =>
  api.get(`/admin/reports/${id}`);

export const updateReportStatus = (id, status, corroborationNote) =>
  api.patch(`/admin/reports/${id}/status`, { status, corroborationNote });

export const sendAdminMessage = (id, content) =>
  api.post(`/admin/reports/${id}/message`, { content });

export const recordReportOutcome = (id, outcome) =>
  api.patch(`/admin/reports/${id}/outcome`, { outcome });

export const getAdminUsers = () =>
  api.get('/admin/users');

export const createAdminUser = (userData) =>
  api.post('/admin/users', userData);

export const updateAdminUser = (id, userData) =>
  api.patch(`/admin/users/${id}`, userData);

export const getAnalyticsOverview = (days = 30) =>
  api.get('/analytics/overview', { params: { days } });

export const getAnalyticsHotspots = (days = 30) =>
  api.get('/analytics/hotspots', { params: { days } });

export default api;
