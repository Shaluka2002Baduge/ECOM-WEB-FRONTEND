import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Accessible Footer Component
 * Conforms to WCAG 2.1 Contentinfo Landmark with EDI & Allergen notices
 */
const Footer = () => {
  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        paddingTop: '3.5rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B0D11',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '800'
                }}
              >
                R
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: '700', fontSize: '1.2rem', color: '#FFFFFF' }}>
                RALAHAMI
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Celebrating Sri Lankan culinary heritage through royal recipes passed down across generations. Authentically spiced, sustainably sourced, and served with royal hospitality.
            </p>
            {/* EDI Compliance Badge */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', display: 'block' }}>
                ♿ EDI & ACCESSIBILITY COMMITMENT
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Compliant with WCAG 2.1 AA standards for an inclusive dining experience.
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Navigation
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Home & Story
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Royal A La Carte Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link to="/orders/track" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Live Order Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Dining */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Royal Hours
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <strong>Lunch:</strong> 12:00 PM – 3:30 PM
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <strong>Dinner:</strong> 6:30 PM – 11:00 PM
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <strong>Royal Delivery:</strong> Daily 11:30 AM – 10:30 PM
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              All major Sri Lankan cards, FriMi, Koko, and Cash on Delivery accepted (in Rs. / LKR).
            </p>
          </div>

          {/* Column 4: Contact & Allergen Disclosure */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Location & Inquiries
            </h3>
            <address style={{ fontStyle: 'normal', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              24 Galle Face Court, Colombo 03, Sri Lanka<br />
              Telephone: +94 11 234 5678<br />
              Email: reservations@ralahami.lk
            </address>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              <strong>Allergen Notice:</strong> Our kitchens prepare tree nuts, shellfish, and mustard. Please indicate dietary needs during checkout or reservation.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Ralahami Restaurant. All Rights Reserved. CIS007-3 / CIS045-3 Architecture.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Privacy Protocol</span>
            <span style={{ color: 'var(--text-muted)' }}>Terms of Service</span>
            <span style={{ color: 'var(--accent-gold)' }}>WCAG 2.1 AA Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
