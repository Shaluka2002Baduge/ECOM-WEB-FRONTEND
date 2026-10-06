import React, { useId } from 'react';

/**
 * Accessible Input Component
 * Enforces explicit labels, helper descriptions, and error states for WCAG 2.1 compliance
 */
const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  helperText = null,
  className = '',
  disabled = false,
  rightElement = null,
  style = {},
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`ralahami-input-group ${className}`} style={{ marginBottom: '1.25rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--accent-amber)', marginLeft: '0.25rem' }} aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          style={{
            width: '100%',
            padding: rightElement ? '0.75rem 2.75rem 0.75rem 1rem' : '0.75rem 1rem',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
            border: error ? '1px solid var(--accent-danger)' : '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p
          id={helperId}
          style={{
            marginTop: '0.35rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            marginTop: '0.35rem',
            fontSize: '0.825rem',
            color: 'var(--accent-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Input;
