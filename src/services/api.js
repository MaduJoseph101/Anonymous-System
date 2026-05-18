import { requestJson } from './apiClient';

export const api = {
  student: {
    submitReport: (data) => {
      const hasMedia = data?.media instanceof File;

      if (hasMedia) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          formData.append(key, value);
        });

        return requestJson('/reports/submit', { method: 'POST', body: formData });
      }

      return requestJson('/reports/submit', { method: 'POST', body: JSON.stringify(data) });
    },
    trackReport: (trackingCode) => requestJson(`/reports/track/${trackingCode}`),
    replyToReport: (data) => requestJson('/reports/reply', { method: 'POST', body: JSON.stringify(data) }),
    retractReport: (data) => requestJson('/reports/retract', { method: 'POST', body: JSON.stringify(data) }),
    requestOtp: (data) => requestJson('/verification/request-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data) => requestJson('/verification/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    login: (credentials) => requestJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getReports: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return requestJson(`/admin/reports${query ? '?' + query : ''}`);
    },
    getReportDetails: (id) => requestJson(`/admin/reports/${id}`),
    updateReportStatus: (id, statusData) => requestJson(`/admin/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),
    addReportMessage: (id, messageData) => requestJson(`/admin/reports/${id}/message`, { method: 'POST', body: JSON.stringify(messageData) }),
    sendAdminMessage: (id, messageData) => requestJson(`/admin/reports/${id}/message`, { method: 'POST', body: JSON.stringify(messageData) }),
    updateReportOutcome: (id, outcomeData) => requestJson(`/admin/reports/${id}/outcome`, { method: 'PATCH', body: JSON.stringify(outcomeData) }),
    getUsers: () => requestJson('/admin/users'),
    createUser: (userData) => requestJson('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
    updateUser: (id, userData) => requestJson(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(userData) }),
    resetUserPassword: (id) => requestJson(`/admin/users/${id}/reset-password`, { method: 'POST' }),
  },
  analytics: {
    getOverview: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return requestJson(`/analytics/overview${query ? '?' + query : ''}`);
    },
    getHotspots: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return requestJson(`/analytics/hotspots${query ? '?' + query : ''}`);
    },
  }
};
