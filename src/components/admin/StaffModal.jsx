import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { isValidEmail, isValidTextLength, sanitizeInput } from '../../utils/validators';
import { ShieldCheck, User, Mail, Phone, Lock, Building, Clock, AlertCircle } from 'lucide-react';

const DEPARTMENT_PRESETS = [
  'Executive Management',
  'Dining Hall & Reservations',
  'Hot Line & Curry Station',
  'Seafood & Grill Station',
  'Hopper & Prep Station',
  'Bakery & Dessert Section',
  'Royal Courtyard & Balcony Floor',
  'Bar & Craft Beverages',
  'Cashier & Settlement Desk'
];

/**
 * Staff Member Modal Component
 * Handles creating new staff accounts with initial passwords and editing existing staff records.
 */
export const StaffModal = ({
  isOpen,
  onClose,
  staff,
  onSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'KITCHEN_STAFF',
    department: 'Hot Line & Curry Station',
    shiftStatus: 'Active Shift',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      if (staff) {
        setFormData({
          name: staff.name || staff.display_name || '',
          email: staff.email || '',
          phone: staff.phone || '',
          role: staff.role || 'KITCHEN_STAFF',
          department: staff.department || 'Hot Line & Curry Station',
          shiftStatus: staff.status || staff.shift_status || 'Active Shift',
          password: ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'KITCHEN_STAFF',
          department: 'Hot Line & Curry Station',
          shiftStatus: 'Active Shift',
          password: 'Password123!'
        });
      }
    }
  }, [isOpen, staff]);

  const validateForm = () => {
    const errors = {};
    if (!isValidTextLength(formData.name, 3, 80)) {
      errors.name = 'Staff name must be between 3 and 80 characters.';
    }
    if (!isValidEmail(formData.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.department || !formData.department.trim()) {
      errors.department = 'Please specify assigned department or kitchen station.';
    }
    if (!staff && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Initial password must be at least 6 characters.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      name: sanitizeInput(formData.name),
      displayName: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      phone: formData.phone ? sanitizeInput(formData.phone) : null,
      role: formData.role,
      department: sanitizeInput(formData.department),
      station: sanitizeInput(formData.department),
      shiftStatus: formData.shiftStatus,
      status: formData.shiftStatus,
      ...(formData.password ? { password: formData.password } : {})
    };

    try {
      if (onSaved) {
        await onSaved(payload, staff?.id);
      }
      onClose();
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: err.message || 'Failed to save staff credentials.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? `Edit Clearance: ${staff.name || staff.display_name}` : 'Assign New Staff Privileges'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {formErrors.general && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{formErrors.general}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <Input
            id="staff-name-input"
            label="Staff Full Name"
            placeholder="e.g. Nimalka Perera"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={formErrors.name}
            required
          />
        </div>

        {/* Email & Phone Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <Input
              id="staff-email-input"
              label="Staff Email (Login ID)"
              type="email"
              placeholder="e.g. nimalka.chef@raalahami.lk"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={formErrors.email}
              required
              disabled={!!staff}
            />
          </div>

          <div>
            <Input
              id="staff-phone-input"
              label="Contact Phone"
              type="tel"
              placeholder="e.g. +94 77 345 6789"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Security Role & Shift Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label 
              htmlFor="staff-role-select" 
              style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
            >
              Assigned Security Role <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <select
              id="staff-role-select"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ADMIN">ADMIN (Full System & Financial Access)</option>
              <option value="MANAGER">MANAGER (Operations & Approvals)</option>
              <option value="KITCHEN_STAFF">KITCHEN_STAFF (Orders & Recipe KDS)</option>
              <option value="WAITER">WAITER (Floor Service & Table Dispatch)</option>
            </select>
          </div>

          <div>
            <label 
              htmlFor="staff-shift-select" 
              style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
            >
              Shift Status
            </label>
            <select
              id="staff-shift-select"
              value={formData.shiftStatus}
              onChange={(e) => handleChange('shiftStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Active Shift">Active Shift (On Duty)</option>
              <option value="Off Duty">Off Duty (Rest / Leave)</option>
              <option value="On Break">On Break</option>
            </select>
          </div>
        </div>

        {/* Department / Station Presets & Custom Input */}
        <div>
          <label 
            htmlFor="staff-department-input" 
            style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
          >
            Station / Department <span style={{ color: 'var(--accent-amber)' }}>*</span>
          </label>
          <input
            id="staff-department-input"
            type="text"
            list="department-presets-list"
            placeholder="e.g. Hot Line & Curry Station"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
              border: formErrors.department ? '1px solid var(--accent-danger)' : '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              outline: 'none'
            }}
          />
          <datalist id="department-presets-list">
            {DEPARTMENT_PRESETS.map((dept) => (
              <option key={dept} value={dept} />
            ))}
          </datalist>
          {formErrors.department && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', marginTop: '0.25rem', display: 'block' }}>
              {formErrors.department}
            </span>
          )}
        </div>

        {/* Initial Password (Optional on edit, visible on create) */}
        {!staff && (
          <div>
            <Input
              id="staff-password-input"
              label="Initial Temporary Password"
              type="password"
              placeholder="e.g. Password123!"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={formErrors.password}
              helperText="Staff member can change their password upon logging in."
              required
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving Clearance...' : staff ? 'Update Clearance' : 'Grant Privileges'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;
