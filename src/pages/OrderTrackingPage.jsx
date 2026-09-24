import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import orderService from '../services/orderService';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import OrderSummary from '../components/order/OrderSummary';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

/**
 * Accessible OrderTrackingPage
 * Tracks live preparation and delivery milestones
 */
export const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || 'RALAHAMI-782194';

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
    <div className="order-tracking-page fade-in" style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Live Status
          </span>
          <h1 style={{ marginBottom: '0.75rem' }}>Track Your Royal Feast</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0 auto', maxWidth: '600px' }}>
            Follow your order in real-time as our master chefs prepare your heirloom curries and dispatch our royal couriers.
          </p>
        </div>

        {/* Search Order ID Form */}
        <form
          onSubmit={handleSearch}
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}
          aria-label="Search order status form"
        >
          <div style={{ flex: '1 1 280px' }}>
            <Input
              label="Enter Order Reference Number"
              placeholder="e.g. RALAHAMI-782194"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="m-0"
              required
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            Track Order
          </Button>
        </form>

        {/* Live Order Details & Milestone Tracker */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                border: '3px solid var(--accent-gold)',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.75s linear infinite'
              }}
              aria-hidden="true"
            />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Contacting royal kitchen dispatcher...
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
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No order found with reference <strong>{orderIdInput}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
