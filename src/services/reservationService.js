/**
 * Raalahami Restaurant - Reservation Service
 * Floor plan booking management & daily seating report downloads
 */
import apiClient from '../api/apiClient';

export const reservationService = {
  /**
   * Fetch all reservations with optional date filter
   */
  async getReservations(date = null) {
    const query = date ? `?date=${date}` : '';
    const response = await apiClient.get(`/reservations${query}`);
    const raw = response.data?.data || response.data?.reservations || response.data || [];
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Fetch dedicated daily reservations report for a given date
   */
  async getDailyReservationsReport(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    try {
      const response = await apiClient.get(`/reservations/reports/daily?date=${targetDate}`);
      return response.data;
    } catch (err) {
      console.warn('Backend /reservations/reports/daily fallback:', err.message);
      const resList = await this.getReservations(targetDate);
      const hallBreakdown = {};
      resList.forEach(r => {
        const h = r.hall || 'Main Hall';
        hallBreakdown[h] = (hallBreakdown[h] || 0) + 1;
      });
      return {
        success: true,
        date: targetDate,
        kpis: {
          totalReservations: resList.length,
          totalGuests: resList.reduce((sum, r) => sum + (parseInt(r.guests || r.party_size || 2, 10)), 0),
          confirmedBookings: resList.filter(r => (r.status || '').toUpperCase() === 'CONFIRMED').length,
          completedBookings: resList.filter(r => (r.status || '').toUpperCase() === 'COMPLETED').length,
          cancelledBookings: resList.filter(r => (r.status || '').toUpperCase() === 'CANCELLED').length,
          pendingBookings: resList.filter(r => (r.status || '').toUpperCase() === 'PENDING').length,
          hallBreakdown
        },
        reservations: resList
      };
    }
  }
};

export default reservationService;
