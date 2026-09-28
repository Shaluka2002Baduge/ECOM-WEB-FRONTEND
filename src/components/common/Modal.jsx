import React, { useEffect, useRef } from 'react';

/**
 * Universal Accessible Modal Dialog Component
 * Follows WCAG 2.1 Dialog Pattern with flawless vertical & horizontal centering,
 * dynamic 100dvh mobile viewport handling, click-outside dismissal, and inner scrolling.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '580px',
  footer = null
}) => {
  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Keyboard listener for Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onCloseRef.current) onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      if (
        previouslyFocusedElementRef.current &&
        typeof previouslyFocusedElementRef.current.focus === 'function'
      ) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(0.75rem, 2.5vw, 1.5rem)',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
      role="presentation"
    >
      {/* Click Outside Dismissal Backdrop */}
      <div
        className="fixed inset-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
        onClick={() => onCloseRef.current && onCloseRef.current()}
        aria-hidden="true"
      />

      {/* Centered Modal Dialog Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-modal-title"
        className="relative w-full bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl text-white my-auto z-10 flex flex-col fade-in"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: maxWidth || '580px',
          backgroundColor: 'var(--bg-surface, #0F1219)',
          border: '1px solid var(--border-medium, rgba(212, 175, 55, 0.35))',
          borderRadius: 'var(--radius-xl, 16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.15)',
          padding: 'clamp(1rem, 2.5vw, 1.5rem)',
          margin: 'auto',
          maxHeight: 'min(92dvh, 88vh)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Sticky/Fixed Modal Header */}
        <div
          className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle, rgba(42, 48, 66, 0.6))',
            flexShrink: 0,
            marginBottom: '0.5rem'
          }}
        >
          <h3
            id="universal-modal-title"
            className="text-base sm:text-lg font-bold text-amber-400 truncate pr-2"
            style={{
              fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
              color: 'var(--accent-gold, #D4AF37)',
              margin: 0,
              fontWeight: '700',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-serif, inherit)'
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={() => onCloseRef.current && onCloseRef.current()}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle, rgba(42, 48, 66, 0.5))',
              color: 'var(--text-muted, #94A3B8)',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm, 6px)',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted, #94A3B8)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content (Inner Scroll Only) */}
        <div
          className="modal-inner-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </div>

        {/* Optional Fixed Footer if passed as separate prop */}
        {footer && (
          <div
            className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0 mt-auto"
            style={{
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle, rgba(42, 48, 66, 0.6))',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.65rem',
              flexShrink: 0
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
