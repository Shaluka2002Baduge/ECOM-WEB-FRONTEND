/**
 * Raalahami Royal Heritage Restaurant - Settings Service
 * Manages restaurant profile, tax & currency configuration, and admin security credentials.
 */
import apiClient from '../api/apiClient';

export const DEFAULT_RESTAURANT_SETTINGS = {
  restaurant_name: 'Raalahami Royal Heritage Restaurant',
  tagline: 'Authentic Ceylon Heritage & Royal Dining Experience',
  address: 'Riverside Road, Ratnapura, Sri Lanka',
  phone: '+94 77 123 4567',
  email: 'info@raalahami.lk',
  website: 'https://raalahami.lk',
  currency_symbol: 'LKR',
  tax_rate: 0.00,
  service_charge_rate: 0.00,
  delivery_fee: 350.00,
  opening_time: '10:00 AM',
  closing_time: '11:00 PM',
  is_dine_in_enabled: true,
  is_delivery_enabled: true,
  is_takeaway_enabled: true,
  order_notification_email: 'orders@raalahami.lk'
};

const SETTINGS_STORAGE_KEY = 'ralahami_restaurant_settings';

export const settingsService = {
  /**
   * Get cached local settings immediately for instantaneous UI rendering
   */
  getCachedSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_RESTAURANT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {}
    return DEFAULT_RESTAURANT_SETTINGS;
  },

  /**
   * Fetch current restaurant & system settings from backend
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/admin/settings');
      const data = response.data?.data || response.data?.settings || response.data;
      if (data && typeof data === 'object') {
        const merged = { ...DEFAULT_RESTAURANT_SETTINGS, ...data };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[SettingsService]: Could not reach /admin/settings, trying public endpoint /settings:', err.message);
      try {
        const publicRes = await apiClient.get('/settings');
        const pubData = publicRes.data?.data || publicRes.data?.settings || publicRes.data;
        if (pubData) {
          const merged = { ...DEFAULT_RESTAURANT_SETTINGS, ...pubData };
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.warn('[SettingsService]: Using local settings fallback:', e.message);
      }
    }
    return this.getCachedSettings();
  },

  /**
   * Update restaurant profile, taxes, and operational settings
   */
  async updateSettings(settingsData) {
    try {
      const response = await apiClient.put('/admin/settings', settingsData);
      const updated = response.data?.data || response.data?.settings || response.data || settingsData;
      
      const merged = { ...DEFAULT_RESTAURANT_SETTINGS, ...updated };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      
      // Broadcast settings update event across tabs and components
      window.dispatchEvent(new CustomEvent('ralahami_settings_updated', { detail: merged }));
      return merged;
    } catch (err) {
      console.error('[SettingsService.updateSettings Error]:', err);
      throw err;
    }
  },

  /**
   * Update administrator account password securely
   */
  async updatePassword({ currentPassword, newPassword, confirmPassword }) {
    try {
      const response = await apiClient.put('/admin/settings/password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (err) {
      console.error('[SettingsService.updatePassword Error]:', err);
      throw err;
    }
  }
};

export default settingsService;
