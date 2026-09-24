import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Accessible Raalahami Royal Footer Component
 * Conforms to WCAG 2.1 Contentinfo Landmark with EDI & Allergen notices
 */
const Footer = () => {
  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: '#070A12',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        paddingTop: '4rem',
        paddingBottom: '2.5rem'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Column 1: Heritage Brand & EDI Statement */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B0D11',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '900',
                  fontSize: '1.15rem'
                }}
              >
                R
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: '800', fontSize: '1.3rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                RAALAHAMI
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Celebrating Sri Lankan culinary heritage through chieftain recipes passed down across generations. Authentically spiced, sustainably sourced, and served with royal hospitality.
            </p>
            {/* EDI Compliance Badge */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>
                ♿ EDI & Accessibility Commitment
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Compliant with WCAG 2.1 AA standards for an inclusive dining experience.
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
              Navigation
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Home & Story
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Royal A La Carte Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link to="/orders/track" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Live Order Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Dining */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
              Royal Dining Hours
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <strong>Lunch Service:</strong> 12:00 PM – 3:30 PM
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <strong>Dinner Service:</strong> 6:30 PM – 11:00 PM
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <strong>Royal Courier:</strong> Daily 11:30 AM – 10:30 PM
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              All major Sri Lankan cards, FriMi, Koko, and Cash on Delivery accepted (in LKR / Rs.).
            </p>
          </div>

          {/* Column 4: Contact & Allergen Disclosure */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
              Palace Location
            </h3>
            <address style={{ fontStyle: 'normal', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              24 Galle Face Court, Colombo 03, Sri Lanka<br />
              Telephone: +94 11 234 5678<br />
              Email: reservations@raalahami.lk
            </address>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
              <strong>Allergen Notice:</strong> Our royal kitchens prepare tree nuts, shellfish, and mustard. Please indicate dietary preferences during reservation.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} Raalahami Restaurant. All Royal Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/menu" style={{ color: 'var(--text-muted)' }}>
              Menu Directory
            </Link>
            <Link to="/reservations" style={{ color: 'var(--text-muted)' }}>
              Dining Reservations
            </Link>
            <Link to="/login" style={{ color: 'var(--accent-gold)' }}>
              Staff & Patron Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
