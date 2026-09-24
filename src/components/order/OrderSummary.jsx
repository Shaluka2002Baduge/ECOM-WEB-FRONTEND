import React from 'react';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible OrderSummary Component
 * Presents itemized receipt with tax, delivery, and contact info
 */
export const OrderSummary = ({ order }) => {
  if (!order) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', margin: 0 }}>
            Order #{order.id}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="badge badge-gold">
          {order.status || 'CONFIRMED'}
        </span>
      </div>

      {/* Item list */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Items in this Feast
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.items?.map((item, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px dashed var(--border-subtle)',
                fontSize: '0.9rem'
              }}
            >
              <span>
                <strong>{item.quantity}x</strong> {item.name}
              </span>
              <span style={{ color: 'var(--accent-gold)' }}>
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cost Breakdown */}
      <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
          <span>{formatCurrency(order.totalPrice * 0.9)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Tax & Royal Service</span>
          <span>{formatCurrency(order.totalPrice * 0.1)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-gold)', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Total Paid</span>
          <span>{formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      {/* Delivery Destination */}
      {order.deliveryAddress && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Delivery Destination:</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
            {order.deliveryAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
