import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible CartItem Component
 * Keyboard navigable quantity controls with explicit ARIA labels
 */
export const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1, item.specialInstructions);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1, item.specialInstructions);
  };

  const handleRemove = () => {
    removeItem(item.id, item.specialInstructions);
  };

  const lineTotal = (item.price * item.quantity).toFixed(2);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.85rem 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Item Image or Fallback */}
      <img
        src={item.imageUrl}
        alt=""
        aria-hidden="true"
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-md)',
          objectFit: 'cover',
          backgroundColor: 'var(--bg-secondary)'
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </h4>
        <span style={{ fontSize: '0.825rem', color: 'var(--accent-gold)', fontWeight: '600' }}>
          {formatCurrency(item.price)} each
        </span>
        {item.specialInstructions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontStyle: 'italic' }}>
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      {/* Quantity Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.2rem'
        }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          aria-label={`Decrease quantity of ${item.name}. Current quantity: ${item.quantity}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            width: '1.75rem',
            height: '1.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          −
        </button>
        <span
          aria-label={`Quantity: ${item.quantity}`}
          style={{
            minWidth: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          aria-label={`Increase quantity of ${item.name}. Current quantity: ${item.quantity}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            width: '1.75rem',
            height: '1.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
      </div>

      {/* Line Total & Remove */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {formatCurrency(item.price * item.quantity)}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from royal order`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-danger)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
