import React from 'react';

/**
 * Accessible Alert notification component
 * Provides screen-reader live announcements (WCAG 4.1.3 Status Messages)
 */
const Alert = ({
  type = 'info', // 'info', 'success', 'warning', 'error'
  title,
  message,
  onDismiss,
  className = ''
}) => {
  const styles = {
    info: {
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.35)',
      text: '#93C5FD',
      icon: 'ℹ'
    },
    success: {
      bg: 'var(--accent-emerald-muted)',
      border: 'rgba(16, 185, 129, 0.35)',
      text: '#6EE7B7',
      icon: '✓'
    },
    warning: {
      bg: 'var(--accent-gold-muted)',
      border: 'rgba(212, 175, 55, 0.35)',
      text: '#FDE68A',
      icon: '⚠'
    },
    error: {
      bg: 'var(--accent-danger-muted)',
      border: 'rgba(239, 68, 68, 0.35)',
      text: '#FCA5A5',
      icon: '✕'
    }
  };

  const current = styles[type] || styles.info;
  const isUrgent = type === 'error';

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      className={`ralahami-alert ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1.15rem',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        borderRadius: 'var(--radius-md)',
        color: current.text,
        marginBottom: '1rem',
        width: '100%'
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }} aria-hidden="true">
        {current.icon}
      </span>
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#FFFFFF' }}>{title}</strong>}
        <div style={{ fontSize: '0.9rem', color: current.text }}>{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            cursor: 'pointer',
            padding: '0.2rem',
            opacity: 0.75
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
