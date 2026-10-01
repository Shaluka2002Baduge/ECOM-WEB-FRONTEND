import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { isValidEmail, isValidPhone, isValidTextLength, sanitizeInput } from '../../utils/validators';

const HALLS = ['Royal Dining Hall', 'Balcony Court', 'Private Suite'];
const TABLES_PER_HALL = ['Table 1', 'Table 2', 'Table 3', 'Table 4'];

/**
 * Validates dining time within 12:30 to 23:30
 */
const isTimeWithinHours = (timeStr) => {
  if (!timeStr) return false;
  const parts = timeStr.split(':');
  if (parts.length < 2) return true; // Allow freeform time like '7:30 PM'
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return true;
  const mins = h * 60 + m;
  return mins >= (12 * 60 + 30) && mins <= (23 * 60 + 30);
};

/**
 * Isolated Admin Walk-In & Table Booking Modal Component
 * Form inputs: Guest Name, Phone, Email, Date, Time (12:30 - 23:30), Party Size, Hall, and Table.
 */
export const ReservationModal = ({
  isOpen,
  onClose,
  reservation,
  tables = [],
  onSaved
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    guest: '',
    phone: '',
    email: '',
    date: today,
    time: '19:30',
    guests: 2,
    hall: 'Royal Dining Hall',
    table: 'Table 1',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormErrors({});

    if (reservation) {
      setFormData({
        guest: reservation.guest || reservation.customerName || '',
        phone: reservation.phone || '',
        email: reservation.email || reservation.customerEmail || '',
        date: reservation.date || reservation.diningDate || today,
        time: reservation.time || reservation.timeSlot || '19:30',
        guests: reservation.guests || reservation.partySize || 2,
        hall: reservation.hall || reservation.area || reservation.seatingPreference || 'Royal Dining Hall',
        table: reservation.table || reservation.table_number || reservation.assignedTable || 'Table 1',
        notes: reservation.notes || ''
      });
    } else {
      setFormData({
        guest: '',
        phone: '',
        email: '',
        date: today,
        time: '19:30',
        guests: 2,
        hall: 'Royal Dining Hall',
        table: 'Table 1',
        notes: ''
      });
    }
  }, [isOpen, reservation, today]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!isValidTextLength(formData.guest, 2, 80)) {
      errors.guest = 'Guest name is required (2-80 characters).';
    }
    if (!formData.phone || !isValidPhone(formData.phone)) {
      errors.phone = 'Valid contact phone number is required (e.g. +94771234567 or 0771234567).';
    }
    if (formData.email && formData.email.trim() && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.date) {
      errors.date = 'Reservation date is required.';
    }
    if (!formData.time || !formData.time.trim()) {
      errors.time = 'Reservation time is required.';
    } else if (formData.time.includes(':') && !isTimeWithinHours(formData.time)) {
      errors.time = 'Raalahami dining hours are from 12:30 PM to 11:30 PM.';
    }
    const numGuests = Number(formData.guests);
    if (isNaN(numGuests) || numGuests < 1 || numGuests > 30) {
      errors.guests = 'Guest count must be between 1 and 30.';
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
    const cleanGuest = sanitizeInput(formData.guest);
    const cleanEmail = sanitizeInput(formData.email);
    const cleanPhone = sanitizeInput(formData.phone);
    const cleanNotes = sanitizeInput(formData.notes || '');

    const payload = {
      guest: cleanGuest,
      customerName: cleanGuest,
      phone: cleanPhone,
      email: cleanEmail || 'user@raalahami.lk',
      customerEmail: cleanEmail || 'user@raalahami.lk',
      date: formData.date,
      diningDate: formData.date,
      dining_date: formData.date,
      time: formData.time.trim(),
      timeSlot: formData.time.trim(),
      time_slot: formData.time.trim(),
      guests: Number(formData.guests),
      partySize: Number(formData.guests),
      party_size: Number(formData.guests),
      hall: formData.hall,
      area: formData.hall,
      seatingPreference: formData.hall,
      seating_preference: formData.hall,
      table: formData.table,
      assignedTable: formData.table,
      table_number: formData.table,
      tableNumber: formData.table,
      notes: cleanNotes || 'Walk-In User Booking',
      status: reservation?.status || 'CONFIRMED'
    };

    try {
      if (onSaved) {
        await onSaved(payload, reservation?.id);
      }
      onClose();
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: err.message || 'Failed to save booking.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservation ? `Modify Reservation #${reservation.id}` : 'Book Table Reservation (Walk-In / Phone)'}
      maxWidth="640px"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Scrollable Form Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.35rem',
            overscrollBehavior: 'contain'
          }}
        >
          {formErrors.general && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-sm)',
                color: '#ef4444',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              {formErrors.general}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Guest Name */}
            <div>
              <label
                htmlFor="modal-guest-name"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Guest Name <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="modal-guest-name"
                type="text"
                value={formData.guest}
                onChange={(e) => handleChange('guest', e.target.value)}
                placeholder="e.g. Dr. Senaka Bandara"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.guest ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.guest && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.guest}
                </span>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label
                htmlFor="modal-guest-phone"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Contact Phone <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="modal-guest-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+94 77 345 6789"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.phone ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.phone && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.phone}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Guest Email */}
            <div>
              <label
                htmlFor="modal-guest-email"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Guest Email (Optional)
              </label>
              <input
                id="modal-guest-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@raalahami.lk"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.email ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.email && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.email}
                </span>
              )}
            </div>

            {/* Party Size */}
            <div>
              <label
                htmlFor="modal-guests-count"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Party Size (Pax) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="modal-guests-count"
                type="number"
                min="1"
                max="30"
                value={formData.guests}
                onChange={(e) => handleChange('guests', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.guests ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.guests && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.guests}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Reservation Date */}
            <div>
              <label
                htmlFor="modal-res-date"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Dining Date <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="modal-res-date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.date ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.date && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.date}
                </span>
              )}
            </div>

            {/* Reservation Time (12:30 - 23:30) */}
            <div>
              <label
                htmlFor="modal-res-time"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Time (12:30 - 23:30) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="modal-res-time"
                type="time"
                min="12:30"
                max="23:30"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.time ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.time && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.time}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Seating Hall */}
            <div>
              <label
                htmlFor="modal-res-hall"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Seating Hall <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <select
                id="modal-res-hall"
                value={formData.hall}
                onChange={(e) => handleChange('hall', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {HALLS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Table */}
            <div>
              <label
                htmlFor="modal-res-table"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
              >
                Specific Table <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <select
                id="modal-res-table"
                value={formData.table}
                onChange={(e) => handleChange('table', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {TABLES_PER_HALL.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="modal-res-notes"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
            >
              Special Dietary / Protocol Notes
            </label>
            <input
              id="modal-res-notes"
              type="text"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g. VIP Protocol, Birthday Celebration, Window View"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Fixed Sticky Footer Actions */}
        <div
          className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0 mt-auto"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle, rgba(42, 48, 66, 0.6))',
            paddingTop: '0.85rem',
            marginTop: 'auto',
            flexShrink: 0
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Submitting...' : reservation ? 'Update Booking' : 'Confirm Reservation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;
