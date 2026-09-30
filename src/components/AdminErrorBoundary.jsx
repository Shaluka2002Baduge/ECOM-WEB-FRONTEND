import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * AdminErrorBoundary
 * Class-based Error Boundary to catch render/lifecycle errors within Admin modules.
 * Prevents blank screen crashes and provides a luxury royal error card with recovery controls.
 */
export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="admin-error-boundary-card glass-panel"
          style={{
            margin: '2rem auto',
            maxWidth: '680px',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            backgroundColor: 'var(--bg-surface, #12151D)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            color: 'var(--text-primary, #FFFFFF)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-danger, #EF4444)'
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", serif)',
              fontSize: '1.65rem',
              fontWeight: '700',
              color: 'var(--accent-gold, #D4AF37)',
              marginBottom: '0.75rem'
            }}
          >
            Module Recovery Mode
          </h2>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #A0AEC0)',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}
          >
            An unexpected error occurred while rendering this management module. The system protected your active session without crashing the portal.
          </p>

          {this.state.error && (
            <div
              style={{
                marginBottom: '1.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#EF4444',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '120px'
              }}
            >
              {this.state.error.toString()}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.5rem',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--accent-gold, #D4AF37)',
                color: '#0B0D11',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCcw size={16} />
              <span>Reload Module</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/admin/orders';
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.5rem',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary, #FFFFFF)',
                fontWeight: '600',
                fontSize: '0.9rem',
                border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.2))',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Home size={16} />
              <span>Return to Orders</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
