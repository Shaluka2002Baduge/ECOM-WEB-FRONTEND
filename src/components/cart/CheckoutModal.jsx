import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, X, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible CheckoutModal
 * Fast direct-checkout modal triggered from cart drawer or menu
 * University of Bedfordshire (CIS007-3 / CIS045-3) UX & Accessibility Standard
 */
export const CheckoutModal = ({ isOpen, onClose }) => {
  const { items, subtotal, tax, deliveryFee, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    recipientName: user?.name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    deliveryInstructions: '',
    paymentMethod: 'CASH_ON_DELIVERY'
  });

  const [emailError, setEmailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (user?.email) {
        setFormData((prev) => ({
          ...prev,
          email: user.email,
          recipientName: prev.recipientName || user.name || ''
        }));
      }
      setEmailError(null);
      setError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, user]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val || !val.trim()) {
      return 'Email address is mandatory for dispatching your culinary receipt.';
    }
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid royal patron email (e.g. patron@raalahami.lk).';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setEmailError(validateEmail(value));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your royal order is empty. Please select dishes from the menu first.');
      return;
    }

    if (isSubmitting) return;

    const finalEmail = (formData.email || user?.email || '').trim().toLowerCase();
    const emailErr = validateEmail(finalEmail);
    if (emailErr) {
      setEmailError(emailErr);
      setError(emailErr);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const mappedItems = items.map((item) => {
      const resolvedId = item.id || item.menu_item_id || item.menuItemId || item._id;
      return {
        id: Number(resolvedId) || resolvedId,
        menu_item_id: Number(resolvedId) || resolvedId,
        menuItemId: Number(resolvedId) || resolvedId,
        name: item.name || item.title,
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
      };
    });

    const payload = {
      recipientName: formData.recipientName,
      customerName: formData.recipientName,
      customerEmail: finalEmail,
      email: finalEmail,
      phone: formData.phone,
      deliveryStreetAddress: formData.address,
      deliveryAddress: formData.address,
      deliveryInstructions: formData.deliveryInstructions,
      notes: formData.deliveryInstructions,
      paymentMethod: formData.paymentMethod,
      items: mappedItems,
      subtotal: subtotal,
      serviceVat: serviceVat,
      deliveryFee: deliveryFee || 450,
      totalAmount: totalDue,
      totalDue: totalDue,
      totalPrice: totalDue
    };

    console.log('🚀 [SUBMITTING ORDER PAYLOAD TO API]:', payload);

    try {
      const result = await orderService.createOrder(payload);
      clearCart();
      onClose();
      const placedOrderId = result?.id || result?.orderId || result?.data?.id || result?.data?.orderId;
      navigate(`/orders/track?orderId=${placedOrderId || 'SUCCESS'}`);
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '0.75rem',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="glass-panel fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'min(92dvh, 90vh)',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 1.25rem',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow-gold)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
            Instant Palace Dispatch
          </span>
          <h2
            id="checkout-modal-title"
            style={{
              fontSize: '1.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              margin: 0
            }}
          >
            Authorize Royal Order
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Confirm contact, delivery destination, and payment method.
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            title="Checkout Error"
            message={error}
            onDismiss={() => setError(null)}
            style={{ marginBottom: '1rem' }}
          />
        )}

        <form onSubmit={handlePlaceOrder} aria-label="Royal checkout form">
          <Input
            label="Recipient Full Name"
            name="recipientName"
            id="modal-recipient-name"
            value={formData.recipientName}
            onChange={handleChange}
            placeholder="e.g. Shaluka Dulanjana"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Input
              label="Contact Phone"
              type="tel"
              name="phone"
              id="modal-phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              required
            />

            <div>
              <Input
                label="Email Address"
                type="email"
                name="email"
                id="modal-email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patron@raalahami.lk"
                required
                error={emailError}
                helperText={isAuthenticated ? "Verified patron profile" : "Mandatory for receipts"}
              />
            </div>
          </div>

          {/* Mandatory Email Receipt Assurance Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              color: 'var(--accent-gold)'
            }}
          >
            <Mail size={18} style={{ flexShrink: 0, color: 'var(--accent-gold)' }} />
            <span>
              A detailed royal culinary receipt will be dispatched to this email address.
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="modal-address"
              style={{
                display: 'block',
                marginBottom: '0.4rem',
                fontSize: '0.88rem',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}
            >
              Delivery Destination <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <textarea
              id="modal-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Building number, street, residence, city..."
              className="w-full px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-slate-900 dark:text-white outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.92rem',
                fontWeight: '700',
                color: 'var(--text-secondary)'
              }}
            >
              Payment Method
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { id: 'CASH_ON_DELIVERY', label: 'Cash Upon Delivery (COD)' },
                { id: 'CARD', label: 'Credit / Debit Card (Online)' },
                { id: 'DIGITAL_WALLET', label: 'Digital Wallet / FriMi' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                    formData.paymentMethod === m.id
                      ? 'bg-amber-50 dark:bg-emerald-900/60 border-amber-500 dark:border-amber-400 font-bold'
                      : 'bg-slate-50 dark:bg-emerald-950/60 border-slate-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={formData.paymentMethod === m.id}
                    onChange={handleChange}
                    style={{ accentColor: '#D97706', width: '1.1rem', height: '1.1rem' }}
                  />
                  <span className="text-sm font-bold">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Due Pill */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Total Amount Due:</span>
            <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#D97706' }}>
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-xl font-black rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Authorizing Royal Order...' : 'Authorize & Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
