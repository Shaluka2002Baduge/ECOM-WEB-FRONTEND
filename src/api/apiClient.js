/**
 * Raalahami Restaurant - Core API Client
 * RESTful JSON Client over native fetch() API
 * Fully decoupled presentation tier communicating with Backend API.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
  'http://localhost:5000/api';

/**
 * Standardized API Error Class
 */
export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.isApiError = true;
  }
}

/**
 * Core HTTP Request Wrapper
 * @param {string} endpoint - API endpoint (e.g. '/menu' or '/auth/login')
 * @param {object} options - Fetch options including method, body, headers
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('ralahami_auth_token') || localStorage.getItem('token'))
    : null;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
    // Essential for session management via HttpOnly cookies and credentials
    credentials: 'include',
    ...options
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Parse JSON or text response
    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = null;
      }
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (responseData && (responseData.message || responseData.error)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      throw new ApiError(errorMessage, response.status, responseData);
    }

    return {
      success: true,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    if (error.isApiError) {
      throw error;
    }
    // Handle network errors, CORS issues, or timeout
    throw new ApiError(
      error.message || 'Network error encountered. Please check your connection.',
      0,
      { originalError: error }
    );
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  baseUrl: API_BASE_URL
};

export default apiClient;
