import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Sparkles, Utensils, Truck, ShoppingBag } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration)
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Royal Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => {
          let icon = <Sparkles size={20} color="var(--accent-gold)" />;
          let borderColor = 'rgba(229, 169, 60, 0.4)';
          let bgGradient = 'linear-gradient(135deg, rgba(26, 20, 15, 0.95), rgba(15, 12, 10, 0.98))';
          let textColor = '#F4EDE4';

          if (t.type === 'success') {
            icon = <CheckCircle2 size={20} color="#10B981" />;
            borderColor = 'rgba(16, 185, 129, 0.5)';
          } else if (t.type === 'error') {
            icon = <AlertTriangle size={20} color="#EF4444" />;
            borderColor = 'rgba(239, 68, 68, 0.5)';
          } else if (t.type === 'info') {
            icon = <Info size={20} color="#3B82F6" />;
            borderColor = 'rgba(59, 130, 246, 0.5)';
          }

          return (
            <div
              key={t.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                background: bgGradient,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(229, 169, 60, 0.15)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                color: textColor
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
              <div style={{ flex: 1, fontSize: '0.92rem', lineHeight: '1.45', fontWeight: 500 }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(244, 237, 228, 0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244, 237, 228, 0.6)')}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {},
      toast: {
        success: (msg) => console.log('Toast Success:', msg),
        error: (msg) => console.error('Toast Error:', msg),
        info: (msg) => console.info('Toast Info:', msg),
        warning: (msg) => console.warn('Toast Warning:', msg)
      }
    };
  }
  return context;
};

export default ToastContext;
