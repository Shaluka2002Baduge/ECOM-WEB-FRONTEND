import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, Truck, ShoppingBag, Utensils, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import orderService from '../services/orderService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { formatPrice, formatCurrency } from '../utils/currency';

const HALLS = ['Royal Dining Hall', 'Balcony Court', 'Private Suite'];
const TABLES_PER_HALL = ['Table 1', 'Table 2', 'Table 3', 'Table 4'];

/**
 * Validates whether the given time string (HH:mm) is within Raalahami dining hours (12:30 to 23:30).
 */
const isTimeValid = (timeStr) => {
  if (!timeStr) return false;
  const parts = timeStr.split(':');
  if (parts.length < 2) return false;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return false;
  const mins = h * 60 + m;
  const minMins = 12 * 60 + 30; // 12:30 PM (750 mins)
  const maxMins = 23 * 60 + 30; // 23:30 PM (1410 mins)
  return mins >= minMins && mins <= maxMins;
};

/**
 * Accessible Raalahami CheckoutPage
 * Multi-section order finalization supporting Home Delivery, Takeaway, and Royal Dine-In Table Reservations with live conflict-free availability.
 */
export const CheckoutPage = () => {
  const { items: cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
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
    timeSlot: '19:30',
    partySize: '2 Guests',
    seatingPreference: 'Royal Dining Hall',
    selectedTable: 'Table 1'
  });

  const [bookedTables, setBookedTables] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

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

  // Check if a specific table in a hall is booked
  const isTableBooked = useCallback(
    (hall, table) => {
      return bookedTables.some(
        (bt) =>
          (bt.hall === hall || !bt.hall || bt.hall === 'All') &&
          (bt.table === table || bt.tableName === table || bt.id === table)
      );
    },
    [bookedTables]
  );

  // Check if all 4 tables in a hall are booked
  const isHallFullyBooked = useCallback(
    (hall) => {
      return TABLES_PER_HALL.every((tbl) => isTableBooked(hall, tbl));
    },
    [isTableBooked]
  );

  // Dynamic table availability check from backend
  const checkAvailability = useCallback(async (date, time) => {
    if (!date || !time || !isTimeValid(time)) return;
    setIsCheckingAvailability(true);

    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      let fetchedBooked = [];

      try {
        const resp = await axios
          .get(`${apiBase}/reservations/check-availability`, {
            params: { date, time }
          })
          .catch(async () => {
            return await apiClient.get('/reservations/check-availability', {
              params: { date, time }
            });
          });

        const data = resp?.data?.data || resp?.data;
        if (Array.isArray(data)) {
          fetchedBooked = data;
        } else if (data?.bookedTables && Array.isArray(data.bookedTables)) {
          fetchedBooked = data.bookedTables;
        }
      } catch (err) {
        // Fallback: Query all reservations & active Dine-In orders
        try {
          const resResp = await axios
            .get(`${apiBase}/reservations`)
            .catch(() => apiClient.get('/reservations'));
          const allRes = resResp?.data?.data || resResp?.data || [];
          if (Array.isArray(allRes)) {
            fetchedBooked = allRes
              .filter((r) => (r.date === date || r.diningDate === date) && (r.status === 'CONFIRMED' || r.status === 'SEATED'))
              .map((r) => ({
                hall: r.area || r.seatingPreference || 'Royal Dining Hall',
                table: r.table || r.assignedTable || 'Table 1'
              }));
          }
        } catch (ignore) {
          // Handled
        }
      }

      // Check local session storage for demo checkout dine-in bookings
      if (typeof sessionStorage !== 'undefined') {
        try {
          const sessionOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
          const matchingDineIn = sessionOrders.filter(
            (o) =>
              o.orderType === 'DINE_IN' &&
              o.reservation?.diningDate === date &&
              (o.status !== 'CANCELLED' && o.status !== 'COMPLETED')
          );
          matchingDineIn.forEach((o) => {
            if (o.reservation?.selectedTable || o.table) {
              fetchedBooked.push({
                hall: o.reservation?.seatingPreference || 'Royal Dining Hall',
                table: o.reservation?.selectedTable || o.table || 'Table 1'
              });
            }
          });
        } catch (ignore) {}
      }

      // Normalize booked items
      const normalized = fetchedBooked.map((b) => {
        if (typeof b === 'string') {
          return { hall: 'Royal Dining Hall', table: b };
        }
        return {
          hall: b.hall || b.area || b.seatingPreference || 'Royal Dining Hall',
          table: b.table || b.tableName || b.id || 'Table 1'
        };
      });

      setBookedTables(normalized);
    } catch (err) {
      console.warn('Availability check error:', err);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, []);

  // Poll / Check availability whenever diningDate or timeSlot changes
  useEffect(() => {
    if (orderType === 'DINE_IN' && reservationData.diningDate && reservationData.timeSlot) {
      checkAvailability(reservationData.diningDate, reservationData.timeSlot);
    }
  }, [orderType, reservationData.diningDate, reservationData.timeSlot, checkAvailability]);

  // If the currently selected table becomes booked in the chosen hall, auto-select the next available table
  useEffect(() => {
    const currentHall = reservationData.seatingPreference;
    const currentTable = reservationData.selectedTable;
    if (isTableBooked(currentHall, currentTable)) {
      const firstAvailable = TABLES_PER_HALL.find((tbl) => !isTableBooked(currentHall, tbl));
      if (firstAvailable) {
        setReservationData((prev) => ({ ...prev, selectedTable: firstAvailable }));
      }
    }
  }, [bookedTables, reservationData.seatingPreference, isTableBooked]);

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setReservationData((prev) => ({ ...prev, timeSlot: newTime }));
  };

  const handleHallChange = (e) => {
    const newHall = e.target.value;
    const firstAvailable = TABLES_PER_HALL.find((tbl) => !isTableBooked(newHall, tbl)) || 'Table 1';
    setReservationData((prev) => ({
      ...prev,
      seatingPreference: newHall,
      selectedTable: firstAvailable
    }));
  };

  // 4. DYNAMIC BILL CALCULATION
  const deliveryFee = orderType === 'DELIVERY' ? 450 : 0;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * (Number(item.quantity) || 1),
    0
  );
  const serviceVat = subtotal * 0.1;
  const totalDue = subtotal + serviceVat + deliveryFee;

  const isTimeSlotValid = useMemo(() => {
    return isTimeValid(reservationData.timeSlot);
  }, [reservationData.timeSlot]);

  const isCurrentTableBooked = useMemo(() => {
    return isTableBooked(reservationData.seatingPreference, reservationData.selectedTable);
  }, [isTableBooked, reservationData.seatingPreference, reservationData.selectedTable]);

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

    // 4. Validate Dine-In specifics
    if (orderType === 'DINE_IN') {
      if (!isTimeSlotValid) {
        setError('Raalahami dining hours are from 12:30 PM to 11:30 PM.');
        return;
      }
      if (isCurrentTableBooked) {
        setError('This table was just reserved. Please pick another available table.');
        return;
      }
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
        finalPaymentMethod = 'Counter Settlement';
      }
    } else if (selectedPaymentMethod === 'CARD') {
      finalPaymentMethod = 'Credit / Debit Card (Online)';
    } else if (selectedPaymentMethod === 'WALLET' || selectedPaymentMethod === 'DIGITAL_WALLET') {
      finalPaymentMethod = 'Digital Wallet';
    }

    const finalPhone = (contactPhone || '').trim();

    // 5. ORDER SUBMISSION PAYLOAD
    const payload = {
      customer_name: finalRecipientName,
      customerName: finalRecipientName,
      recipientName: finalRecipientName,
      fullName: finalRecipientName,
      name: finalRecipientName,
      customerEmail: finalEmail,
      email: finalEmail,
      phone: finalPhone,
      contactPhone: finalPhone,
      customerPhone: finalPhone,
      orderType: orderType,
      fulfillment_type: orderType === 'DINE_IN' ? 'Dine-In' : orderType === 'DELIVERY' ? 'Delivery' : 'Takeaway',
      fulfillmentType: orderType === 'DINE_IN' ? 'Dine-In' : orderType === 'DELIVERY' ? 'Delivery' : 'Takeaway',
      deliveryFee: deliveryFee,
      deliveryStreetAddress:
        orderType === 'DELIVERY'
          ? deliveryStreetAddress
          : orderType === 'DINE_IN'
          ? `Raalahami Royal Dining Court (${reservationData.seatingPreference} - ${reservationData.selectedTable})`
          : 'Raalahami Pickup Counter',
      deliveryAddress:
        orderType === 'DELIVERY'
          ? deliveryStreetAddress
          : orderType === 'DINE_IN'
          ? `Raalahami Royal Dining Court (${reservationData.seatingPreference} - ${reservationData.selectedTable})`
          : 'Raalahami Pickup Counter',
      deliveryInstructions: orderType === 'DELIVERY' ? deliveryInstructions : '',
      table: reservationData.selectedTable,
      assignedTable: reservationData.selectedTable,
      table_number: reservationData.selectedTable,
      tableNumber: reservationData.selectedTable,
      dining_date: reservationData.diningDate,
      diningDate: reservationData.diningDate,
      time_slot: reservationData.timeSlot,
      timeSlot: reservationData.timeSlot,
      seating_preference: reservationData.seatingPreference,
      seatingPreference: reservationData.seatingPreference,
      party_size: reservationData.partySize,
      partySize: reservationData.partySize,
      notes:
        orderType === 'DELIVERY'
          ? deliveryInstructions
          : orderType === 'DINE_IN'
          ? `Dine-In Table Reservation: ${reservationData.diningDate} at ${reservationData.timeSlot}, ${reservationData.partySize}, ${reservationData.seatingPreference} (${reservationData.selectedTable})`
          : 'Pickup at Raalahami Heritage Counter',
      reservation:
        orderType === 'DINE_IN'
          ? {
              ...reservationData,
              patron_name: finalRecipientName,
              customer_name: finalRecipientName,
              name: finalRecipientName,
              phone: finalPhone,
              email: finalEmail,
              table: reservationData.selectedTable,
              assignedTable: reservationData.selectedTable,
              table_number: reservationData.selectedTable,
              tableNumber: reservationData.selectedTable,
              dining_date: reservationData.diningDate,
              diningDate: reservationData.diningDate,
              time_slot: reservationData.timeSlot,
              timeSlot: reservationData.timeSlot,
              seating_preference: reservationData.seatingPreference,
              party_size: reservationData.partySize
            }
          : null,
      paymentMethod: finalPaymentMethod,
      subtotal: subtotal,
      serviceVat: serviceVat,
      totalAmount: totalDue,
      totalDue: totalDue,
      totalPrice: totalDue,
      items: items
    };

    try {
      const result = await orderService.createOrder(payload);

      // Save to local session storage for instant background sync across tabs
      if (typeof sessionStorage !== 'undefined' && orderType === 'DINE_IN') {
        try {
          const currentOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
          currentOrders.push(payload);
          sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(currentOrders));
        } catch (ignore) {}
      }

      clearCart();

      const placedOrder = result?.data?.data || result?.data?.order || result?.data || result?.order || result || {};
      const rawRef =
        placedOrder.order_number ||
        placedOrder.orderNumber ||
        placedOrder.order_id ||
        placedOrder.id ||
        result?.data?.order_number ||
        result?.data?.orderNumber ||
        result?.data?.id ||
        result?.order_number ||
        result?.orderNumber ||
        result?.id ||
        '';

      const cleanRef = String(rawRef).replace('#', '').trim();

      if (typeof localStorage !== 'undefined' && cleanRef) {
        localStorage.setItem('last_placed_order_id', cleanRef);
        localStorage.setItem('patron_email', finalEmail);
      }

      // Determine fulfillment type
      const rawFulfillmentType =
        placedOrder.fulfillment_type ||
        placedOrder.fulfillmentType ||
        payload.fulfillment_type ||
        payload.orderType ||
        orderType;

      const normType = String(rawFulfillmentType).toLowerCase().replace(/[-_ ]/g, '');
      const targetTrackingPath = cleanRef ? `/tracking/${cleanRef}` : '/tracking';

      if (normType.includes('dinein') || normType.includes('dine')) {
        toast.success('Table & Feast Confirmed! Track your preparation in real-time.');
        navigate(targetTrackingPath);
      } else if (normType.includes('takeaway') || normType.includes('pickup')) {
        toast.success('Takeaway order placed! We are preparing your feast.');
        navigate(targetTrackingPath);
      } else {
        // Home Delivery (default)
        toast.success('Order placed successfully! Tracking your feast.');
        navigate(targetTrackingPath);
      }
    } catch (err) {
      if (
        err.response?.status === 409 ||
        err.status === 409 ||
        (err.message && err.message.includes('409')) ||
        (err.message && err.message.toLowerCase().includes('conflict')) ||
        (err.message && err.message.toLowerCase().includes('already reserved'))
      ) {
        setError('This table was just reserved. Please pick another available table.');
        checkAvailability(reservationData.diningDate, reservationData.timeSlot);
      } else {
        setError(err.message || 'Failed to submit order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDineInInvalid =
    orderType === 'DINE_IN' &&
    (!reservationData.diningDate ||
      !reservationData.timeSlot ||
      !isTimeSlotValid ||
      !reservationData.selectedTable ||
      isCurrentTableBooked ||
      isCheckingAvailability);

  const isPlaceOrderDisabled = isSubmitting || isDineInInvalid;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">
            🥘
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Your Cart is Empty</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            You haven't added any royal dishes to your order yet.
          </p>
          <Link to="/menu">
            <Button variant="primary" size="lg">
              Explore Royal Menu
            </Button>
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
          <Alert type="error" title="Checkout Notice" message={error} onDismiss={() => setError(null)} />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2.5rem',
            alignItems: 'flex-start'
          }}
        >
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
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: isSelected ? 'var(--accent-amber)' : 'var(--text-muted)'
                        }}
                      >
                        {tab.feeText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. RECIPIENT & CONTACT DETAILS */}
            <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}
            >
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
                  helperText={
                    isAuthenticated
                      ? 'Pre-filled from verified patron profile'
                      : 'Live receipt email verification enabled'
                  }
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
                An official royal culinary receipt will be dispatched to{' '}
                <strong>{patronEmail || 'your email'}</strong> upon placement.
              </span>
            </div>

            {/* 3. CONDITIONAL FIELDS ACCORDING TO ORDER TYPE */}

            {/* A. DELIVERY FIELDS */}
            {orderType === 'DELIVERY' && (
              <div className="fade-in">
                <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
                  2. Palace Delivery Destination
                </h2>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    htmlFor="checkout-address"
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}
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
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}
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
                  <p
                    style={{
                      margin: '0.35rem 0 0 0',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5'
                    }}
                  >
                    24 Galle Face Court, Colombo 03 • Ready for collection in ~20-30 minutes. Complimentary takeaway
                    packing with zero delivery surcharge.
                  </p>
                </div>
              </div>
            )}

            {/* C. DINE-IN TABLE RESERVATION CARD WITH DYNAMIC TIME & CONFLICT-FREE TABLES */}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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

                  {isCheckingAvailability && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <RefreshCw size={12} className="spin-animation" /> Checking live tables...
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.15rem'
                  }}
                >
                  {/* Dining Date */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Dining Date <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={reservationData.diningDate}
                      onChange={(e) =>
                        setReservationData({ ...reservationData, diningDate: e.target.value })
                      }
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

                  {/* Dynamic Time Slot Input */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Time Slot <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <input
                      type="time"
                      min="12:30"
                      max="23:30"
                      value={reservationData.timeSlot || ''}
                      onChange={handleTimeChange}
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-lg p-2.5 text-white"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: !isTimeSlotValid
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  {/* Seating Hall Selector */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Seating Hall <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <select
                      value={reservationData.seatingPreference}
                      onChange={handleHallChange}
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
                      {HALLS.map((hall) => {
                        const fullyBooked = isHallFullyBooked(hall);
                        return (
                          <option key={hall} value={hall} disabled={fullyBooked}>
                            {hall} {fullyBooked ? '(Fully Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Specific Table Selector (4 tables per hall) */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Specific Table <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <select
                      value={reservationData.selectedTable || ''}
                      onChange={(e) =>
                        setReservationData({ ...reservationData, selectedTable: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        fontSize: '0.92rem',
                        color: isCurrentTableBooked ? 'var(--accent-danger)' : 'var(--text-primary)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: isCurrentTableBooked
                          ? '1px solid var(--accent-danger)'
                          : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    >
                      {TABLES_PER_HALL.map((tbl) => {
                        const booked = isTableBooked(reservationData.seatingPreference, tbl);
                        return (
                          <option key={tbl} value={tbl} disabled={booked}>
                            {tbl} {booked ? '- Unavailable (Booked)' : '(Available)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Party Size <span style={{ color: 'var(--accent-amber)' }}>*</span>
                    </label>
                    <select
                      value={reservationData.partySize}
                      onChange={(e) =>
                        setReservationData({ ...reservationData, partySize: e.target.value })
                      }
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
                </div>

                {/* Dining Hours Warning Banner */}
                {!isTimeSlotValid && reservationData.timeSlot && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>Raalahami dining hours are from 12:30 PM to 11:30 PM.</span>
                  </div>
                )}

                {/* Table Booked Warning Banner */}
                {isCurrentTableBooked && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>
                      {reservationData.selectedTable} in {reservationData.seatingPreference} is already booked for this time. Please pick another available table.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT METHOD SELECTION */}
            <h2 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              {orderType === 'DELIVERY' ? '3. Payment Selection' : '2. Payment Selection'}
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '2rem'
              }}
            >
              {[
                {
                  id: 'CASH_ON_DELIVERY',
                  label: orderType === 'DELIVERY' ? 'Cash on Delivery (COD)' : 'Counter Settlement',
                  desc:
                    orderType === 'DELIVERY'
                      ? 'Pay with cash or mobile card machine upon arrival at your doorstep'
                      : 'Settle in cash or card with the cashier / steward at the Raalahami counter'
                },
                {
                  id: 'CARD',
                  label: 'Credit / Debit Card (Online)',
                  desc: 'Encrypted VISA, MasterCard, or Amex transaction'
                },
                {
                  id: 'DIGITAL_WALLET',
                  label: 'Digital Wallet',
                  desc: 'Apple Pay, Google Pay, or QR Payment'
                }
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
                        style={{
                          fontWeight: '600',
                          color: isChecked ? 'var(--accent-gold)' : 'var(--text-primary)',
                          display: 'block'
                        }}
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
              disabled={isPlaceOrderDisabled}
              isLoading={isSubmitting}
              style={{ width: '100%', opacity: isPlaceOrderDisabled ? 0.6 : 1 }}
              ariaLabel={`Authorize and place order for total ${formatPrice(totalDue)}`}
            >
              {isPlaceOrderDisabled && orderType === 'DINE_IN' && isCurrentTableBooked
                ? 'Select Available Table to Order'
                : `Authorize & Place Royal Order (${formatPrice(totalDue)})`}
            </Button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem'
              }}
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
                <strong style={{ color: 'var(--accent-gold)' }}>
                  {recipientName.trim() || 'Guest Patron'}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Fulfillment:</span>
                <strong style={{ color: 'var(--accent-amber)' }}>
                  {orderType === 'DELIVERY'
                    ? '🚚 Delivery'
                    : orderType === 'TAKEAWAY'
                    ? '🥡 Takeaway'
                    : `🍽️ Dine-In (${reservationData.selectedTable || 'Table'})`}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                marginBottom: '1.5rem',
                maxHeight: '320px',
                overflowY: 'auto'
              }}
            >
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.specialInstructions && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic'
                        }}
                      >
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
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Service VAT (10%)</span>
                <span>{formatPrice(serviceVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>
                  Fulfillment ({orderType === 'DELIVERY' ? 'Palace Delivery' : orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'})
                </span>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: '700',
                  fontSize: '1.25rem',
                  color: 'var(--accent-gold)'
                }}
              >
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
