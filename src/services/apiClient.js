const configuredBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;

export function resolveBaseUrl() {
  if (typeof window === 'undefined') {
    return configuredBaseUrl || 'http://localhost:5000/api';
  }

  const currentHost = window.location.hostname;
  const currentOrigin = `${window.location.protocol}//${currentHost}:5000/api`;

  if (!configuredBaseUrl) {
    return currentOrigin;
  }

  try {
    const parsed = new URL(configuredBaseUrl);
    const isLocalhost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1';
    const isCurrentNetworkHost =
      currentHost !== 'localhost' &&
      currentHost !== '127.0.0.1';

    if (isLocalhost && isCurrentNetworkHost) {
      return currentOrigin;
    }

    return configuredBaseUrl;
  } catch {
    return configuredBaseUrl;
  }
}

export function getAuthToken() {
  return localStorage.getItem('asirs_admin_token') || localStorage.getItem('adminToken');
}

export function buildHeaders(extraHeaders = {}, isFormData = false) {
  const headers = { ...extraHeaders };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function requestJson(endpoint, options = {}) {
  const url = `${resolveBaseUrl()}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const headers = buildHeaders(options.headers, isFormData);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'An unexpected error occurred.' };
    }

    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
