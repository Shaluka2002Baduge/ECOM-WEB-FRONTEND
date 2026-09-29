import React from 'react';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible OrderSummary Component
 * Presents itemized receipt with tax, delivery, and contact info
 */
export const OrderSummary = ({ order }) => {
  if (!order) return null;

  const resolvedTotal = Number(order.totalPrice || order.totalAmount || order.total_amount || 0);
  const resolvedDate = order.createdAt || order.created_at || order.diningDate || order.date;
  const dateDisplay = resolvedDate && !isNaN(new Date(resolvedDate).getTime())
    ? new Date(resolvedDate).toLocaleString()
    : 'Recent feast';

  const subtotal = Number(order.subtotal || order.subTotal) || (resolvedTotal > 0 ? (resolvedTotal * 0.9) : 0);
  const taxVat = Number(order.serviceVat || order.service_vat || order.tax) || (resolvedTotal > 0 ? (resolvedTotal * 0.1) : 0);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', margin: 0 }}>
            Order #{order.order_number || order.orderNumber || order.id}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Placed on: {dateDisplay}
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
          {order.items?.map((item, index) => {
            const itemPrice = Number(item.price || item.unit_price || item.unitPrice || 0);
            const itemQty = Number(item.quantity || item.qty || 1);
            return (
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
                  <strong>{itemQty}x</strong> {item.name}
                </span>
                <span style={{ color: 'var(--accent-gold)' }}>
                  {formatCurrency(itemPrice * itemQty)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Cost Breakdown */}
      <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Tax & Royal Service</span>
          <span>{formatCurrency(taxVat)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-gold)', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Total Paid</span>
          <span>{formatCurrency(resolvedTotal)}</span>
        </div>
      </div>

      {/* Delivery Destination */}
      {(order.deliveryAddress || order.delivery_address || order.deliveryStreetAddress) && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Delivery Destination:</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
            {order.deliveryAddress || order.delivery_address || order.deliveryStreetAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
