import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { isValidEmail, isValidPhone, isValidTextLength, isValidPassword, sanitizeInput } from '../utils/validators';

/**
 * Accessible RegisterPage
 * Creates user identity profile with dietary notes
 */
export const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const cleanName = sanitizeInput(formData.name || '');
    const cleanEmail = (formData.email || '').trim();
    const cleanPhone = (formData.phone || '').trim();

    if (!cleanName || !isValidTextLength(cleanName, 2, 80)) {
      setLocalError('Please enter a valid full name (at least 2 characters).');
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setLocalError('Please enter a valid Sri Lankan or International phone number (e.g. 0771234567).');
      return;
    }

    if (!formData.password || !isValidPassword(formData.password, 6)) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please verify.');
      return;
    }

    try {
      const payload = {
        displayName: cleanName,
        email: cleanEmail,
        password: formData.password,
        ...(cleanPhone ? { phone: cleanPhone } : {})
      };

      const res = await register(payload);

      if (res && res.success) {
        navigate('/login', {
          state: {
            successMessage:
              'Account created successfully! Please sign in with your credentials to continue.',
            prefillEmail: cleanEmail
          },
          replace: true
        });
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page fade-in" style={{ padding: '4rem 1rem 6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            <span className="text-gradient-gold">Join the Royal Court</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Register your user profile for effortless table reservations and dining privileges at Raalahami.
          </p>
        </div>

        {(localError || error) && (
          <Alert
            type="error"
            title="Registration Error"
            message={localError || error}
            onDismiss={() => setLocalError(null)}
          />
        )}

        <form onSubmit={handleSubmit} aria-label="User registration form">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Shaluka Dulanjana"
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Contact Mobile"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 77 123 4567"
            required
            autoComplete="tel"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.3rem',
                    cursor: 'pointer',
                    color: showPassword ? 'var(--accent-gold)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = showPassword
                      ? 'var(--accent-gold)'
                      : 'var(--text-muted)')
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.3rem',
                    cursor: 'pointer',
                    color: showConfirmPassword ? 'var(--accent-gold)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = showConfirmPassword
                      ? 'var(--accent-gold)'
                      : 'var(--text-muted)')
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
          >
            Create User Profile
          </Button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already a registered user?{' '}
            <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
