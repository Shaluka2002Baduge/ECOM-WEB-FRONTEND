import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible Slide-out Cart Drawer
 * Ultra-Luxury Raalahami Design System
 * Features:
 * - Slide-over drawer with backdrop blur
 * - Sleek item cards with smooth stepper controls
 * - Detailed order breakdown (Subtotal, VAT, Delivery)
 * - Gold CTA checkout button with live total
 * - WCAG 2.1 Dialog Pattern & Escape key dismiss
 */
export const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    subtotal,
    tax,
    deliveryFee,
    totalPrice,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (isDrawerOpen) {
      previouslyFocusedRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus close button or first focusable
      const focusables = drawerRef.current?.querySelectorAll('button, [href], input');
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDrawer();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedRef.current) {
          previouslyFocusedRef.current.focus();
        }
      };
    }
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 10, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-heading"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#0E1422',
          borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.35rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(180deg, rgba(20, 27, 44, 0.9) 0%, rgba(14, 20, 34, 0.9) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B0D11',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)'
              }}
            >
              <ShoppingBag size={16} />
            </div>
            <div>
              <h2
                id="cart-drawer-heading"
                style={{
                  fontSize: '1.25rem',
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700'
                }}
              >
                Your Royal Feast
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>
                Raalahami Dining Court
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              width: '2.2rem',
              height: '2.2rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            backgroundColor: '#0B0F19'
          }}
        >
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div
                style={{
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2rem'
                }}
              >
                🏺
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-serif)'
                }}
              >
                Your Royal Order is Empty
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  marginBottom: '1.75rem'
                }}
              >
                Select from our authentic Dutch Burgher Lamprais, Jaffna Lagoon curries, and heirloom specialties.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeDrawer();
                  navigate('/menu');
                }}
              >
                <Sparkles size={16} style={{ marginRight: '0.4rem' }} />
                Browse Royal Menu
              </Button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                  {items.length} {items.length === 1 ? 'Dish Selected' : 'Dishes Selected'}
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear All
                </button>
              </div>

              {items.map((item, idx) => (
                <CartItem key={`${item.id}-${item.specialInstructions || idx}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Summary & Gold Checkout CTA */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid rgba(212, 175, 55, 0.25)',
              background: 'linear-gradient(180deg, #111726 0%, #0A0D15 100%)',
              boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Cost Breakdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Service & Royal VAT (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Palace Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong style={{ color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>COMPLIMENTARY</strong>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  marginTop: '0.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: '800',
                  fontSize: '1.25rem'
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>Estimated Total</span>
                <span className="text-gradient-gold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Gold Checkout CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToCheckout}
              ariaLabel={`Proceed to checkout with total amount ${formatCurrency(totalPrice)}`}
              style={{
                width: '100%',
                fontWeight: '800',
                fontSize: '1.05rem',
                letterSpacing: '0.03em',
                padding: '0.95rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              <span>Proceed to Royal Checkout</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
