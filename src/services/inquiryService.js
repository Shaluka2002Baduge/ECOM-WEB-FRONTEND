/**
 * Raalahami Restaurant - Palace Inquiry Service
 * Communicates with backend endpoints for public customer inquiries and admin moderation/replies
 */
import apiClient from '../api/apiClient';

export const inquiryService = {
  /**
   * Submit a customer inquiry from the Contact Us page
   * @param {object} inquiryData - { fullName, email, phone, inquiryType, message }
   */
  async submitInquiry(inquiryData) {
    const response = await apiClient.post('/inquiries', inquiryData);
    return response.data;
  },

  /**
   * Fetch all inquiries for the Admin Inquiries management dashboard
   * @param {object} params - { status, search }
   */
  async getAdminInquiries(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient.get(`/admin/inquiries${queryString}`);
    return response.data;
  },

  /**
   * Send an admin reply to a customer inquiry and dispatch email notification via Nodemailer
   * @param {string|number} id - Inquiry ID
   * @param {object} replyData - { adminReply, status }
   */
  async replyToInquiry(id, replyData) {
    const response = await apiClient.patch(`/admin/inquiries/${id}`, replyData);
    return response.data;
  },

  /**
   * Delete an inquiry record
   * @param {string|number} id - Inquiry ID
   */
  async deleteInquiry(id) {
    const response = await apiClient.delete(`/admin/inquiries/${id}`);
    return response.data;
  }
};

export default inquiryService;
