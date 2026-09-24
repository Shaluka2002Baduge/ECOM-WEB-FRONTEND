import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Accessible LoginPage / Patron Portal
 * Authenticates against backend POST /api/auth/login
 * Performs dynamic role-based redirection to /admin, /kitchen, or /menu
 */
export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => location.state?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [successNotification, setSuccessNotification] = useState(
    () => location.state?.successMessage || null
  );

  // Sync state if redirected from registration
  useEffect(() => {
    if (location.state?.prefillEmail) {
      setEmail(location.state.prefillEmail);
    }
    if (location.state?.successMessage) {
      setSuccessNotification(location.state.successMessage);
    }
  }, [location.state]);

  // Access denied or redirect message passed via navigation state
  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotification(null);

    try {
      const res = await login(email, password);
      if (res && res.success) {
        const userRole = (res.user?.role || '').toUpperCase();

        // Dynamic Role-Based Redirection
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'KITCHEN_STAFF') {
          navigate('/kitchen', { replace: true });
        } else {
          // CUSTOMER
          navigate('/menu', { replace: true });
        }
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify your email and password.');
    }
  };

  return (
    <div
      className="login-page fade-in"
      style={{
        padding: '4rem 1rem 6rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 12rem)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Brand Crest & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0D11',
              fontFamily: 'var(--font-serif)',
              fontWeight: '800',
              fontSize: '1.75rem',
              marginBottom: '1rem',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.4)'
            }}
          >
            R
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Patron & Staff Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in with your registered credentials to access your dedicated portal.
          </p>
        </div>

        {/* Registration Success Notification */}
        {successNotification && (
          <Alert
            type="success"
            title="Account Created"
            message={successNotification}
            onDismiss={() => setSuccessNotification(null)}
            style={{ marginBottom: '1.25rem' }}
          />
        )}

        {/* Redirect Notice / Access Denied Message */}
        {redirectMessage && (
          <Alert
            type="warning"
            title="Access Restricted"
            message={redirectMessage}
            style={{ marginBottom: '1.25rem' }}
          />
        )}

        {/* Authentication Errors */}
        {(localError || error) && (
          <Alert
            type="error"
            title="Authentication Error"
            message={localError || error}
            onDismiss={() => setLocalError(null)}
            style={{ marginBottom: '1.25rem' }}
          />
        )}

        {/* Login Form: Strictly Email, Password & Single Sign In Button */}
        <form onSubmit={handleSubmit} aria-label="Sign in credentials form">
          <Input
            label="Email Address"
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. patron@raalahami.lk"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: '700'
            }}
          >
            Sign In
          </Button>

          {/* Account Creation Link for Customers */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem'
            }}
          >
            New patron to Raalahami?{' '}
            <Link to="/register" style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
