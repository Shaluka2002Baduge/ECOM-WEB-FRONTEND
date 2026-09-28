import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Isolated Staff Member Modal Component
 * Prevents input remounting and keyboard typing issues.
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
    role: 'KITCHEN_STAFF',
    department: 'Culinary Operations'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      if (staff) {
        setFormData({
          name: staff.name || '',
          email: staff.email || '',
          role: staff.role || 'KITCHEN_STAFF',
          department: staff.department || 'Culinary Operations'
        });
      } else {
        setFormData({
          name: '',
          email: '',
          role: 'KITCHEN_STAFF',
          department: 'Culinary Operations'
        });
      }
    }
  }, [isOpen, staff]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Staff name must be at least 3 characters.';
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid staff email address.';
    }
    if (!formData.department || formData.department.trim().length < 2) {
      errors.department = 'Please specify assigned department or station.';
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
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      department: formData.department.trim()
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
      title={staff ? `Edit Staff Role: ${staff.name}` : 'Assign New Staff Privileges'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.35rem', overscrollBehavior: 'contain' }}>
          {formErrors.general && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {formErrors.general}
            </div>
          )}

          {/* Staff Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="staff-name-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Staff Full Name <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="staff-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Chandana Wickramasinghe"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.name ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.name && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="staff-email-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Staff Email Address <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="staff-email-input"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. chandana.chef@raalahami.lk"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.email ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.email && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.email}
              </span>
            )}
          </div>

          {/* RBAC Role Select */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="staff-role-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              RBAC Security Role
            </label>
            <select
              id="staff-role-select"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="KITCHEN_STAFF">KITCHEN_STAFF (Kitchen Display & Prep Orders)</option>
              <option value="ADMIN">ADMIN (Full Operational & Financial Suite)</option>
              <option value="MANAGER">MANAGER (Dining & Floor Supervision)</option>
              <option value="CUSTOMER">CUSTOMER (Patron Access)</option>
            </select>
          </div>

          {/* Department / Station */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="staff-dept-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Department / Assigned Station <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="staff-dept-input"
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g. Seafood & Lamprais Line"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.department ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.department && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.department}
              </span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            marginTop: '0.75rem',
            flexShrink: 0
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Assigning...' : staff ? 'Update Role' : 'Confirm Staff Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;
