import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import orderService from '../services/orderService';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import OrderSummary from '../components/order/OrderSummary';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

/**
 * Accessible Raalahami OrderTrackingPage
 * Ultra-Luxury Sri Lankan Royal Heritage Design System
 * Tracks live preparation and delivery milestones
 */
export const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || 'RAALAHAMI-782194';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = async (idToFetch) => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrderById(idToFetch);
      setCurrentOrder(data);
    } catch (e) {
      console.error('Failed to load order:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(initialOrderId);
  }, [initialOrderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setSearchParams({ orderId: orderIdInput.trim() });
      fetchOrder(orderIdInput.trim());
    }
  };

  return (
    <div className="order-tracking-page fade-in" style={{ padding: '3.5rem 0 5.5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div
            className="badge badge-gold"
            style={{ marginBottom: '0.75rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} /> LIVE EXPEDITION TRACKER
          </div>
          <h1 style={{ marginBottom: '0.75rem', fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>
            Track Your <span className="text-gradient-gold">Royal Feast</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 auto', maxWidth: '620px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Follow your order in real-time as master chefs at Raalahami prepare your heirloom curries and dispatch our royal couriers across the city.
          </p>
        </div>

        {/* Search Order ID Form */}
        <form
          onSubmit={handleSearch}
          className="glass-panel"
          style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            border: '1px solid rgba(229, 169, 60, 0.25)',
            boxShadow: 'var(--shadow-md)'
          }}
          aria-label="Search order status form"
        >
          <div style={{ flex: '1 1 280px' }}>
            <Input
              label="Enter Order Reference Number"
              placeholder="e.g. RAALAHAMI-782194"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="m-0"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            style={{ fontWeight: '700', padding: '0.75rem 1.5rem' }}
          >
            <Compass size={16} style={{ marginRight: '0.4rem' }} />
            Track Royal Order
          </Button>
        </form>

        {/* Live Order Details & Milestone Tracker */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <div
              style={{
                width: '2.75rem',
                height: '2.75rem',
                border: '3px solid var(--accent-gold)',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.75s linear infinite'
              }}
              aria-hidden="true"
            />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Contacting Raalahami kitchen dispatcher...
            </p>
          </div>
        ) : currentOrder ? (
          <div>
            <OrderStatusTracker
              currentStep={currentOrder.status === 'DELIVERED' ? 4 : 2}
              estimatedMinutes={currentOrder.estimatedMinutes || 20}
            />
            <OrderSummary order={currentOrder} />
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              No royal order found with reference <strong style={{ color: 'var(--accent-gold)' }}>{orderIdInput}</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Please verify your receipt number or contact our concierge at reservations@raalahami.lk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
