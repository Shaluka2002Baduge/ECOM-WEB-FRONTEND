import React, { useId } from 'react';
import { handleNumericWheel } from '../../utils/numericInput';

/**
 * Standard Accessible Numeric & Price Input
 * Supports:
 * 1. Free manual keyboard typing (numbers, backspaces, decimal/integers)
 * 2. Mouse-wheel scrolling up/down to increment/decrement by step
 * 3. Controlled state with no loss of focus or remounting
 */
export const NumericInput = ({
  label,
  id,
  name,
  value,
  onChange,
  step = 50,
  min = 0,
  max = Infinity,
  placeholder = '',
  required = false,
  error = null,
  helperText = null,
  unit = '',
  disabled = false,
  className = '',
  style = {}
}) => {
  const generatedId = useId();
  const inputId = id || `num-input-${generatedId}`;
  const errorId = `${inputId}-error`;

  const onWheelHandler = (e) => {
    if (disabled) return;
    handleNumericWheel(
      e,
      value,
      (nextVal) => {
        if (typeof onChange === 'function') {
          onChange(String(nextVal));
        }
      },
      step,
      min,
      max
    );
  };

  const handleInputChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`ralahami-numeric-group ${className}`} style={{ marginBottom: '1.25rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--accent-amber)', marginLeft: '0.25rem' }}>*</span>}
          {step && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: '400' }}>(Scroll wheel ±{step})</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={inputId}
          name={name}
          type="number"
          step={step}
          min={min}
          max={max === Infinity ? undefined : max}
          value={value ?? ''}
          onChange={handleInputChange}
          onWheel={onWheelHandler}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            padding: unit ? '0.7rem 3rem 0.7rem 0.9rem' : '0.7rem 0.9rem',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
            border: error ? '1px solid #ef4444' : '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)'
          }}
        />

        {unit && (
          <span
            style={{
              position: 'absolute',
              right: '0.85rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {helperText && !error && (
        <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {helperText}
        </p>
      )}

      {error && (
        <span
          id={errorId}
          className="text-red-400 text-xs mt-1"
          style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default NumericInput;
