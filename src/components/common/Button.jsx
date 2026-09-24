import React from 'react';

/**
 * Accessible, styled Button component
 * Complies with WCAG 2.1 Contrast & State requirements
 */
const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost'
  size = 'md',        // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ariaLabel,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    border: '1px solid transparent',
    textDecoration: 'none',
    opacity: disabled ? 0.6 : 1,
    position: 'relative'
  };

  const sizeStyles = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.85rem' },
    md: { padding: '0.65rem 1.35rem', fontSize: '0.95rem' },
    lg: { padding: '0.85rem 1.85rem', fontSize: '1.1rem' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--accent-gold)',
      color: '#0B0D11',
      borderColor: 'var(--accent-gold)',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      backgroundColor: 'var(--bg-surface-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-subtle)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--accent-gold)',
      borderColor: 'var(--accent-gold)'
    },
    danger: {
      backgroundColor: 'var(--accent-danger)',
      color: '#FFFFFF',
      borderColor: 'var(--accent-danger)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent'
    }
  };

  const computedStyle = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.md),
    ...(variantStyles[variant] || variantStyles.primary)
  };

  return (
    <button
      type={type}
      style={computedStyle}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : 'false'}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`ralahami-btn ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            style={{
              width: '1em',
              height: '1em',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.75s linear infinite'
            }}
            aria-hidden="true"
          />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .ralahami-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .ralahami-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </button>
  );
};

export default Button;
