import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Crown,
  Calendar,
  Users,
  Compass,
  MessageSquare
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import inquiryService from '../services/inquiryService';

/**
 * Contact Us Page - Raalahami Royal Palace Concierge
 * Features:
 * - Direct contact coordinates (Phone, Email, Physical Address)
 * - Operating hours & service schedules
 * - Responsive framed Google Map embed with dark/gold aesthetics
 * - Interactive inquiry & feedback form with Royal Gold focus states & Database API dispatch
 */
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please fill in your name, email address, and inquiry message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await inquiryService.submitInquiry({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        inquiryType: formData.subject,
        message: formData.message.trim()
      });

      setIsSubmitting(false);
      setSubmitStatus('success');
      setStatusMessage(`Thank you, ${formData.name}. Your inquiry has been securely received by the Palace Concierge. Our royal maître d' will review your message and reply directly to your email.`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      setStatusMessage(err.message || 'Unable to submit your palace inquiry. Please try again or reach out directly via WhatsApp.');
    }
  };

  return (
    <div className="contact-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. Header Section */}
      <section 
        style={{
          position: 'relative',
          paddingTop: '6rem',
          paddingBottom: '4rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div 
          className="hero-scrim-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem'
            }}
          >
            <Compass size={16} />
            Palace Concierge & Inquiries
          </div>

          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: '800',
              color: 'var(--text-primary)',
              maxWidth: '800px',
              margin: '0 auto 1.25rem auto'
            }}
          >
            Connect With <span className="text-gradient-gold">Raalahami</span>
          </h1>

          <p 
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: 'var(--text-secondary)',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: 1.7
            }}
          >
            Whether reserving a private celebration, tailoring a bespoke banquet, or seeking dining assistance, our palace concierge is at your service.
          </p>
        </div>
      </section>

      {/* 2. Main Contact Grid: Coordinates, Contact Form & Google Maps */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'start'
            }}
          >
            {/* Left Column: Contact Cards & Operating Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Location Card */}
              <div 
                className="glass-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start'
                }}
              >
                <div 
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Palace Coordinates
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                    Riverside Road,<br />
                    Ratnapura, Sabaragamuwa Province, Sri Lanka
                  </p>
                  <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '600' }}>
                    Valet Parking & Scenic Riverside Deck Dining Available
                  </span>
                </div>
              </div>

              {/* Direct Communications Card */}
              <div 
                className="glass-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div 
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(229, 169, 60, 0.15)',
                      color: 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
                      Telephone
                    </span>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600', margin: '0.2rem 0 0 0' }}>
                      +94 45 222 3456<br />
                      +94 77 123 4567
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div 
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(229, 169, 60, 0.15)',
                      color: 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
                      Email Inquiries
                    </span>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600', margin: '0.2rem 0 0 0', wordBreak: 'break-all' }}>
                      reservations@raalahami.lk<br />
                      concierge@raalahami.lk
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels & WhatsApp VIP Concierge Card */}
              <div 
                className="glass-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <MessageSquare size={20} style={{ color: 'var(--accent-gold)' }} />
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                      Social & Instant Concierge
                    </h3>
                  </div>
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    Live & Responsive
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  Connect directly with our palace team for instant WhatsApp reservations, private tasting inquiries, and behind-the-scenes royal culinary reels.
                </p>

                {/* 3 Channels Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/94771234567?text=Hello%20Raalahami%20Concierge,%20I%20would%20like%20to%20inquire%20about%20a%20reservation"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '1.1rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(37, 211, 102, 0.08)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.16)';
                      e.currentTarget.style.borderColor = '#25D366';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div 
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.53 1.951.815 2.796.815 3.183 0 5.768-2.587 5.769-5.769 0-3.181-2.587-5.767-5.769-5.767zm3.364 8.163c-.143.402-.828.74-1.155.787-.32.046-.713.067-1.155-.074-.294-.094-.678-.237-1.206-.466-2.223-.966-3.666-3.235-3.777-3.383-.111-.148-.905-1.203-.905-2.295s.569-1.632.771-1.854c.203-.223.442-.278.59-.278.148 0 .296.002.424.008.136.007.318-.052.497.378.185.443.633 1.543.689 1.654.055.111.092.24.018.388-.074.148-.111.24-.222.37-.111.129-.234.288-.334.386-.111.111-.227.231-.098.452.129.222.573.943 1.229 1.528.844.752 1.556.985 1.778 1.096.222.111.352.093.48-.056.129-.148.555-.647.703-.869.148-.222.296-.185.497-.111.203.074 1.291.609 1.513.72.222.111.37.166.424.259.055.093.055.536-.088.938z" />
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.954-1.398C8.412 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.657 0-3.2-.494-4.502-1.343l-.323-.209-2.95.833.844-2.871-.227-.338C3.937 14.975 3.455 13.524 3.455 12c0-4.712 3.833-8.545 8.545-8.545 4.713 0 8.545 3.833 8.545 8.545 0 4.713-3.832 8.545-8.545 8.545z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#25D366' }}>
                      WhatsApp
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      +94 77 123 4567
                    </span>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '1.1rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(225, 48, 108, 0.08)',
                      border: '1px solid rgba(225, 48, 108, 0.3)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.16)';
                      e.currentTarget.style.borderColor = '#E1306C';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(225, 48, 108, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div 
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E1306C' }}>
                      Instagram
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      @raalahami.palace
                    </span>
                  </a>

                  {/* Facebook */}
                  <a 
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '1.1rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(24, 119, 242, 0.08)',
                      border: '1px solid rgba(24, 119, 242, 0.3)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(24, 119, 242, 0.16)';
                      e.currentTarget.style.borderColor = '#1877F2';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(24, 119, 242, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(24, 119, 242, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div 
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        backgroundColor: '#1877F2',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1877F2' }}>
                      Facebook
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Raalahami Dining
                    </span>
                  </a>
                </div>
              </div>

              {/* Service Hours Card */}
              <div 
                className="glass-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <Clock size={22} style={{ color: 'var(--accent-gold)' }} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                    Royal Dining & Delivery Hours
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lunch Service</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>12:00 PM – 3:30 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dinner & Evening Banquets</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>6:30 PM – 11:00 PM</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Royal Home Delivery Courier</span>
                    <strong style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>11:30 AM – 10:30 PM Daily</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Inquiry Form */}
            <div 
              className="glass-panel"
              style={{
                padding: '2.5rem',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <Crown size={20} style={{ color: 'var(--accent-gold)' }} />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--text-primary)', margin: 0 }}>
                  Send a Palace Inquiry
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Fill out the details below and our team will respond within 24 hours.
              </p>

              {submitStatus === 'success' && (
                <div 
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <span>{statusMessage}</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div 
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span>{statusMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Full Name */}
                <Input 
                  label="Your Full Name"
                  id="contact-name"
                  placeholder="e.g. Lady Niluka Wijesinghe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />

                {/* Email & Phone Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <Input 
                    label="Email Address"
                    id="contact-email"
                    type="email"
                    placeholder="niluka@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />

                  <Input 
                    label="Contact Phone"
                    id="contact-phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                {/* Inquiry Subject */}
                <div>
                  <label 
                    htmlFor="contact-subject"
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Nature of Inquiry
                  </label>
                  <select 
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
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
                    <option value="General Inquiry">General Palace Inquiry</option>
                    <option value="Dining Reservation">Dining Reservation & Seating</option>
                    <option value="Private Suite & Banqueting">Private Suite & VIP Degustation</option>
                    <option value="Catering & Corporate Feasts">Catering & Corporate Feasts</option>
                    <option value="Compliment & Feedback">Patron Feedback & Compliments</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label 
                    htmlFor="contact-message"
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Your Royal Message <span style={{ color: 'var(--accent-amber)' }}>*</span>
                  </label>
                  <textarea 
                    id="contact-message"
                    rows={4}
                    placeholder="Describe your dining inquiry, preferred dates, or special dietary requirements..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    required
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
                  variant="gold" 
                  size="lg" 
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {isSubmitting ? (
                    'Dispatching Message...'
                  ) : (
                    <>
                      <Send size={18} style={{ marginRight: '0.5rem' }} />
                      Dispatch Royal Inquiry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Framed Responsive Google Map Section */}
      <section style={{ padding: '0 0 5rem 0' }}>
        <div className="container">
          <div 
            className="glass-panel"
            style={{
              padding: '1.5rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={22} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0 }}>
                    Interactive Palace Map
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Riverside Road, Ratnapura, Sabaragamuwa Province, Sri Lanka
                  </span>
                </div>
              </div>

              <a 
                href="https://maps.google.com/?q=Riverside+Road,+Ratnapura,+Sri+Lanka" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <Compass size={15} />
                Open in Google Maps
              </a>
            </div>

            {/* Responsive Google Maps Iframe */}
            <div 
              style={{
                width: '100%',
                height: '420px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              <iframe
                title="Raalahami Restaurant Ratnapura Location Map"
                src="https://maps.google.com/maps?q=Riverside+Road,+Ratnapura,+Sri+Lanka&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'invert(90%) hue-rotate(180deg) contrast(95%) brightness(90%)',
                  width: '100%',
                  height: '100%'
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
