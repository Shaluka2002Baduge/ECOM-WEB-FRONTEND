import React, { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Accessible ReservationPage
 * WCAG 2.1 Compliant Table Booking with Accessibility & Dietary Accommodation
 */
export const ReservationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '19:30',
    area: 'Courtyard Garden',
    accessibilityRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReservation, setSuccessReservation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessReservation({
        ...formData,
        bookingRef: 'RES-' + Math.floor(100000 + Math.random() * 900000)
      });
    }, 600);
  };

  return (
    <div className="reservation-page fade-in" style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Exclusive Dining
          </span>
          <h1 style={{ marginBottom: '0.75rem' }}>Reserve Your Royal Table</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0 auto', maxWidth: '600px' }}>
            Book an intimate table, family feast, or private chieftain chamber. We take special pride in catering to all accessibility and dietary requirements.
          </p>
        </div>

        {successReservation ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
              👑
            </div>
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              Reservation Confirmed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Reference Number: <strong>#{successReservation.bookingRef}</strong>
            </p>

            <Alert
              type="success"
              title="Table Reserved Successfully"
              message={`We look forward to welcoming party of ${successReservation.guests} on ${successReservation.date} at ${successReservation.time} in the ${successReservation.area}. A confirmation SMS has been dispatched to ${successReservation.phone}.`}
            />

            <Button
              variant="outline"
              size="md"
              onClick={() => setSuccessReservation(null)}
              style={{ marginTop: '1rem' }}
            >
              Make Another Reservation
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-panel"
            style={{ padding: '2.5rem' }}
            aria-label="Table reservation form"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shaluka Dulanjana"
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patron@example.com"
                required
              />

              <Input
                label="Contact Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                required
              />

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="guests-select"
                  style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
                >
                  Party Size (Guests) <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <select
                  id="guests-select"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Reservation Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="time-select"
                  style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
                >
                  Preferred Time Slot <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <select
                  id="time-select"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none'
                  }}
                >
                  <optgroup label="Lunch">
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                  </optgroup>
                  <optgroup label="Royal Dinner">
                    <option value="18:30">06:30 PM</option>
                    <option value="19:30">07:30 PM</option>
                    <option value="20:30">08:30 PM</option>
                    <option value="21:15">09:15 PM</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Seating Location Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="area-select"
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                Dining Ambiance & Setting
              </label>
              <select
                id="area-select"
                name="area"
                value={formData.area}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              >
                <option value="Courtyard Garden">Courtyard Garden (Open-Air, Live Flute Music)</option>
                <option value="Grand Chieftain Hall">Grand Chieftain Hall (Air-Conditioned Royal Interior)</option>
                <option value="Private Dining Suite">Private Dining Suite (Exclusive Butler Service)</option>
              </select>
            </div>

            {/* Accessible EDI Accommodations & Special Notes */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                htmlFor="accessibility-notes"
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                EDI Accessibility & Dietary Accommodations
              </label>
              <textarea
                id="accessibility-notes"
                name="accessibilityRequests"
                value={formData.accessibilityRequests}
                onChange={handleChange}
                rows={3}
                placeholder="Please let us know if you require wheelchair ramp seating, high chairs, Braille menus, or have severe allergies (e.g. peanuts, shellfish)."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              style={{ width: '100%' }}
              ariaLabel="Confirm table booking"
            >
              Confirm Royal Reservation
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;
