import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Accessible RegisterPage
 * Creates patron identity profile with dietary notes
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

  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please verify.');
      return;
    }

    try {
      const payload = {
        displayName: formData.fullName || formData.name || formData.displayName,
        email: formData.email,
        password: formData.password
      };

      const res = await register(payload);

      if (res && res.success) {
        navigate('/login', {
          state: {
            successMessage:
              'Account created successfully! Please sign in with your credentials to continue.',
            prefillEmail: formData.email
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
            Register your patron profile for effortless table reservations and dining privileges at Raalahami.
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

        <form onSubmit={handleSubmit} aria-label="Patron registration form">
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
            placeholder="patron@example.com"
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
          >
            Create Patron Profile
          </Button>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already an esteemed patron?{' '}
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
