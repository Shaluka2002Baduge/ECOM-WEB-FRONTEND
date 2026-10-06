import apiClient from '../api/apiClient';

/**
 * Frontend Financial & Reports Service
 * Connects to /api/admin/financials and /api/financials endpoints
 */
export const financialService = {
  /**
   * Fetch financial summary metrics, KPIs, channels, and top dishes
   * @param {Object} params - { range: 'today'|'week'|'month'|'year'|'all', startDate, endDate }
   */
  async getSummary(params = {}) {
    const response = await apiClient.get('/admin/financials/summary', { params });
    return response.data?.data || response.data?.summary || response.data;
  },

  /**
   * Fetch expense ledger records
   * @param {Object} params - { category, startDate, endDate, limit, offset }
   */
  async getExpenses(params = {}) {
    const response = await apiClient.get('/admin/financials/expenses', { params });
    return response.data?.data || response.data?.expenses || [];
  },

  /**
   * Record a new operating expense, payroll, or procurement cost
   * @param {Object} expenseData - { title, category, amount, description, payment_method, expense_date }
   */
  async createExpense(expenseData) {
    const response = await apiClient.post('/admin/financials/expenses', expenseData);
    return response.data?.data || response.data;
  },

  /**
   * Delete an expense record
   * @param {string|number} id
   */
  async deleteExpense(id) {
    const response = await apiClient.delete(`/admin/financials/expenses/${id}`);
    return response.data;
  },

  /**
   * Export financial report data for specific scope or custom dates
   * @param {Object} params - { range, startDate, endDate }
   */
  async exportReport(params = {}) {
    const response = await apiClient.get('/admin/financials/reports/export', { params });
    return response.data?.summary || response.data?.data || response.data;
  }
};

export default financialService;
