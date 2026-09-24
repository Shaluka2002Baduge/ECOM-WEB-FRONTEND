import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Accessible LoginPage
 * Supports Virtual Identity authentication and CIS007 role demonstration
 */
export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/menu');
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to authenticate');
    }
  };

  const handleQuickDemoLogin = async (roleName, demoEmail) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
    const res = await login(demoEmail, 'DemoPass123!');
    if (res.success) {
      navigate('/menu');
    }
  };

  return (
    <div className="login-page fade-in" style={{ padding: '4rem 1rem 6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0D11',
              fontFamily: 'var(--font-serif)',
              fontWeight: '800',
              fontSize: '1.5rem',
              marginBottom: '1rem'
            }}
          >
            R
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Patron Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your royal order history and preferences.
          </p>
        </div>

        {(localError || error) && (
          <Alert
            type="error"
            title="Authentication Error"
            message={localError || error}
            onDismiss={() => setLocalError(null)}
          />
        )}

        <form onSubmit={handleSubmit} aria-label="Sign in form">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patron@ralahami.lk"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
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
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
          >
            Sign In to Royal Court
          </Button>

          {/* Virtual Identity Quick Tester for Evaluators */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
              ✦ Virtual Identity Quick Role Access
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.CUSTOMER, 'customer@ralahami.lk')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.KITCHEN_STAFF, 'kitchen.staff@ralahami.lk')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--accent-amber)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Kitchen Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.ADMIN, 'admin.master@ralahami.lk')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Admin
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New to Ralahami?{' '}
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
