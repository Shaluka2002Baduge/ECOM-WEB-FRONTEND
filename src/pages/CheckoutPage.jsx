import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, Truck, ShoppingBag, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { formatPrice, formatCurrency } from '../utils/currency';

/**
 * Accessible Raalahami CheckoutPage
 * Multi-section order finalization supporting Home Delivery, Takeaway, and Royal Dine-In Table Reservations
 */
export const CheckoutPage = () => {
  const { items: cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  // 1. RECIPIENT NAME & CONTACT BINDINGS
  const [recipientName, setRecipientName] = useState(() => user?.name || '');
  const [contactPhone, setContactPhone] = useState('');
  const [patronEmail, setPatronEmail] = useState(() => (user?.email || '').trim().toLowerCase());

  // 2. ORDER TYPE SELECTION (DELIVERY / TAKEAWAY / DINE_IN)
  const [orderType, setOrderType] = useState('DELIVERY');

  // Delivery specific fields
  const [deliveryStreetAddress, setDeliveryStreetAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Dine-In specific reservation fields
  const [reservationData, setReservationData] = useState({
    diningDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '19:30 PM',
    partySize: '2 Guests',
    seatingPreference: 'Royal Dining Hall'
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH_ON_DELIVERY');

  const [nameError, setNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auto pre-fill user credentials when authenticated (only if fields are currently empty)
  useEffect(() => {
    if (user?.email && !patronEmail) {
      setPatronEmail(user.email.trim().toLowerCase());
    }
    if (user?.name && !recipientName) {
      setRecipientName(user.name);
    }
  }, [user]);

  // 4. DYNAMIC BILL CALCULATION
  const deliveryFee = orderType === 'DELIVERY' ? 450 : 0;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * (Number(item.quantity) || 1),
    0
  );
  const serviceVat = subtotal * 0.10;
  const totalDue = subtotal + serviceVat + deliveryFee;

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val || !val.trim()) {
      return 'Email address is required for dispatching your royal culinary receipt.';
    }
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address (e.g. patron@raalahami.lk).';
    }
    return null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Prevent duplicate clicks
    if (isSubmitting) return;

    if (cartItems.length === 0) {
      setError('Your royal order is empty. Please select dishes from the menu first.');
      return;
    }

    // 1. Validate Recipient Name explicitly
    const finalRecipientName = recipientName.trim();
    if (!finalRecipientName || finalRecipientName.length === 0) {
      setNameError('Recipient Name is required to personalize your royal feast.');
      setError('Recipient Name is required to personalize your royal feast.');
      return;
    }
    setNameError(null);

    // 2. Validate Email
    const finalEmail = (patronEmail || user?.email || '').trim().toLowerCase();
    const emailErr = validateEmail(finalEmail);
    if (emailErr) {
      setEmailError(emailErr);
      setError(emailErr);
      return;
    }
    setEmailError(null);

    // 3. Validate Delivery Address if Delivery selected
    if (orderType === 'DELIVERY' && !deliveryStreetAddress.trim()) {
      setError('Delivery Street Address is mandatory for Home Delivery.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const items = cartItems.map((item) => {
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

    // Compute final payment method string according to orderType and selection
    let finalPaymentMethod = selectedPaymentMethod;
    if (
      selectedPaymentMethod === 'CASH' ||
      selectedPaymentMethod === 'COD' ||
      selectedPaymentMethod === 'COUNTER' ||
      selectedPaymentMethod === 'CASH_ON_DELIVERY'
    ) {
      if (orderType === 'DELIVERY') {
        finalPaymentMethod = 'Cash on Delivery (COD)';
      } else {
        // Both DINE_IN and TAKEAWAY
        finalPaymentMethod = 'Counter Settlement';
      }
    } else if (selectedPaymentMethod === 'CARD') {
      finalPaymentMethod = 'Credit / Debit Card (Online)';
    } else if (selectedPaymentMethod === 'WALLET' || selectedPaymentMethod === 'DIGITAL_WALLET') {
      finalPaymentMethod = 'Digital Wallet';
    }

    // 5. ORDER SUBMISSION PAYLOAD
    const payload = {
      recipientName: finalRecipientName, // DO NOT override with user.name
      customerName: finalRecipientName,
      customerEmail: finalEmail,
      email: finalEmail,
      phone: contactPhone,
      orderType: orderType,
      deliveryFee: deliveryFee,
      deliveryStreetAddress:
        orderType === 'DELIVERY'
          ? deliveryStreetAddress
          : orderType === 'DINE_IN'
          ? 'Raalahami Royal Dining Court'
          : 'Raalahami Pickup Counter',
      deliveryAddress:
        orderType === 'DELIVERY'
          ? deliveryStreetAddress
          : orderType === 'DINE_IN'
          ? 'Raalahami Royal Dining Court'
          : 'Raalahami Pickup Counter',
      deliveryInstructions: orderType === 'DELIVERY' ? deliveryInstructions : '',
      notes:
        orderType === 'DELIVERY'
          ? deliveryInstructions
          : orderType === 'DINE_IN'
          ? `Dine-In Table Reservation: ${reservationData.diningDate} at ${reservationData.timeSlot}, ${reservationData.partySize}, ${reservationData.seatingPreference}`
          : 'Pickup at Raalahami Heritage Counter',
      reservation: orderType === 'DINE_IN' ? reservationData : null,
      paymentMethod: finalPaymentMethod,
      subtotal: subtotal,
      serviceVat: serviceVat,
      totalAmount: totalDue,
      totalDue: totalDue,
      totalPrice: totalDue,
      items: items
    };

    console.log('🚀 [CHECKOUT SUBMITTING WITH RECIPIENT NAME]:', finalRecipientName);
    console.log('🚀 [ORDER SUBMISSION PAYLOAD]:', payload);

    try {
      const result = await orderService.createOrder(payload);
      clearCart();
      const placedOrderId =
        result?.id || result?.orderId || result?.data?.id || result?.data?.orderId;
      navigate(`/orders/track?orderId=${placedOrderId || 'SUCCESS'}`);
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
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
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            ✦ Finalize Your Feast
          </span>
          <h1 style={{ marginBottom: '0.5rem' }}>
            <span className="text-gradient-gold">Royal Order Checkout</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Select fulfillment, verify patron coordinates, and authorize your royal feast.
          </p>
        </div>

        {error && (
          <Alert type="error" title="Checkout Error" message={error} onDismiss={() => setError(null)} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Checkout Form Container */}
          <form
            onSubmit={handlePlaceOrder}
            className="glass-panel"
            style={{ padding: '2rem' }}
            aria-label="Delivery and payment checkout form"
          >
            {/* 2. ORDER TYPE SELECTION TABS */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: 'var(--text-secondary)'
                }}
              >
                Fulfillment Method <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {[
                  { id: 'DELIVERY', icon: '🚚', label: 'Home Delivery', feeText: 'Rs. 450' },
                  { id: 'TAKEAWAY', icon: '🥡', label: 'Takeaway', feeText: 'Free Pickup' },
                  { id: 'DINE_IN', icon: '🍽️', label: 'Royal Dine-In', feeText: 'Table Booking' }
                ].map((tab) => {
                  const isSelected = orderType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOrderType(tab.id)}
                      style={{
                        padding: '0.85rem 0.65rem',
                        backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-secondary)',
                        border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.25rem' }}>
                        {tab.icon}
                      </span>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem', display: 'block' }}>
                        {tab.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                        {tab.feeText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. RECIPIENT & CONTACT DETAILS */}
            <h2
              style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}
            >
              1. Patron & Contact Coordinates
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="Recipient Name"
                name="recipientName"
                id="checkout-recipient-name"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Shaluka Dulanjana"
                required
                error={nameError}
                helperText="Enter the name of the patron receiving or attending this royal feast"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <Input
                label="Contact Phone"
                type="tel"
                name="phone"
                id="checkout-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                required
              />

              <div>
                <Input
                  label="Patron Email Address"
                  type="email"
                  name="patronEmail"
                  id="checkout-email"
                  value={patronEmail}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPatronEmail(val);
                    setEmailError(validateEmail(val));
                  }}
                  placeholder="patron@raalahami.lk"
                  required
                  error={emailError}
                  helperText={isAuthenticated ? "Pre-filled from verified patron profile" : "Live receipt email verification enabled"}
                />
              </div>
            </div>

            {/* Royal Receipt Email Assurance Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                marginBottom: '1.75rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Mail size={18} style={{ flexShrink: 0, color: 'var(--accent-gold)' }} />
              <span>
                An official royal culinary receipt will be dispatched to <strong>{patronEmail || 'your email'}</strong> upon placement.
              </span>
            </div>

            {/* 3. CONDITIONAL FIELDS ACCORDING TO ORDER TYPE */}

            {/* A. DELIVERY FIELDS */}
            {orderType === 'DELIVERY' && (
              <div className="fade-in">
                <h2
                  style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}
                >
                  2. Palace Delivery Destination
                </h2>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    htmlFor="checkout-address"
                    style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}
                  >
                    Delivery Street Address <span style={{ color: 'var(--accent-amber)' }}>*</span>
                  </label>
                  <textarea
                    id="checkout-address"
                    name="deliveryStreetAddress"
                    value={deliveryStreetAddress}
                    onChange={(e) => setDeliveryStreetAddress(e.target.value)}
                    rows={2}
                    required
                    placeholder="Building number, street name, apartment or suite, city..."
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
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
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
              </div>
            )}

            {/* B. TAKEAWAY CARD */}
            {orderType === 'TAKEAWAY' && (
              <div
                className="fade-in"
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🥡</div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.1rem', fontWeight: '800' }}>
                    Pickup at Raalahami Heritage Counter
                  </h3>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    24 Galle Face Court, Colombo 03 • Ready for collection in ~20-30 minutes. Complimentary takeaway packing with zero delivery surcharge.
                  </p>
                </div>
              </div>
            )}

            {/* C. DINE-IN TABLE RESERVATION CARD */}
            {orderType === 'DINE_IN' && (
              <div
                className="fade-in"
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  backgroundColor: 'rgba(23, 30, 48, 0.65)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🍽️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-gold)' }}>
                      Royal Table Reservation Coordinates
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Your feast will be simmered and served fresh at your reserved table.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.15rem' }}>
                  {/* Dining Date */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Dining Date <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={reservationData.diningDate}
                      onChange={(e) => setReservationData({ ...reservationData, diningDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Time Slot <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <select
                      value={reservationData.timeSlot}
                      onChange={(e) => setReservationData({ ...reservationData, timeSlot: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    >
                      <option value="12:30 PM">12:30 PM (Lunch Service)</option>
                      <option value="13:30 PM">13:30 PM (Lunch Service)</option>
                      <option value="19:30 PM">19:30 PM (Royal Dinner)</option>
                      <option value="20:30 PM">20:30 PM (Royal Dinner)</option>
                    </select>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Party Size <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <select
                      value={reservationData.partySize}
                      onChange={(e) => setReservationData({ ...reservationData, partySize: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    >
                      <option value="1 Guest">1 Guest</option>
                      <option value="2 Guests">2 Guests</option>
                      <option value="4 Guests">4 Guests</option>
                      <option value="6+ Guests">6+ Guests (Court Feast)</option>
                    </select>
                  </div>

                  {/* Seating Preference */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Seating Preference
                    </label>
                    <select
                      value={reservationData.seatingPreference}
                      onChange={(e) => setReservationData({ ...reservationData, seatingPreference: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    >
                      <option value="Royal Dining Hall">Royal Dining Hall</option>
                      <option value="Balcony Court">Balcony Court</option>
                      <option value="Private Suite">Private Suite</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD SELECTION */}
            <h2
              style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}
            >
              {orderType === 'DELIVERY' ? '3. Payment Selection' : '2. Payment Selection'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                {
                  id: 'CASH_ON_DELIVERY',
                  label: orderType === 'DELIVERY' ? 'Cash on Delivery (COD)' : 'Counter Settlement',
                  desc:
                    orderType === 'DELIVERY'
                      ? 'Pay with cash or mobile card machine upon arrival at your doorstep'
                      : 'Settle in cash or card with the cashier / steward at the Raalahami counter'
                },
                { id: 'CARD', label: 'Credit / Debit Card (Online)', desc: 'Encrypted VISA, MasterCard, or Amex transaction' },
                { id: 'DIGITAL_WALLET', label: 'Digital Wallet', desc: 'Apple Pay, Google Pay, or QR Payment' }
              ].map((method) => {
                const isChecked = selectedPaymentMethod === method.id;
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
                      onChange={() => setSelectedPaymentMethod(method.id)}
                      style={{ marginTop: '0.25rem', accentColor: 'var(--accent-gold)' }}
                    />
                    <div>
                      <span
                        style={{ fontWeight: '600', color: isChecked ? 'var(--accent-gold)' : 'var(--text-primary)', display: 'block' }}
                      >
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
              ariaLabel={`Authorize and place order for total ${formatPrice(totalDue)}`}
            >
              Authorize & Place Royal Order ({formatPrice(totalDue)})
            </Button>
          </form>

          {/* Order Summary Sidebar */}
          <div
            className="glass-panel"
            style={{ padding: '2rem' }}
          >
            <h2
              style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}
            >
              Feast Summary ({cartItems.length} dishes)
            </h2>

            {/* Recipient & Order Type Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.825rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Patron:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{recipientName.trim() || 'Guest Patron'}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Fulfillment:</span>
                <strong style={{ color: 'var(--accent-amber)' }}>
                  {orderType === 'DELIVERY' ? '🚚 Delivery' : orderType === 'TAKEAWAY' ? '🥡 Takeaway' : '🍽️ Dine-In'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
              {cartItems.map((item, idx) => (
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
                    {formatPrice(Number(item.price) * (Number(item.quantity) || 1))}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Service VAT (10%)</span>
                <span>{formatPrice(serviceVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Fulfillment ({orderType === 'DELIVERY' ? 'Palace Delivery' : orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'})</span>
                <span>
                  {orderType === 'DELIVERY' ? (
                    deliveryFee === 0 ? (
                      <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong>
                    ) : (
                      formatPrice(deliveryFee)
                    )
                  ) : (
                    <strong style={{ color: 'var(--accent-emerald)' }}>COMPLIMENTARY</strong>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', fontWeight: '700', fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                <span>Total Due</span>
                <span>{formatPrice(totalDue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
