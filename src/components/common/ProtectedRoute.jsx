import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route Guard Component for Role-Based Access Control (RBAC)
 * @param {Array<string>} allowedRoles - List of roles permitted to view children
 * @param {React.ReactNode} children - Protected component
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show accessible loading screen while auth state is resolving
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            border: '3px solid var(--border-medium)',
            borderTopColor: 'var(--accent-gold)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Verifying security clearance...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not signed in: redirect to /login with access restricted notice
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: 'Access Restricted: Please sign in to access this secured portal.'
        }}
        replace
      />
    );
  }

  // Check role authorization
  const currentRole = String(role || user.role || '').trim().toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => String(r).trim().toUpperCase());

  const isAuthorized =
    normalizedAllowedRoles.length === 0 ||
    normalizedAllowedRoles.includes(currentRole) ||
    (normalizedAllowedRoles.includes('ADMIN') && currentRole === 'MANAGER');

  if (!isAuthorized) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: `Access Denied: Your current role (${currentRole}) lacks sufficient privileges for this dashboard.`
        }}
        replace
      />
    );
  }

  // Access granted
  return <>{children}</>;
};

export default ProtectedRoute;
