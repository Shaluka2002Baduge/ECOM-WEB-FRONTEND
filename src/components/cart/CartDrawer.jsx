import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible Slide-out Cart Drawer
 * Compliant with WCAG 2.1 Dialog Pattern
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
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>🛍️</span>
            <h2 id="cart-drawer-heading" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-gold)' }}>
              Your Royal Order
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem'
          }}
        >
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
                🥘
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Your order is currently empty
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Explore our authentic royal Sri Lankan menu to add gourmet lamprais, seafood curries, and delights.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  closeDrawer();
                  navigate('/menu');
                }}
              >
                Browse Royal Menu
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Selected Dishes ({items.length})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear Cart
                </button>
              </div>

              {items.map((item, idx) => (
                <CartItem key={`${item.id}-${item.specialInstructions || idx}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Summary & Checkout Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Service & VAT (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Royal Delivery</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : formatCurrency(deliveryFee)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  color: 'var(--accent-gold)'
                }}
              >
                <span>Estimated Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToCheckout}
              ariaLabel={`Proceed to checkout with total amount ${formatCurrency(totalPrice)}`}
              style={{ width: '100%' }}
            >
              Proceed to Checkout
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
