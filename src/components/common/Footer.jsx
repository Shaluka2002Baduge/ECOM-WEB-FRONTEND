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
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
        transition: 'background-color var(--transition-normal)'
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
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                RAALAHAMI
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Celebrating Sri Lankan culinary heritage through chieftain recipes passed down across generations. Authentically spiced, sustainably sourced, and served with royal hospitality.
            </p>
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
                <Link to="/about" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  About Raalahami
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Royal Menu
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Contact & Location
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

          {/* Column 4: Contact & Socials */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
              Palace Location & Social
            </h3>
            <address style={{ fontStyle: 'normal', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Riverside Road, Ratnapura, Sabaragamuwa Province, Sri Lanka<br />
              Telephone: +94 45 222 3456<br />
              Email: reservations@raalahami.lk
            </address>

            {/* Social Icons Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem' }}>
              <a 
                href="https://wa.me/94771234567" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="WhatsApp VIP Concierge"
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.53 1.951.815 2.796.815 3.183 0 5.768-2.587 5.769-5.769 0-3.181-2.587-5.767-5.769-5.767zm3.364 8.163c-.143.402-.828.74-1.155.787-.32.046-.713.067-1.155-.074-.294-.094-.678-.237-1.206-.466-2.223-.966-3.666-3.235-3.777-3.383-.111-.148-.905-1.203-.905-2.295s.569-1.632.771-1.854c.203-.223.442-.278.59-.278.148 0 .296.002.424.008.136.007.318-.052.497.378.185.443.633 1.543.689 1.654.055.111.092.24.018.388-.074.148-.111.24-.222.37-.111.129-.234.288-.334.386-.111.111-.227.231-.098.452.129.222.573.943 1.229 1.528.844.752 1.556.985 1.778 1.096.222.111.352.093.48-.056.129-.148.555-.647.703-.869.148-.222.296-.185.497-.111.203.074 1.291.609 1.513.72.222.111.37.166.424.259.055.093.055.536-.088.938z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.954-1.398C8.412 21.499 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.657 0-3.2-.494-4.502-1.343l-.323-.209-2.95.833.844-2.871-.227-.338C3.937 14.975 3.455 13.524 3.455 12c0-4.712 3.833-8.545 8.545-8.545 4.713 0 8.545 3.833 8.545 8.545 0 4.713-3.832 8.545-8.545 8.545z" />
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram @raalahami.palace"
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(225, 48, 108, 0.1)',
                  border: '1px solid rgba(225, 48, 108, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Facebook @RaalahamiRoyalDining"
                style={{ 
                  color: 'var(--text-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(24, 119, 242, 0.1)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
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
            <Link to="/about" style={{ color: 'var(--text-muted)' }}>
              About Us
            </Link>
            <Link to="/menu" style={{ color: 'var(--text-muted)' }}>
              Menu & Feast
            </Link>
            <Link to="/contact" style={{ color: 'var(--text-muted)' }}>
              Palace Contact
            </Link>
            <Link to="/login" style={{ color: 'var(--accent-gold)' }}>
              Staff & User Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
