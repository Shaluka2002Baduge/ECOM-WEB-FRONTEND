import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Luxury Morphing Theme Toggle
 * University of Bedfordshire (CIS007-3 / CIS045-3) UX & Accessibility Standard
 * Features:
 * - Rounded luxury pill switch with sliding morphing container
 * - Animated Sun / Moon transitions with rotation & scale micro-interactions
 * - High-contrast focus rings and full ARIA switch accessibility
 * - Tactile active press feedback (scale-95)
 */
export const ThemeToggle = ({ className = '', id = 'theme-toggle-btn' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Royal Parchment Light Theme' : 'Switch to Royal Obsidian Dark Theme'}
      title={isDark ? 'Switch to Royal Parchment Light Theme' : 'Switch to Royal Obsidian Dark Theme'}
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '3.85rem',
        height: '2.1rem',
        padding: '0.2rem',
        borderRadius: '9999px',
        backgroundColor: isDark ? '#0A0E18' : '#FAF3E3',
        border: isDark ? '1.5px solid rgba(212, 175, 55, 0.45)' : '1.5px solid rgba(197, 160, 89, 0.55)',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isDark
          ? '0 0 12px rgba(212, 175, 55, 0.2), inset 0 2px 4px rgba(0,0,0,0.5)'
          : '0 0 12px rgba(197, 160, 89, 0.25), inset 0 1px 3px rgba(0,0,0,0.08)'
      }}
    >
      {/* Background Ambience: Star sparkles in Dark mode, Sunbeam in Light mode */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '9999px',
          overflow: 'hidden',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isDark ? 'flex-start' : 'flex-end',
          padding: '0 0.5rem'
        }}
      >
        {isDark ? (
          <span style={{ fontSize: '0.65rem', color: '#D4AF37', opacity: 0.7, paddingLeft: '0.2rem' }}>
            ✦
          </span>
        ) : (
          <span style={{ fontSize: '0.65rem', color: '#B8860B', opacity: 0.8, paddingRight: '0.2rem' }}>
            ☼
          </span>
        )}
      </div>

      {/* Morphing Sliding Knob */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.65rem',
          height: '1.65rem',
          borderRadius: '50%',
          backgroundColor: isDark ? '#141B2D' : '#FFFFFF',
          border: isDark ? '1px solid #D4AF37' : '1px solid #C5A059',
          color: isDark ? '#E5A93C' : '#A17415',
          transform: isDark ? 'translateX(1.75rem)' : 'translateX(0)',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, border-color 0.3s ease',
          boxShadow: isDark
            ? '0 0 8px rgba(229, 169, 60, 0.5)'
            : '0 2px 6px rgba(197, 160, 89, 0.35)'
        }}
      >
        {isDark ? (
          <Moon
            size={13}
            style={{
              transform: 'rotate(-15deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        ) : (
          <Sun
            size={14}
            style={{
              transform: 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        )}
      </span>

      <style>{`
        .theme-toggle-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 0 16px rgba(212, 175, 55, 0.45) !important;
        }
        .theme-toggle-btn:active {
          transform: scale(0.95);
        }
        .theme-toggle-btn:focus-visible {
          outline: 3px solid var(--accent-amber);
          outline-offset: 3px;
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
