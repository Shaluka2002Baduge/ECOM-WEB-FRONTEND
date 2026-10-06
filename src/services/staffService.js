/**
 * Raalahami Restaurant - Staff & RBAC Management Service
 * Communicates with backend endpoints for team registry and role clearance
 */
import apiClient from '../api/apiClient';

export const staffService = {
  /**
   * Retrieve all staff members with optional role/search filters
   * @param {object} params - { role, search }
   */
  async getStaff(params = {}) {
    const query = new URLSearchParams();
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient.get(`/admin/staff${queryString}`);
    return response.data;
  },

  /**
   * Get single staff member by ID
   * @param {string} id - Staff UUID
   */
  async getStaffById(id) {
    const response = await apiClient.get(`/admin/staff/${id}`);
    return response.data;
  },

  /**
   * Add a new staff member with assigned security role and station
   * @param {object} staffData - { name, email, role, department, shiftStatus, phone, password }
   */
  async createStaff(staffData) {
    const response = await apiClient.post('/admin/staff', staffData);
    return response.data;
  },

  /**
   * Update an existing staff member's station, role, shift status, or details
   * @param {string} id - Staff UUID
   * @param {object} staffData - Fields to update
   */
  async updateStaff(id, staffData) {
    const response = await apiClient.patch(`/admin/staff/${id}`, staffData);
    return response.data;
  },

  /**
   * Update a staff member's assigned security role
   * @param {string} id - Staff UUID
   * @param {string} role - New role
   */
  async updateRole(id, role) {
    const response = await apiClient.patch(`/admin/staff/${id}/role`, { role });
    return response.data;
  },

  /**
   * Revoke credentials and delete staff record
   * @param {string} id - Staff UUID
   */
  async deleteStaff(id) {
    const response = await apiClient.delete(`/admin/staff/${id}`);
    return response.data;
  }
};

export default staffService;
