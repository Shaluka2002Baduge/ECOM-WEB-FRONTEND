import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
  Utensils,
  Boxes,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';
import ThemeToggle from '../components/common/ThemeToggle';

/**
 * Dedicated Full-Height SaaS Admin Layout
 * Completely isolated from Customer Navbar & Footer.
 * Features:
 * - Sleek, fixed/collapsible dark luxury sidebar with deep URL-based routing
 * - Top Header with Admin title, live clock, logged-in admin email, and direct Logout
 * - Modular dynamic views rendered via React Router Outlet
 * - Zero nested component definitions: all modals and forms isolated in standalone modules
 */
export const AdminLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active section directly from the current browser URL
  const getActiveSection = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin/menu')) return 'menu';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/reservations')) return 'reservations';
    if (path.includes('/admin/staff')) return 'staff';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/orders')) return 'orders';
    return 'orders';
  };

  const activeSection = getActiveSection();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep live clock updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Navigation Items with Icons from lucide-react and canonical nested routes
  const navItems = [
    {
      id: 'orders',
      path: '/admin/orders',
      label: 'Order Fulfillment',
      icon: ShoppingBag,
      description: 'Live dispatch, delivery & takeaway'
    },
    {
      id: 'menu',
      path: '/admin/menu',
      label: 'Menu Management',
      icon: Utensils,
      description: 'Dishes, pricing & availability'
    },
    {
      id: 'inventory',
      path: '/admin/inventory',
      label: 'Inventory & Stock',
      icon: Boxes,
      description: 'Pantry tracking & raw materials'
    },
    {
      id: 'reservations',
      path: '/admin/reservations',
      label: 'Reservations & Tables',
      icon: CalendarDays,
      description: 'Floor plan, seating & guest bookings'
    },
    {
      id: 'staff',
      path: '/admin/staff',
      label: 'Staff & Role Clearance',
      icon: ShieldCheck,
      description: 'RBAC permissions & team roster'
    },
    {
      id: 'reports',
      path: '/admin/reports',
      label: 'Financial & Reports',
      icon: TrendingUp,
      description: 'Sales velocity, revenue & analytics'
    }
  ];

  return (
    <div
      className="admin-saas-layout admin-isolated-theme"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-normal), color var(--transition-normal)'
      }}
    >
      {/* =================================================================== */}
      {/* 1. DEDICATED LUXURY ADMIN SIDEBAR                                   */}
      {/* =================================================================== */}
      <aside
        className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '270px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 950,
          transition: 'transform 0.25s ease-in-out, background-color var(--transition-normal)'
        }}
      >
        {/* Brand Crest Header */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B0D11',
                fontFamily: 'var(--font-serif)',
                fontWeight: '800',
                fontSize: '1.25rem',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.35)'
              }}
            >
              R
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  letterSpacing: '0.05em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1
                }}
              >
                RAALAHAMI
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--accent-gold)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}
              >
                Admin Suite v2.0
              </div>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            className="mobile-close-sidebar"
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'none',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav
          aria-label="Admin Navigation"
          style={{
            padding: '1rem 0.75rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              padding: '0.5rem 0.75rem',
              fontWeight: '700'
            }}
          >
            Management Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setIsMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
              >
                <Icon
                  size={19}
                  style={{
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isActive ? '700' : '500', fontSize: '0.9rem', lineHeight: 1.2 }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: isActive ? 'rgba(212, 175, 55, 0.8)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Patron Portal link & Admin identity pill */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {/* Quick link to public website */}
          <Link
            to="/menu"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span>Preview Patron Menu</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN ADMIN CONTENT CONTAINER                                     */}
      {/* =================================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 900,
            transition: 'background-color var(--transition-normal)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center'
              }}
              aria-label="Open Admin Menu"
            >
              <MenuIcon size={20} />
            </button>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Raalahami Operations
              </div>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>
                {navItems.find((n) => n.id === activeSection)?.label}
              </h1>
            </div>
          </div>

          {/* Right Header Controls: Theme Toggle, Time, Admin Email, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Global Theme Toggle */}
            <ThemeToggle id="admin-theme-toggle-btn" />

            {/* Live Clock */}
            <div
              className="admin-clock"
              style={{
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Clock size={14} />
              {currentTime.toLocaleTimeString()}
            </div>

            {/* Logged in Admin Profile */}
            <div
              className="admin-badge-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Signed in:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {user?.email || 'admin@raalahami.lk'}
              </strong>
              <span className="badge badge-gold">
                {role || 'ADMIN'}
              </span>
            </div>

            {/* Direct Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--accent-danger-muted)',
                color: 'var(--accent-danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Sign out of Admin Session"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div style={{ padding: '1rem 1.75rem 0 1.75rem' }}>
            <Alert
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onDismiss={() => setNotification(null)}
            />
          </div>
        )}

        {/* Dynamic Content Area (Modular Sub-Views via React Router Outlet) */}
        <main style={{ flex: 1, padding: '1.75rem' }}>
          <Outlet context={{ setNotification, onNotify: setNotification }} />
        </main>
      </div>

      {/* Responsive Styles for Sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .mobile-hamburger {
            display: inline-flex !important;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
          .admin-clock {
            display: none !important;
          }
          .admin-badge-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
