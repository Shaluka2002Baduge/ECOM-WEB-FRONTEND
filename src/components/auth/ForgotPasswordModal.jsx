import React, { useState, useEffect, useRef } from 'react';
import { Mail, KeyRound, CheckCircle2, Lock, Eye, EyeOff, ArrowLeft, RefreshCw, Sparkles, X } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../common/Button';
import Alert from '../common/Alert';

/**
 * ForgotPasswordModal
 * University of Bedfordshire (CIS007-3 / CIS045-3) UX & Accessibility Standard
 * Features:
 * - Step 1: Email verification & OTP dispatch (POST /api/auth/forgot-password)
 * - Step 2: 6-Digit Auto-Advancing OTP inputs + New Password with show/hide toggle + 60s Resend Cooldown
 * - Step 3: Celebration confirmation with instant transition to sign in
 * - Full Dark/Light theme token styling & keyboard accessibility
 */
export const ForgotPasswordModal = ({ isOpen, onClose, onPasswordResetSuccess, initialEmail = '' }) => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify & Reset, 3: Success
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRefs = useRef([]);
  const modalRef = useRef(null);

  // Sync initialEmail when opened
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep(1);
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessInfo(null);
      setCooldown(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, initialEmail]);

  // 60-second cooldown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus management on step change
  useEffect(() => {
    if (step === 2 && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid royal patron email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessInfo(res?.message || 'A 6-digit verification code has been dispatched to your email.');
      setCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Unable to dispatch recovery code. Please ensure the email address is registered.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessInfo(res?.message || 'A fresh verification code has been dispatched.');
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Digits Change & Auto-Focus Movement
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpDigits];

    if (cleaned.length > 1) {
      // User pasted multiple characters
      const pastedDigits = cleaned.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtpDigits(newOtp);

    // Auto-advance to next input if digit entered
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Backspace Handler
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Current is already empty, focus previous and clear it
        const newOtp = [...otpDigits];
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Step 2: Submit Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please provide all 6 digits of the recovery code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: fullOtp,
        newPassword
      });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Verification failed. The code may be incorrect or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '0.75rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        className="glass-panel fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: 'min(92dvh, 90vh)',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 1.5rem',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow-gold)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={20} />
        </button>

        {/* STEP 1: REQUEST OTP */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
                  marginBottom: '1rem',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)'
                }}
              >
                <KeyRound size={24} />
              </div>
              <h2
                id="forgot-password-title"
                style={{
                  fontSize: '1.6rem',
                  marginBottom: '0.4rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)'
                }}
              >
                Reset Password
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Enter your registered patron email to receive a confidential 6-digit authentication code.
              </p>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                onDismiss={() => setError(null)}
                style={{ marginBottom: '1.25rem' }}
              />
            )}

            <form onSubmit={handleRequestOtp} aria-label="Request recovery code form">
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="forgot-email"
                  style={{
                    display: 'block',
                    marginBottom: '0.45rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Registered Email Address <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--accent-gold)'
                    }}
                  />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@raalahami.lk"
                    required
                    autoFocus
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                style={{ width: '100%', fontWeight: '700', marginBottom: '1rem' }}
              >
                Send Recovery Code
              </Button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0.4rem'
                }}
              >
                Remembered your password? <strong style={{ color: 'var(--accent-gold)' }}>Return to Sign In</strong>
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1.5px solid var(--accent-gold)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  marginBottom: '0.75rem'
                }}
              >
                <Lock size={22} />
              </div>
              <h2
                id="forgot-password-title"
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.35rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)'
                }}
              >
                Verify Code & Reset
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Enter the 6-digit code sent to <strong style={{ color: 'var(--accent-gold)' }}>{email}</strong>
              </p>
            </div>

            {successInfo && (
              <Alert
                type="success"
                message={successInfo}
                onDismiss={() => setSuccessInfo(null)}
                style={{ marginBottom: '1.25rem' }}
              />
            )}

            {error && (
              <Alert
                type="error"
                message={error}
                onDismiss={() => setError(null)}
                style={{ marginBottom: '1.25rem' }}
              />
            )}

            <form onSubmit={handleResetPassword} aria-label="Enter verification code and new password">
              {/* 6 Digit Auto-Advancing Input Boxes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.65rem',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                  }}
                >
                  6-Digit Recovery OTP
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      style={{
                        width: '2.8rem',
                        height: '3.2rem',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: 'var(--accent-gold)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: digit ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-amber)')}
                      onBlur={(e) => {
                        e.target.style.borderColor = digit ? 'var(--accent-gold)' : 'var(--border-medium)';
                      }}
                    />
                  ))}
                </div>

                {/* Cooldown Timer & Resend Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.82rem'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={14} /> Change Email
                  </button>

                  {cooldown > 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Resend in <strong style={{ color: 'var(--accent-gold)' }}>{cooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <RefreshCw size={13} /> Resend OTP Code
                    </button>
                  )}
                </div>
              </div>

              {/* New Password Field */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label
                  htmlFor="new-password"
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}
                >
                  New Password <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 1rem',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="confirm-password"
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Confirm New Password <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 1rem',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                style={{ width: '100%', fontWeight: '700' }}
              >
                Reset Password
              </Button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }} className="fade-in">
            <div
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid var(--accent-emerald)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: '1.25rem',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2
              id="forgot-password-title"
              style={{
                fontSize: '1.7rem',
                marginBottom: '0.65rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)'
              }}
            >
              Password Restored
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '2rem',
                maxWidth: '380px',
                margin: '0 auto 2rem auto'
              }}
            >
              Your credentials have been securely updated. Please sign in with your new password to resume your royal dining journey.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onClose();
                if (onPasswordResetSuccess) {
                  onPasswordResetSuccess(email);
                }
              }}
              style={{
                width: '100%',
                fontWeight: '700'
              }}
            >
              Proceed to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
