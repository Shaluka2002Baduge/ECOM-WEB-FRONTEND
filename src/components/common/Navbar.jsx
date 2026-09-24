import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import Button from './Button';

/**
 * Accessible Raalahami Royal Navbar Component
 * Features:
 * - Prominent expanded sticky glassmorphism header (5rem height)
 * - Large royal badge logo: RAALAHAMI | Royal Heritage Fine Dining
 * - Underline hover animations on navigation links
 * - Glowing Cart pill with live count and gold action highlight
 * - Dynamic RBAC role links (Admin Dashboard / Kitchen Display)
 */
const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { totalItems, totalPrice, toggleDrawer } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Base public links available to all patrons
  const baseLinks = [
    { label: 'Home', path: '/' },
    { label: 'Royal Menu', path: '/menu' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'Order Tracking', path: '/orders/track' }
  ];

  // Dynamic links conditionally added based on authenticated role
  const dynamicLinks = [];
  if (role === 'ADMIN' || role === 'MANAGER') {
    dynamicLinks.push({ label: 'Admin Dashboard', path: '/admin', isRoleSpecific: true });
  } else if (role === 'KITCHEN_STAFF') {
    dynamicLinks.push({ label: 'Kitchen Display', path: '/kitchen', isRoleSpecific: true });
  }

  const allNavLinks = [...baseLinks, ...dynamicLinks];

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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '5rem',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
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
        {/* Brand Logo & Name: RAALAHAMI */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none'
          }}
          aria-label="Raalahami Restaurant Home"
        >
          <div
            style={{
              width: '2.85rem',
              height: '2.85rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0D11',
              fontFamily: 'var(--font-serif)',
              fontWeight: '900',
              fontSize: '1.45rem',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.45)',
              border: '2px solid rgba(255, 244, 208, 0.4)'
            }}
          >
            R
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: '800',
                fontSize: '1.45rem',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1.1
              }}
            >
              RAALAHAMI
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--accent-gold)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'block',
                fontWeight: '600'
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
              gap: '1.85rem',
              margin: 0,
              padding: 0
            }}
          >
            {allNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    className="nav-link-item"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive
                        ? 'var(--accent-gold)'
                        : link.isRoleSpecific
                        ? 'var(--accent-amber)'
                        : 'var(--text-secondary)',
                      textDecoration: 'none',
                      padding: '0.6rem 0.25rem',
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    {link.isRoleSpecific && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-amber)',
                          display: 'inline-block'
                        }}
                      />
                    )}
                    {link.label}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'var(--accent-gold)',
                        borderRadius: '2px',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'center',
                        transition: 'transform 0.25s ease-in-out'
                      }}
                      className="nav-indicator"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Side: Glowing Cart Pill & Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Glowing Accessible Cart Drawer Trigger */}
          <button
            type="button"
            onClick={toggleDrawer}
            aria-label={`Shopping cart with ${totalItems} dishes, total ${formatCurrency(totalPrice)}`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 1.15rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              boxShadow: totalItems > 0 ? '0 0 16px rgba(212, 175, 55, 0.25)' : 'none'
            }}
            className="cart-nav-pill"
          >
            <ShoppingBag size={18} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              {formatCurrency(totalPrice)}
            </span>
            {totalItems > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#0B0D11',
                  borderRadius: '50%',
                  minWidth: '1.35rem',
                  height: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  padding: '0 0.2rem',
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth Info & Logout Action */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                className="badge badge-gold"
                title={`Signed in as ${user?.email || 'Authenticated User'}`}
                style={{ display: 'none' }}
                id="user-badge"
              >
                {role}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                ariaLabel="Sign out of current account"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" style={{ fontWeight: '700', padding: '0.45rem 1rem' }}>
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
              padding: '0.55rem',
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
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {allNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: location.pathname === link.path ? 'var(--accent-gold)' : 'var(--text-primary)',
                fontWeight: location.pathname === link.path ? '700' : '500',
                padding: '0.5rem 0',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {link.isRoleSpecific && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-amber)'
                    }}
                  />
                )}
                <span>{link.label}</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
          {isAuthenticated && (
            <div
              style={{
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Role: <strong style={{ color: 'var(--accent-gold)' }}>{role}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      )}

      {/* Responsive Breakpoint CSS & Underline Animation */}
      <style>{`
        .nav-link-item:hover .nav-indicator {
          transform: scaleX(1) !important;
        }
        .cart-nav-pill:hover {
          background-color: var(--bg-surface-elevated) !important;
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.4) !important;
        }
        @media (min-width: 820px) {
          .desktop-nav {
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
