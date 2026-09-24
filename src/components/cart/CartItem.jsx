import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible Raalahami CartItem Component
 * Ultra-Luxury mini-card design with smooth quantity controls
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.95rem',
        padding: '0.9rem',
        marginBottom: '0.85rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid rgba(229, 169, 60, 0.18)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        transition: 'border-color var(--transition-fast)'
      }}
    >
      {/* Item Image or Fallback */}
      <img
        src={item.imageUrl}
        alt=""
        aria-hidden="true"
        style={{
          width: '58px',
          height: '58px',
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: '0.95rem',
            margin: 0,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {item.name}
        </h4>
        <span style={{ fontSize: '0.825rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
          {formatCurrency(item.price)} each
        </span>
        {item.specialInstructions && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-amber)',
              margin: '0.2rem 0 0 0',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      {/* Quantity Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.15rem'
        }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          aria-label={`Decrease quantity of ${item.name}. Current quantity: ${item.quantity}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            width: '1.65rem',
            height: '1.65rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background var(--transition-fast)'
          }}
        >
          <Minus size={13} />
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
            color: 'var(--text-secondary)',
            width: '1.65rem',
            height: '1.65rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background var(--transition-fast)'
          }}
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Line Total & Remove */}
      <div
        style={{
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.25rem',
          minWidth: '65px'
        }}
      >
        <span
          style={{
            fontWeight: '800',
            fontSize: '0.95rem',
            color: 'var(--accent-gold)'
          }}
        >
          {formatCurrency(item.price * item.quantity)}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from royal order`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.72rem',
            padding: '0.1rem 0.2rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
