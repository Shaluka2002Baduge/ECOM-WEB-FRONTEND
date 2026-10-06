import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Coins,
  ShieldCheck,
  Sparkles,
  Save,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Percent,
  Truck,
  UtensilsCrossed,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import settingsService, { DEFAULT_RESTAURANT_SETTINGS } from '../../services/settingsService';
import Button from '../common/Button';
import Input from '../common/Input';

export const SettingsManagement = ({ onNotify }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'financial' | 'security'
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingFinancial, setIsSavingFinancial] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 1. Restaurant Profile & General Settings State
  const [profileForm, setProfileForm] = useState({
    restaurant_name: DEFAULT_RESTAURANT_SETTINGS.restaurant_name,
    tagline: DEFAULT_RESTAURANT_SETTINGS.tagline,
    address: DEFAULT_RESTAURANT_SETTINGS.address,
    phone: DEFAULT_RESTAURANT_SETTINGS.phone,
    email: DEFAULT_RESTAURANT_SETTINGS.email,
    website: DEFAULT_RESTAURANT_SETTINGS.website,
    opening_time: DEFAULT_RESTAURANT_SETTINGS.opening_time,
    closing_time: DEFAULT_RESTAURANT_SETTINGS.closing_time,
    is_dine_in_enabled: DEFAULT_RESTAURANT_SETTINGS.is_dine_in_enabled,
    is_delivery_enabled: DEFAULT_RESTAURANT_SETTINGS.is_delivery_enabled,
    is_takeaway_enabled: DEFAULT_RESTAURANT_SETTINGS.is_takeaway_enabled
  });

  // 2. Financial & Tax Settings State
  const [financialForm, setFinancialForm] = useState({
    currency_symbol: DEFAULT_RESTAURANT_SETTINGS.currency_symbol,
    tax_rate: DEFAULT_RESTAURANT_SETTINGS.tax_rate,
    service_charge_rate: DEFAULT_RESTAURANT_SETTINGS.service_charge_rate,
    delivery_fee: DEFAULT_RESTAURANT_SETTINGS.delivery_fee,
    order_notification_email: DEFAULT_RESTAURANT_SETTINGS.order_notification_email
  });

  // 3. Admin Security & Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load Settings from API
  const loadSettings = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const data = await settingsService.getSettings();
      if (data) {
        setProfileForm({
          restaurant_name: data.restaurant_name || DEFAULT_RESTAURANT_SETTINGS.restaurant_name,
          tagline: data.tagline || DEFAULT_RESTAURANT_SETTINGS.tagline,
          address: data.address || DEFAULT_RESTAURANT_SETTINGS.address,
          phone: data.phone || DEFAULT_RESTAURANT_SETTINGS.phone,
          email: data.email || DEFAULT_RESTAURANT_SETTINGS.email,
          website: data.website || DEFAULT_RESTAURANT_SETTINGS.website,
          opening_time: data.opening_time || DEFAULT_RESTAURANT_SETTINGS.opening_time,
          closing_time: data.closing_time || DEFAULT_RESTAURANT_SETTINGS.closing_time,
          is_dine_in_enabled: data.is_dine_in_enabled ?? true,
          is_delivery_enabled: data.is_delivery_enabled ?? true,
          is_takeaway_enabled: data.is_takeaway_enabled ?? true
        });

        setFinancialForm({
          currency_symbol: data.currency_symbol || DEFAULT_RESTAURANT_SETTINGS.currency_symbol,
          tax_rate: data.tax_rate ?? DEFAULT_RESTAURANT_SETTINGS.tax_rate,
          service_charge_rate: data.service_charge_rate ?? DEFAULT_RESTAURANT_SETTINGS.service_charge_rate,
          delivery_fee: data.delivery_fee ?? DEFAULT_RESTAURANT_SETTINGS.delivery_fee,
          order_notification_email: data.order_notification_email || DEFAULT_RESTAURANT_SETTINGS.order_notification_email
        });
      }
    } catch (err) {
      console.error('[Settings]: Failed to load settings from server:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle Save Restaurant Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload = {
        ...profileForm,
        ...financialForm
      };
      const updated = await settingsService.updateSettings(payload);
      toast.success('Restaurant profile settings updated successfully.');
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Settings Saved',
          message: 'Restaurant profile & contact details updated.'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update restaurant profile';
      toast.error(errMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Save Financial Preferences
  const handleSaveFinancial = async (e) => {
    e.preventDefault();
    setIsSavingFinancial(true);
    try {
      const payload = {
        ...profileForm,
        ...financialForm,
        tax_rate: parseFloat(financialForm.tax_rate) || 0,
        service_charge_rate: parseFloat(financialForm.service_charge_rate) || 0,
        delivery_fee: parseFloat(financialForm.delivery_fee) || 0
      };
      const updated = await settingsService.updateSettings(payload);
      toast.success('Tax, currency & fee preferences updated successfully.');
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Financial Settings Saved',
          message: 'Tax rate and currency preferences updated.'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update financial settings';
      toast.error(errMsg);
    } finally {
      setIsSavingFinancial(false);
    }
  };

  // Handle Update Admin Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await settingsService.updatePassword(passwordForm);
      toast.success('Administrator password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Security Updated',
          message: 'Admin account password updated successfully.'
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update password. Please check your current password.';
      toast.error(errMsg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Helper calculations for Live Pricing Preview
  const sampleBasePrice = 10000;
  const taxAmount = (sampleBasePrice * (parseFloat(financialForm.tax_rate) || 0)) / 100;
  const serviceChargeAmount = (sampleBasePrice * (parseFloat(financialForm.service_charge_rate) || 0)) / 100;
  const deliveryAmount = parseFloat(financialForm.delivery_fee) || 0;
  const sampleGrandTotal = sampleBasePrice + taxAmount + serviceChargeAmount + deliveryAmount;

  // Password Strength Evaluator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: '#64748B' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: '#EF4444' };
    if (score === 3 || score === 4) return { score: 70, label: 'Good', color: '#F59E0B' };
    return { score: 100, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const tabs = [
    { id: 'profile', label: 'Restaurant Profile', icon: Building2 },
    { id: 'financial', label: 'Financial & Tax Preferences', icon: Coins },
    { id: 'security', label: 'Admin Security & Password', icon: ShieldCheck }
  ];

  return (
    <div className="settings-management-panel fade-in" style={{ paddingBottom: '3.5rem' }}>
      {/* Top Header & Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <Sparkles size={13} /> SYSTEM CONFIGURATION & SECURITY
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #F8FAFC)', margin: 0 }}>
            Settings & Preferences
          </h2>
          <p style={{ color: 'var(--text-muted, #94A3B8)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Manage restaurant metadata, currency & tax rules, order channel toggles, and administrator credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSettings(false)}
            isLoading={isLoading}
            style={{ fontWeight: '600' }}
          >
            <RefreshCw size={14} style={{ marginRight: '0.4rem' }} /> Refresh Settings
          </Button>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-md, 12px)',
          border: '1px solid rgba(244, 237, 228, 0.08)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: isActive ? '1px solid var(--accent-gold, #E5A93C)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(135deg, var(--accent-gold, #E5A93C), #C68E2D)'
                  : 'transparent',
                color: isActive ? '#000' : 'var(--text-secondary, #CBD5E1)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 15px rgba(229, 169, 60, 0.25)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESTAURANT PROFILE (රෙස්ටොරන්ට් විස්තර)                            */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', paddingBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent-gold, #D97706)' }}>
              <Building2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Restaurant Branding & Contact Information
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                This metadata appears on palace storefront headers, invoices, order slips, and generated PDF reports.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Official Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.restaurant_name}
                onChange={(e) => setProfileForm({ ...profileForm, restaurant_name: e.target.value })}
                placeholder="e.g. Raalahami Royal Heritage Restaurant"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-surface, #1E293B)',
                  border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                  borderRadius: 'var(--radius-sm, 8px)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Tagline / Heritage Slogan
              </label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                placeholder="e.g. Authentic Ceylon Heritage & Royal Dining Experience"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-surface, #1E293B)',
                  border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                  borderRadius: 'var(--radius-sm, 8px)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Official Street Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="e.g. Riverside Road, Ratnapura, Sri Lanka"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.4rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                    borderRadius: 'var(--radius-sm, 8px)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <MapPin size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Customer Service Phone *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.4rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                    borderRadius: 'var(--radius-sm, 8px)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <Phone size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Official Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="e.g. info@raalahami.lk"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.4rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                    borderRadius: 'var(--radius-sm, 8px)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Official Website URL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  placeholder="e.g. https://raalahami.lk"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.4rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
                    borderRadius: 'var(--radius-sm, 8px)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <Globe size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Palace Operating Hours & Service Channels */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
              Operating Schedule & Active Dining Channels
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Kitchen Opening Time
                </label>
                <input
                  type="text"
                  value={profileForm.opening_time}
                  onChange={(e) => setProfileForm({ ...profileForm, opening_time: e.target.value })}
                  placeholder="10:00 AM"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Kitchen Closing Time
                </label>
                <input
                  type="text"
                  value={profileForm.closing_time}
                  onChange={(e) => setProfileForm({ ...profileForm, closing_time: e.target.value })}
                  placeholder="11:00 PM"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Service Toggle Checkboxes */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', backgroundColor: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={profileForm.is_dine_in_enabled}
                  onChange={(e) => setProfileForm({ ...profileForm, is_dine_in_enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                />
                <UtensilsCrossed size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>Enable Dine-In Table Service</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={profileForm.is_delivery_enabled}
                  onChange={(e) => setProfileForm({ ...profileForm, is_delivery_enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                />
                <Truck size={16} style={{ color: '#60A5FA' }} />
                <span>Enable Home Delivery Expeditions</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={profileForm.is_takeaway_enabled}
                  onChange={(e) => setProfileForm({ ...profileForm, is_takeaway_enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                />
                <ShoppingBag size={16} style={{ color: '#F97316' }} />
                <span>Enable Takeaway Counter Pickup</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
              style={{ fontWeight: '700', padding: '0.75rem 1.75rem' }}
            >
              <Save size={16} style={{ marginRight: '0.5rem' }} />
              Save Restaurant Profile
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINANCIAL & TAX PREFERENCES (මුදල් සහ බදු)                           */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <form onSubmit={handleSaveFinancial} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#10B981' }}>
              <Coins size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Financial Rules, Tax & Delivery Tariffs
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Configure base currency symbol, statutory taxes (VAT/SSCL), restaurant service charges, and delivery fee defaults.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Currency Code & Symbol *
              </label>
              <select
                value={financialForm.currency_symbol}
                onChange={(e) => setFinancialForm({ ...financialForm, currency_symbol: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-surface, #1E293B)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="LKR">LKR (Sri Lankan Rupee - LKR / Rs.)</option>
                <option value="USD">USD (US Dollar - $)</option>
                <option value="GBP">GBP (British Pound - £)</option>
                <option value="EUR">EUR (Euro - €)</option>
                <option value="AUD">AUD (Australian Dollar - A$)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Default Tax Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={financialForm.tax_rate}
                  onChange={(e) => setFinancialForm({ ...financialForm, tax_rate: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.2rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <Percent size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Service Charge (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={financialForm.service_charge_rate}
                  onChange={(e) => setFinancialForm({ ...financialForm, service_charge_rate: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.2rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <Percent size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Standard Delivery Fee ({financialForm.currency_symbol})
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={financialForm.delivery_fee}
                onChange={(e) => setFinancialForm({ ...financialForm, delivery_fee: e.target.value })}
                placeholder="350"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Order Notification Forwarding Email
              </label>
              <input
                type="email"
                value={financialForm.order_notification_email}
                onChange={(e) => setFinancialForm({ ...financialForm, order_notification_email: e.target.value })}
                placeholder="orders@raalahami.lk"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                Automated kitchen and admin order confirmations are dispatched to this address in real-time.
              </span>
            </div>
          </div>

          {/* Interactive Pricing Simulator Box */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} /> Live Bill Calculation Simulator (Sample LKR 10,000 Feast)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sample Food Subtotal</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {financialForm.currency_symbol} {sampleBasePrice.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tax ({financialForm.tax_rate || 0}%)
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  + {financialForm.currency_symbol} {taxAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Service Charge ({financialForm.service_charge_rate || 0}%)
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  + {financialForm.currency_symbol} {serviceChargeAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Fee</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  + {financialForm.currency_symbol} {deliveryAmount.toLocaleString()}
                </div>
              </div>

              <div style={{ borderLeft: '2px solid var(--accent-gold)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Calculated Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>
                  {financialForm.currency_symbol} {sampleGrandTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingFinancial}
              style={{ fontWeight: '700', padding: '0.75rem 1.75rem' }}
            >
              <Save size={16} style={{ marginRight: '0.5rem' }} />
              Save Financial Settings
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMIN SECURITY & PASSWORD (ආරක්ෂක සැකසුම්)                         */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 16px)', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#EF4444' }}>
              <Lock size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Administrator Security & Password Clearance
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Update your administrative account password. Requires your current password to authorize.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem', backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.85rem 1.15rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged-in Administrator</div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {user?.email || 'admin@ralahami.lk'}
              </div>
            </div>
            <div className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}>
              <ShieldCheck size={13} style={{ marginRight: '0.3rem' }} /> MASTER ADMIN ROLE
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Current Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter your existing login password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.8rem 0.65rem 0.95rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new strong password (min 6 characters)"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.8rem 0.65rem 0.95rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: '700' }}>{passwordStrength.label}</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${passwordStrength.score}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password to confirm"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.8rem 0.65rem 0.95rem',
                    backgroundColor: 'var(--bg-surface, #1E293B)',
                    border: passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                      ? '1px solid #EF4444'
                      : '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                <span style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.3rem', display: 'block' }}>
                  Passwords do not match.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingPassword}
              style={{ fontWeight: '700', padding: '0.75rem 1.75rem' }}
            >
              <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
              Update Admin Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsManagement;
