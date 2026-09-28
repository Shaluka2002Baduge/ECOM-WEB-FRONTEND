/**
 * Raalahami Restaurant - Auth Service
 * Dynamic RBAC Authentication & Session Management
 */
import apiClient from '../api/apiClient';

export const authService = {
  /**
   * Log in user
   * @param {object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new customer
   * @param {object} userData - { name, email, password, phone }
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log out current session
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (e) {
      // Even if network fails, client session will be cleared
      return { success: true };
    }
  },

  /**
   * Fetch current authenticated user / virtual session
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Request password reset OTP
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify OTP and reset password
   * @param {object} resetData - { email, otp, newPassword }
   */
  async resetPassword(resetData) {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  }
};

export default authService;
