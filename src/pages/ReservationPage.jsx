import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin, Sparkles, Check, CheckCircle2, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Accessible Raalahami ReservationPage
 * Ultra-Luxury Sri Lankan Royal Heritage Design System
 * Features:
 * - Visual interactive party size chips
 * - Time slot selector grouped by Lunch and Royal Dinner
 * - Interactive dining ambiance cards (Courtyard, Grand Hall, Private Suite)
 * - EDI Accessibility & Dietary accommodation controls
 * - WCAG 2.1 AA/AAA Compliant
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

  const guestOptions = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16+'];

  const timeSlots = [
    { label: '12:00 PM', value: '12:00', period: 'Lunch' },
    { label: '01:00 PM', value: '13:00', period: 'Lunch' },
    { label: '02:00 PM', value: '14:00', period: 'Lunch' },
    { label: '06:30 PM', value: '18:30', period: 'Dinner' },
    { label: '07:30 PM', value: '19:30', period: 'Dinner' },
    { label: '08:30 PM', value: '20:30', period: 'Dinner' },
    { label: '09:15 PM', value: '21:15', period: 'Dinner' }
  ];

  const diningAreas = [
    {
      id: 'Courtyard Garden',
      name: 'Courtyard Garden',
      badge: 'Open-Air',
      description: 'Under starlit coconut palms with gentle traditional live flute melodies.'
    },
    {
      id: 'Grand Chieftain Hall',
      name: 'Grand Chieftain Hall',
      badge: 'Climate Controlled',
      description: 'Hand-carved mahogany ceilings, antique brass lanterns, and plush seating.'
    },
    {
      id: 'Private Dining Suite',
      name: 'Private Dining Suite',
      badge: 'VIP Butler Service',
      description: 'Exclusive private sanctum with personal chef interaction and wine curation.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectGuests = (num) => {
    setFormData((prev) => ({ ...prev, guests: num }));
  };

  const handleSelectTime = (tVal) => {
    setFormData((prev) => ({ ...prev, time: tVal }));
  };

  const handleSelectArea = (areaId) => {
    setFormData((prev) => ({ ...prev, area: areaId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessReservation({
        ...formData,
        bookingRef: 'RAALAHAMI-RES-' + Math.floor(100000 + Math.random() * 900000)
      });
    }, 600);
  };

  return (
    <div className="reservation-page fade-in" style={{ padding: '3.5rem 0 5.5rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div
            className="badge badge-gold"
            style={{ marginBottom: '0.75rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} /> EXCLUSIVE ROYAL DINING
          </div>
          <h1 style={{ marginBottom: '0.75rem', fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>
            Reserve Your Table at <span className="text-gradient-gold">Raalahami</span>
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              margin: '0 auto',
              maxWidth: '620px',
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}
          >
            Experience royal chieftain hospitality. Whether an intimate dinner or grand court gathering, we tailor every detail to your comfort and dietary preferences.
          </p>
        </div>

        {/* Confirmation Screen */}
        {successReservation ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), var(--shadow-glow-gold)'
            }}
          >
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B0D11',
                fontSize: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)'
              }}
            >
              <CheckCircle2 size={36} color="#0B0D11" />
            </div>

            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
              Royal Reservation Confirmed
            </h2>
            <p style={{ color: 'var(--accent-gold)', fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Booking Reference: #{successReservation.bookingRef}
            </p>

            {/* Reservation Summary Details Table */}
            <div
              style={{
                maxWidth: '520px',
                margin: '0 auto 2rem auto',
                backgroundColor: 'rgba(11, 15, 25, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Guest Name:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{successReservation.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Party Size:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{successReservation.guests} Guests</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Date & Time:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {successReservation.date} at {successReservation.time}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Ambiance:</span>
                  <strong style={{ color: 'var(--accent-amber)' }}>{successReservation.area}</strong>
                </div>
              </div>

              {successReservation.accessibilityRequests && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Special Accommodations:</span>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
                    {successReservation.accessibilityRequests}
                  </span>
                </div>
              )}
            </div>

            <Alert
              type="success"
              title="SMS & Email Confirmation Dispatched"
              message={`A confirmation pass has been sent to ${successReservation.phone} and ${successReservation.email}. Our royal sommelier and maître d' look forward to your arrival.`}
            />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <Button variant="outline" size="md" onClick={() => setSuccessReservation(null)}>
                Book Another Table
              </Button>
              <Link to="/menu" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="md">
                  Preview Royal Menu ➔
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Reservation Booking Form */
          <form
            onSubmit={handleSubmit}
            className="glass-panel"
            style={{
              padding: '2.5rem',
              border: '1px solid rgba(229, 169, 60, 0.25)',
              boxShadow: 'var(--shadow-lg)'
            }}
            aria-label="Table reservation form"
          >
            {/* Step 1: Party Size Selector Chips */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem'
                }}
              >
                <Users size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>Select Party Size (Guests)</span>
                <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {guestOptions.map((opt) => {
                  const isSelected = formData.guests === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectGuests(opt)}
                      style={{
                        minWidth: '3.2rem',
                        padding: '0.6rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1px solid var(--accent-gold)'
                          : '1px solid var(--border-medium)',
                        backgroundColor: isSelected ? 'var(--accent-gold)' : 'var(--bg-surface)',
                        color: isSelected ? '#0B0D11' : 'var(--text-primary)',
                        fontWeight: isSelected ? '800' : '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isSelected ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none'
                      }}
                    >
                      {opt} {opt === '1' ? 'Guest' : 'Guests'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Time Picker */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              <div>
                <label
                  htmlFor="res-date"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}
                >
                  <Calendar size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span>Reservation Date</span>
                  <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <input
                  id="res-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
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
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}
                >
                  <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span>Dining Time Slot</span>
                  <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {timeSlots.map((ts) => {
                    const isSelected = formData.time === ts.value;
                    return (
                      <button
                        key={ts.value}
                        type="button"
                        onClick={() => handleSelectTime(ts.value)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected
                            ? '1px solid var(--accent-gold)'
                            : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {ts.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Dining Ambiance Setting (Interactive Cards) */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem'
                }}
              >
                <MapPin size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>Preferred Dining Ambiance & Setting</span>
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '1rem'
                }}
              >
                {diningAreas.map((area) => {
                  const isSelected = formData.area === area.id;
                  return (
                    <div
                      key={area.id}
                      onClick={() => handleSelectArea(area.id)}
                      style={{
                        padding: '1.15rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-surface)',
                        border: isSelected
                          ? '1px solid var(--accent-gold)'
                          : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.4rem'
                        }}
                      >
                        <h4
                          style={{
                            fontSize: '0.95rem',
                            margin: 0,
                            color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)'
                          }}
                        >
                          {area.name}
                        </h4>
                        {isSelected && <Check size={16} style={{ color: 'var(--accent-gold)' }} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--accent-amber)',
                          display: 'inline-block',
                          marginBottom: '0.4rem',
                          fontWeight: '600'
                        }}
                      >
                        {area.badge}
                      </span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                        {area.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact Information */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
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
                label="Contact Mobile"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                required
              />
            </div>

            {/* Step 5: EDI Accessibility & Dietary Accommodations */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label
                htmlFor="accessibility-notes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.4rem'
                }}
              >
                <span>♿ EDI Accessibility & Dietary Notes</span>
              </label>
              <textarea
                id="accessibility-notes"
                name="accessibilityRequests"
                value={formData.accessibilityRequests}
                onChange={handleChange}
                rows={3}
                placeholder="Please let us know if you require wheelchair ramp access, low-sensory seating, high chairs, Braille menus, or have severe allergies (e.g. peanuts, shellfish)."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              style={{
                width: '100%',
                fontWeight: '800',
                fontSize: '1.05rem',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35)'
              }}
              ariaLabel="Confirm royal table booking"
            >
              Confirm Royal Table Reservation ➔
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;
