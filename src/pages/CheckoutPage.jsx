import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { formatCurrency } from '../utils/currency';

/**
 * Accessible CheckoutPage
 * Multi-section order finalization with payment selection and address verification
 */
export const CheckoutPage = () => {
  const { items, subtotal, tax, deliveryFee, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: user?.name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    deliveryInstructions: '',
    paymentMethod: 'CASH_ON_DELIVERY'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your royal order is empty. Please select dishes from the menu first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        items,
        deliveryAddress: formData.address,
        recipientName: formData.recipientName,
        phone: formData.phone,
        email: formData.email,
        notes: formData.deliveryInstructions,
        paymentMethod: formData.paymentMethod,
        totalPrice
      };

      const result = await orderService.createOrder(orderPayload);
      clearCart();
      navigate(`/orders/track?orderId=${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">🥘</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Your Cart is Empty</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            You haven't added any royal dishes to your order yet.
          </p>
          <Link to="/menu">
            <Button variant="primary" size="lg">Explore Royal Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page fade-in" style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Finalize Feast
          </span>
          <h1 style={{ marginBottom: '0.5rem' }}>Royal Order Checkout</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Provide your delivery destination and select your preferred payment method.
          </p>
        </div>

        {error && (
          <Alert type="error" title="Checkout Error" message={error} onDismiss={() => setError(null)} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Checkout Form */}
          <form onSubmit={handlePlaceOrder} className="glass-panel" style={{ padding: '2rem' }} aria-label="Delivery and payment checkout form">
            <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
              1. Delivery Destination & Contact
            </h2>

            <Input
              label="Recipient Name"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              placeholder="e.g. Shaluka Dulanjana"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Contact Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                required
              />

              <Input
                label="Confirmation Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patron@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="checkout-address"
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                Delivery Street Address <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <textarea
                id="checkout-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                required
                placeholder="Building number, street, apartment / suite, city..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label
                htmlFor="checkout-notes"
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                Delivery Instructions (Optional)
              </label>
              <input
                id="checkout-notes"
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                placeholder="e.g. Ring bell twice, leave at reception, avoid spicy..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              2. Payment Selection
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { id: 'CASH_ON_DELIVERY', label: 'Cash Upon Delivery (COD)', desc: 'Pay royal courier with cash or POS card machine at your door' },
                { id: 'CARD', label: 'Credit / Debit Card (Online)', desc: 'Encrypted VISA, MasterCard, or Amex transaction' },
                { id: 'DIGITAL_WALLET', label: 'Digital Wallet', desc: 'Apple Pay, Google Pay, or QR Payment' }
              ].map((method) => {
                const isChecked = formData.paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1rem',
                      backgroundColor: isChecked ? 'rgba(212, 175, 55, 0.08)' : 'var(--bg-secondary)',
                      border: isChecked ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isChecked}
                      onChange={handleChange}
                      style={{ marginTop: '0.25rem', accentColor: 'var(--accent-gold)' }}
                    />
                    <div>
                      <span style={{ fontWeight: '600', color: isChecked ? 'var(--accent-gold)' : 'var(--text-primary)', display: 'block' }}>
                        {method.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {method.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              style={{ width: '100%' }}
              ariaLabel={`Authorize and place order for total ${formatCurrency(totalPrice)}`}
            >
              Authorize & Place Royal Order ({formatCurrency(totalPrice)})
            </Button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              Feast Summary ({items.length} dishes)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.specialInstructions && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Note: {item.specialInstructions}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Service VAT (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Royal Delivery</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : formatCurrency(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', fontWeight: '700', fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                <span>Total Due</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
