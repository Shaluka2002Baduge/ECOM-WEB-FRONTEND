import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import Button from './Button';

/**
 * Accessible Navbar Component
 * Compliant with WCAG 2.1 Landmark roles & Navigation guidelines
 */
const Navbar = () => {
  const { user, role, logout, switchRole, isAuthenticated } = useAuth();
  const { totalItems, totalPrice, toggleDrawer } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Royal Menu', path: '/menu' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'Order Tracking', path: '/orders/track' }
  ];

  return (
    <header
      role="banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '4.5rem'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none'
          }}
          aria-label="Ralahami Restaurant Home"
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0D11',
              fontFamily: 'var(--font-serif)',
              fontWeight: '800',
              fontSize: '1.25rem',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
            }}
          >
            R
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: '700',
                fontSize: '1.35rem',
                letterSpacing: '0.04em',
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1.1
              }}
            >
              RALAHAMI
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--accent-gold)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block'
              }}
            >
              Royal Heritage Fine Dining
            </span>
          </div>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav aria-label="Main Navigation" style={{ display: 'none' }} className="desktop-nav">
          <ul
            style={{
              display: 'flex',
              alignItems: 'center',
              listStyle: 'none',
              gap: '1.75rem',
              margin: 0,
              padding: 0
            }}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      padding: '0.5rem 0.25rem',
                      borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Action Controls: Role Switcher, Cart, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Virtual Identity Role Switcher for CIS007 evaluation */}
          <div style={{ display: 'none' }} className="role-switcher-container">
            <label htmlFor="role-select" className="sr-only">
              Switch Virtual User Role for Evaluation
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => switchRole(e.target.value)}
              title="Virtual Identity Role Switcher"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--accent-gold)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <option value={ROLES.CUSTOMER}>Role: Customer</option>
              <option value={ROLES.KITCHEN_STAFF}>Role: Kitchen Staff</option>
              <option value={ROLES.ADMIN}>Role: Admin</option>
            </select>
          </div>

          {/* Accessible Cart Drawer Trigger */}
          <button
            type="button"
            onClick={toggleDrawer}
            aria-label={`Shopping cart with ${totalItems} dishes, total ${formatCurrency(totalPrice)}`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 0.95rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '1.15rem' }}>
              🛍️
            </span>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              {formatCurrency(totalPrice)}
            </span>
            {totalItems > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#0B0D11',
                  borderRadius: '50%',
                  minWidth: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0 0.2rem'
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth Info / Login Action */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                className="badge badge-gold"
                title={`Signed in as ${user?.email}`}
                style={{ display: 'none' }}
                id="user-badge"
              >
                {role}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                ariaLabel="Log out from session"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Navigation Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            aria-label="Toggle navigation menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: location.pathname === link.path ? 'var(--accent-gold)' : 'var(--text-primary)',
                fontWeight: location.pathname === link.path ? '700' : '500',
                padding: '0.5rem 0',
                textDecoration: 'none'
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label htmlFor="mobile-role-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Virtual Identity Role:
            </label>
            <select
              id="mobile-role-select"
              value={role}
              onChange={(e) => switchRole(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <option value={ROLES.CUSTOMER}>Customer</option>
              <option value={ROLES.KITCHEN_STAFF}>Kitchen Staff</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>
        </nav>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: block !important;
          }
          .role-switcher-container {
            display: block !important;
          }
          #user-badge {
            display: inline-flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
