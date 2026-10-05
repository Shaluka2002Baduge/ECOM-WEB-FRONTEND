import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Universal Accessible Modal Dialog Component
 * Follows WCAG 2.1 Dialog Pattern with absolute centering across all viewports,
 * non-shrinking header/footer, click-outside dismissal, smooth inner scrolling,
 * and conditional smooth mouse-draggability.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
  footer = null,
  isDraggable = true
}) => {
  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Draggable State Management
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });

  // Reset position whenever modal opens or draggability is toggled
  useEffect(() => {
    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

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

  // Interactive Element Filter
  const isInteractiveElement = (target) => {
    if (!target) return false;
    return Boolean(
      target.closest(
        'input, textarea, select, button, a, [role="button"], [contenteditable="true"], .no-drag, input[type="range"], [tabindex="0"]'
      )
    );
  };

  // Mouse / Pointer Drag Handlers on full modal box
  const handleMouseDown = useCallback((e) => {
    if (!isDraggable) return;
    // Only primary left mouse click
    if (e.button !== 0) return;
    // Don't trigger drag if clicking interactive form controls
    if (isInteractiveElement(e.target)) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y
    };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.initialPosX + deltaX,
        y: dragStartRef.current.initialPosY + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isDraggable, position]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '0.75rem',
        boxSizing: 'border-box',
        userSelect: isDragging ? 'none' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default'
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

      {/* Centered Modal Dialog Card (Bounded to max 80vh & smoothly draggable from anywhere) */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-modal-title"
        onMouseDown={handleMouseDown}
        className={`w-full ${maxWidth.startsWith('max-w-') ? maxWidth : 'max-w-xl'} max-h-[80vh] flex flex-col bg-[#0b0c10] border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden relative z-10 ${
          isDragging ? 'cursor-grabbing select-none' : ''
        }`}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: maxWidth && !maxWidth.startsWith('max-w-') ? maxWidth : undefined,
          backgroundColor: '#0b0c10',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '0.75rem',
          boxShadow: isDragging
            ? '0 30px 60px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(212, 175, 55, 0.25)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(212, 175, 55, 0.15)',
          maxHeight: 'min(80dvh, 80vh)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transform: isDraggable && (position.x !== 0 || position.y !== 0)
            ? `translate3d(${position.x}px, ${position.y}px, 0)`
            : undefined,
          transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
          willChange: isDraggable ? 'transform' : 'auto',
          cursor: isDragging ? 'grabbing' : undefined
        }}
      >
        {/* Seamlessly Draggable Header Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800/80 flex-shrink-0 bg-[#0b0c10] select-none ${
            isDraggable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid rgba(42, 48, 66, 0.8)',
            flexShrink: 0,
            backgroundColor: '#0b0c10',
            cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', paddingRight: '0.5rem' }}>
            <h3
              id="universal-modal-title"
              className="text-base sm:text-lg font-bold text-amber-400 truncate select-none"
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                color: 'var(--accent-gold, #D4AF37)',
                margin: 0,
                fontWeight: '700',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-serif, inherit)',
                userSelect: 'none'
              }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current && onCloseRef.current()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 focus:outline-none flex-shrink-0"
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(42, 48, 66, 0.6)',
              color: 'var(--text-muted, #94A3B8)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
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

        {/* Modal Content Wrapper */}
        <div
          className="modal-inner-wrapper flex-1 min-h-0 flex flex-col overflow-hidden"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {children}
        </div>

        {/* Optional Fixed Footer if passed as separate prop */}
        {footer && (
          <div
            className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 flex-shrink-0 bg-[#0b0c10]"
            style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid rgba(42, 48, 66, 0.8)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              flexShrink: 0,
              backgroundColor: '#0b0c10'
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
