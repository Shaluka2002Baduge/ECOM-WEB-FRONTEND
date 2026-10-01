import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Utensils,
  ArrowLeft,
  RefreshCw,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Calendar,
  ArrowRight,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import OrderSummary from '../components/order/OrderSummary';
import Button from '../components/common/Button';
import RoyalPagination from '../components/common/RoyalPagination';
import apiClient from '../api/apiClient';
import { formatCurrency } from '../utils/currency';
import { isValidOrderReference, sanitizeInput } from '../utils/validators';

const ORDERS_PER_PAGE = 6;

/**
 * Accessible Raalahami OrderTrackingPage
 * Ultra-Luxury Sri Lankan Royal Heritage Design System
 * Tracks live preparation and delivery milestones with dynamic Takeaway vs Delivery steppers
 * and User Feast History (Active, Completed & Cancelled).
 */
export const OrderTrackingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ephemeral In-Memory State Only: Resets naturally on browser reload (F5)
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchedId, setSearchedId] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState('');

  // User Feast History State & Pagination (Authenticated Only)
  const [orderHistory, setOrderHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState('active'); // 'active' | 'completed' | 'cancelled'
  const [historyPage, setHistoryPage] = useState(1);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Clean URL query params on mount so reloads never retain or auto-trigger searches
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search || window.location.hash)) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Flush tracking state immediately on user logout
  useEffect(() => {
    if (!user) {
      setCurrentOrder(null);
      setOrderIdInput('');
      setSearchedId('');
      setHasSearched(false);
      setValidationError('');
      setOrderHistory([]);
    }
  }, [user]);

  // Reset page to 1 when switching history tabs
  useEffect(() => {
    setHistoryPage(1);
  }, [historyTab]);

  // Extract user email ONLY if user is authenticated
  const userEmail = useMemo(() => {
    if (!isAuthenticated || !user) return null;
    return user.email || user.customerEmail || null;
  }, [isAuthenticated, user]);

  // Fetch Order History for Authenticated User
  const fetchOrderHistory = useCallback(async (email) => {
    if (!email || !isAuthenticated) {
      setOrderHistory([]);
      return;
    }
    setIsHistoryLoading(true);
    try {
      let historyList = [];
      try {
        const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
        const res = await apiClient.get(`/orders/history/${cleanEmail}?t=${Date.now()}`);
        if (res.data) {
          historyList = Array.isArray(res.data)
            ? res.data
            : res.data.orders || res.data.data || [];
        }
      } catch (apiErr) {
        if (typeof sessionStorage !== 'undefined' && email) {
          const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
          const matched = savedOrders.filter(
            (o) =>
              (o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase()) ||
              (o.email && o.email.toLowerCase() === email.toLowerCase()) ||
              (o.customer_email && o.customer_email.toLowerCase() === email.toLowerCase())
          );
          historyList = matched;
        }
      }

      setOrderHistory(historyList);
    } catch (err) {
      console.warn('[HISTORY FETCH ERROR]', err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [isAuthenticated]);

  // 3 Sub-categories for Feast History
  const activeFeasts = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return orderHistory.filter((o) => {
      const st = (o.status || '').toUpperCase().trim();
      return !['COMPLETED', 'DELIVERED', 'SERVED', 'CANCELLED', 'REJECTED'].includes(st);
    });
  }, [orderHistory, isAuthenticated, user]);

  const completedFeasts = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return orderHistory.filter((o) => {
      const st = (o.status || '').toUpperCase().trim();
      return ['COMPLETED', 'DELIVERED', 'SERVED'].includes(st);
    });
  }, [orderHistory, isAuthenticated, user]);

  const cancelledFeasts = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return orderHistory.filter((o) => {
      const st = (o.status || '').toUpperCase().trim();
      return ['CANCELLED', 'REJECTED'].includes(st);
    });
  }, [orderHistory, isAuthenticated, user]);

  // Unified list for currently selected history tab
  const currentDisplayHistory = useMemo(() => {
    if (historyTab === 'completed') return completedFeasts;
    if (historyTab === 'cancelled') return cancelledFeasts;
    return activeFeasts;
  }, [historyTab, activeFeasts, completedFeasts, cancelledFeasts]);

  // Paginated Feast History
  const totalHistoryPages = Math.ceil(currentDisplayHistory.length / ORDERS_PER_PAGE) || 1;
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * ORDERS_PER_PAGE;
    return currentDisplayHistory.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [currentDisplayHistory, historyPage]);

  // Explicit On-Demand Tracking Execution (Only triggered on user action)
  const executeTrackOrder = useCallback(async (targetRef) => {
    const sanitized = sanitizeInput(targetRef || '');
    const cleanId = sanitized.replace('#', '').trim();

    if (!cleanId || !isValidOrderReference(cleanId)) {
      setValidationError('Please enter a valid Order Reference Number (e.g. RAALAHAMI-782194).');
      setCurrentOrder(null);
      setHasSearched(false);
      return;
    }

    setValidationError('');
    setIsLoading(true);
    setSearchedId(cleanId);
    setHasSearched(true);

    try {
      let fetchedOrder = null;
      try {
        const res = await apiClient.get(`/orders/track/${cleanId}?t=${Date.now()}`);
        if (res.data) {
          fetchedOrder = res.data.order || res.data.data || res.data;
        }
      } catch (apiErr) {
        fetchedOrder = await orderService.getOrderById(cleanId);
      }

      if (fetchedOrder && (fetchedOrder.id || fetchedOrder.order_number || fetchedOrder.orderNumber)) {
        setCurrentOrder(fetchedOrder);
      } else {
        setCurrentOrder(null);
      }
    } catch (err) {
      console.warn('[TRACKING FETCH ERROR]', err.message);
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    executeTrackOrder(orderIdInput);
  };

  // In-session Live Polling: ONLY active when an order is currently loaded in state
  useEffect(() => {
    if (!currentOrder) return;
    const cleanId = (currentOrder.order_number || currentOrder.id || searchedId || '').toString().replace('#', '').trim();
    if (!cleanId) return;

    const pollInterval = setInterval(async () => {
      try {
        let updated = null;
        try {
          const res = await apiClient.get(`/orders/track/${cleanId}?t=${Date.now()}`);
          if (res.data) updated = res.data.order || res.data.data || res.data;
        } catch {
          updated = await orderService.getOrderById(cleanId);
        }
        if (updated && (updated.id || updated.order_number)) {
          setCurrentOrder(updated);
        }
      } catch (ignore) {}
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [currentOrder?.id, currentOrder?.order_number, searchedId]);

  // Initial order history fetch on email availability for authenticated users
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      fetchOrderHistory(userEmail);
    }
  }, [userEmail, fetchOrderHistory, isAuthenticated]);

  // Auto-switch history tab to completed if no active feasts and completed feasts exist
  useEffect(() => {
    if (isAuthenticated && activeFeasts.length === 0 && completedFeasts.length > 0 && historyTab === 'active') {
      const isCurrCompleted = currentOrder && ['COMPLETED', 'DELIVERED', 'SERVED'].includes((currentOrder.status || '').toUpperCase());
      if (!currentOrder || isCurrCompleted) {
        setHistoryTab('completed');
      }
    }
  }, [activeFeasts.length, completedFeasts.length, currentOrder, historyTab, isAuthenticated]);

  const getFulfillmentMeta = (order) => {
    const raw = (order.fulfillment_type || order.fulfillmentMethod || order.orderType || 'DELIVERY').toUpperCase();
    if (raw.includes('DINE')) {
      return { label: 'Royal Dine-In', icon: UtensilsCrossed, color: 'var(--accent-gold)' };
    }
    if (raw.includes('TAKEAWAY') || raw.includes('PICKUP')) {
      return { label: 'Takeaway Pickup', icon: ShoppingBag, color: '#E5A93C' };
    }
    return { label: 'Home Delivery', icon: Truck, color: '#60A5FA' };
  };

  const getStatusBadgeStyle = (status) => {
    const norm = (status || '').toUpperCase().trim();
    if (['COMPLETED', 'DELIVERED', 'SERVED'].includes(norm)) {
      return {
        bg: 'rgba(16, 185, 129, 0.18)',
        color: '#10B981',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        icon: CheckCircle2
      };
    }
    if (['CANCELLED', 'REJECTED'].includes(norm)) {
      return {
        bg: 'rgba(239, 68, 68, 0.18)',
        color: '#EF4444',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        icon: XCircle
      };
    }
    return {
      bg: 'rgba(229, 169, 60, 0.18)',
      color: 'var(--accent-gold, #E5A93C)',
      border: '1px solid rgba(229, 169, 60, 0.45)',
      icon: Clock
    };
  };

  return (
    <div
      className="order-tracking-page fade-in"
      style={{
        padding: '3.5rem 0 5.5rem 0',
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Dribbble Style Food Delivery Background Layer */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src="/images/food-delivery-bg.jpg"
          alt="Food Delivery Scooter Background"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.42,
            filter: 'brightness(90%) contrast(110%) saturate(115%)',
            transition: 'opacity 0.4s ease'
          }}
        />

        {/* Ambient Dark/Light Glassmorphism Scrim for high contrast & text legibility */}
        <div
          className="tracking-dribbble-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(11, 15, 25, 0.45) 0%, rgba(11, 15, 25, 0.85) 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        />
      </div>

      <div className="container" style={{ maxWidth: '960px', position: 'relative', zIndex: 1 }}>
        {/* Top return link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            style={{ color: 'var(--text-secondary, #D5CBBF)', padding: '0.4rem 0.8rem' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Return to Royal Grand Hall
          </Button>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div
            className="badge badge-gold"
            style={{ marginBottom: '0.75rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} /> LIVE EXPEDITION & PICKUP TRACKER
          </div>
          <h1 style={{ marginBottom: '0.75rem', fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>
            Track Your <span className="text-gradient-gold">Royal Feast</span>
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              margin: '0 auto',
              maxWidth: '620px',
              fontSize: '1.05rem',
              lineHeight: '1.6'
            }}
          >
            Follow your order in real-time as master chefs at Raalahami prepare your heirloom curries and dispatch our royal couriers across the city.
          </p>
        </div>

        {/* Search Order ID Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto space-y-2 mb-10"
          aria-label="Search order status form"
        >
          {/* Label placed above the interactive row */}
          <label className="block text-xs md:text-sm font-semibold tracking-wide text-left" style={{ color: 'var(--text-secondary)' }}>
            Enter Order Reference Number
          </label>

          {/* Flex row pairing the Input and Button perfectly on the same height */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => {
                  setOrderIdInput(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. Reference Number"
                autoComplete="off"
                spellCheck="false"
                style={{
                  backgroundColor: 'var(--bg-glass)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-medium)'
                }}
                className="w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-sm md:text-base shadow-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 rounded-xl font-serif text-xs md:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Compass className="w-4 h-4 text-neutral-950" />
              <span>{isLoading ? 'SEARCHING...' : 'TRACK ROYAL ORDER'}</span>
            </button>
          </div>

          {validationError && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <XCircle size={13} /> {validationError}
            </p>
          )}
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
            {/* Celebratory Banner for Completed Orders */}
            {['COMPLETED', 'DELIVERED', 'SERVED'].includes((currentOrder.status || '').toUpperCase()) && (
              <div
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.75rem',
                  marginBottom: '1.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 'var(--radius-md, 12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#0B0D11',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#10B981', fontSize: '1.1rem', fontWeight: '700' }}>
                      Royal Feast Fulfilled & Delivered!
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      This feast has been successfully completed and moved to your <strong>Completed Feasts</strong> history.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Button variant="primary" size="sm" onClick={() => navigate('/menu')}>
                    <Utensils size={14} style={{ marginRight: '0.35rem' }} /> Order Another Feast
                  </Button>
                </div>
              </div>
            )}

            {/* Conditional Stepper Component */}
            <OrderStatusTracker
              fulfillmentType={
                currentOrder.fulfillment_type ||
                currentOrder.fulfillmentType ||
                currentOrder.orderType ||
                'Delivery'
              }
              status={currentOrder.status || 'PREPARING'}
              estimatedMinutes={currentOrder.estimatedMinutes || 25}
              order={currentOrder}
            />

            {/* Order Reference and Database ID Banner */}
            <div
              className="glass-panel"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '0.9rem 1.35rem',
                margin: '1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Order Reference:
                </span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', letterSpacing: '0.03em' }}>
                  #{currentOrder.order_number || currentOrder.orderNumber || (currentOrder.id ? (String(currentOrder.id).startsWith('RAALAHAMI') ? currentOrder.id : `ORD-${currentOrder.id}`) : 'ORD-NEW')}
                </strong>
                {currentOrder.id && String(currentOrder.id) !== String(currentOrder.order_number || currentOrder.orderNumber) && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    (Database ID: #{currentOrder.id})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  className="badge"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    fontWeight: '700'
                  }}
                >
                  <Sparkles size={12} style={{ marginRight: '0.3rem' }} /> Live Synced
                </span>
              </div>
            </div>

            {/* Itemized summary */}
            <OrderSummary order={currentOrder} />
          </div>
        ) : (hasSearched && searchedId) ? (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg, 16px)'
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              No royal order found with reference <strong style={{ color: 'var(--accent-gold)' }}>{searchedId}</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Please verify your receipt reference number or contact royal concierge support if you need assistance.
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              border: '1px solid rgba(229, 169, 60, 0.25)',
              borderRadius: 'var(--radius-lg, 16px)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }} aria-hidden="true">
              👑
            </div>
            <div className="badge badge-gold" style={{ marginBottom: '0.75rem', padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}>
              ROYAL EXPEDITION TRACKER
            </div>
            <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '700' }}>
              Track Your Royal Feast
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Please enter your Order Reference Number above and click &quot;TRACK ROYAL ORDER&quot; to view live kitchen preparation and courier expedition status.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="md" onClick={() => navigate('/menu')}>
                <Utensils size={16} style={{ marginRight: '0.4rem' }} /> Explore Royal Menu
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              border: '1px solid rgba(229, 169, 60, 0.25)',
              borderRadius: 'var(--radius-lg, 16px)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }} aria-hidden="true">
              ✨
            </div>
            <div className="badge badge-gold" style={{ marginBottom: '0.75rem', padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}>
              NO ACTIVE FEASTS IN PREPARATION
            </div>
            <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '700' }}>
              You have no active orders in progress
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
              All your previous feasts have been fulfilled and saved in your history below. Savor another heirloom meal or review your completed orders.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="md" onClick={() => navigate('/menu')}>
                <Utensils size={16} style={{ marginRight: '0.4rem' }} /> Explore Royal Menu
              </Button>
              {completedFeasts.length > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setHistoryTab('completed');
                    document.getElementById('user-feast-history')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <CheckCircle2 size={16} style={{ marginRight: '0.4rem', color: '#10B981' }} /> View Completed Feasts ({completedFeasts.length})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* USER FEAST HISTORY SECTION (AUTHENTICATED USERS ONLY) */}
        {isAuthenticated && user && (
          <div id="user-feast-history" style={{ marginTop: '4rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid rgba(244, 237, 228, 0.1)',
              paddingBottom: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} color="var(--accent-gold)" />
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                  User Feast History
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Account Feasts for <strong style={{ color: 'var(--accent-gold)' }}>{userEmail}</strong>
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchOrderHistory(userEmail)}
              isLoading={isHistoryLoading}
              style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
            >
              <RefreshCw size={14} style={{ marginRight: '0.4rem' }} /> Refresh History
            </Button>
          </div>

          {/* Luxury Tab Bar */}
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => setHistoryTab('active')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: historyTab === 'active' ? '1px solid var(--accent-gold)' : '1px solid transparent',
                background: historyTab === 'active'
                  ? 'linear-gradient(135deg, var(--accent-gold, #E5A93C), #C68E2D)'
                  : 'transparent',
                color: historyTab === 'active' ? '#0B0D11' : 'var(--text-secondary)',
                fontWeight: historyTab === 'active' ? '700' : '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={15} />
              <span>In Progress</span>
              <span
                style={{
                  backgroundColor: historyTab === 'active' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                  color: historyTab === 'active' ? '#0B0D11' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px'
                }}
              >
                {activeFeasts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab('completed')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: historyTab === 'completed' ? '1px solid #10B981' : '1px solid transparent',
                background: historyTab === 'completed'
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'transparent',
                color: historyTab === 'completed' ? '#10B981' : 'var(--text-secondary)',
                fontWeight: historyTab === 'completed' ? '700' : '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={15} />
              <span>Completed</span>
              <span
                style={{
                  backgroundColor: historyTab === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: historyTab === 'completed' ? '#10B981' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px'
                }}
              >
                {completedFeasts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryTab('cancelled')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: historyTab === 'cancelled' ? '1px solid #EF4444' : '1px solid transparent',
                background: historyTab === 'cancelled'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : 'transparent',
                color: historyTab === 'cancelled' ? '#EF4444' : 'var(--text-secondary)',
                fontWeight: historyTab === 'cancelled' ? '700' : '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <XCircle size={15} />
              <span>Cancelled</span>
              <span
                style={{
                  backgroundColor: historyTab === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: historyTab === 'cancelled' ? '#EF4444' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px'
                }}
              >
                {cancelledFeasts.length}
              </span>
            </button>
          </div>

          {/* History Cards List */}
          {currentDisplayHistory.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                border: '1px dashed var(--border-subtle)'
              }}
            >
              <History size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                No {historyTab === 'completed' ? 'Completed' : historyTab === 'cancelled' ? 'Cancelled' : 'Active'} Feasts Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {historyTab === 'active'
                  ? 'You currently have no feasts in progress.'
                  : historyTab === 'completed'
                  ? 'No past completed royal orders on record.'
                  : 'No cancelled orders.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {paginatedHistory.map((item) => {
                  const itemId = (item.order_number || item.id || item.orderNumber || '').toString();
                  const cleanItemId = itemId.replace('#', '').trim();
                  const activeTrackedId = (currentOrder?.order_number || currentOrder?.id || searchedId || '').toString().replace('#', '').trim();
                  const isSelected = !!activeTrackedId && cleanItemId === activeTrackedId;
                  const fMeta = getFulfillmentMeta(item);
                  const FIcon = fMeta.icon;
                  const sBadge = getStatusBadgeStyle(item.status);
                  const SIcon = sBadge.icon;

                  return (
                    <div
                      key={cleanItemId}
                      className="glass-panel"
                      style={{
                        padding: '1.25rem 1.5rem',
                        border: isSelected
                          ? '1px solid var(--accent-gold)'
                          : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md, 12px)',
                        boxShadow: isSelected ? 'var(--shadow-glow-gold)' : 'var(--shadow-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      {/* Left Details */}
                      <div style={{ flex: '1 1 320px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                            #{cleanItemId}
                          </span>

                          <span
                            className="badge"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: fMeta.color,
                              border: `1px solid ${fMeta.color}40`,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <FIcon size={12} /> {fMeta.label}
                          </span>

                          <span
                            className="badge"
                            style={{
                              backgroundColor: sBadge.bg,
                              color: sBadge.color,
                              border: sBadge.border,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <SIcon size={12} /> {(item.status || 'PLACED').replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Items summary */}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                          {item.items && item.items.length > 0
                            ? item.items.map((it) => `${it.quantity || 1}x ${it.name}`).join(', ')
                            : 'Royal Selection of Heirlooms'}
                        </div>

                        {/* Timestamp */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} />
                          {item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at).toLocaleString() : 'Recent feast'}
                        </div>
                      </div>

                      {/* Right: Total Price & Track Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                            Total Amount
                          </div>
                          <div style={{ fontSize: '1.15rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                            {formatCurrency(item.totalPrice || item.totalAmount || item.total_amount || 0)}
                          </div>
                        </div>

                        <Button
                          variant={isSelected ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => {
                            setOrderIdInput(cleanItemId);
                            executeTrackOrder(cleanItemId);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            fontWeight: '700',
                            padding: '0.45rem 1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          {isSelected ? 'Currently Tracking' : 'Track Live'} <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <RoyalPagination
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                onPageChange={(page) => {
                  setHistoryPage(page);
                  document.getElementById('user-feast-history')?.scrollIntoView({ behavior: 'smooth' });
                }}
                itemsPerPage={ORDERS_PER_PAGE}
                totalItems={currentDisplayHistory.length}
              />
            </>
          )}
        </div>
      )}
      </div>

      <style>{`
        html.light .tracking-dribbble-overlay {
          background: radial-gradient(circle at 50% 30%, rgba(250, 248, 245, 0.5) 0%, rgba(250, 248, 245, 0.88) 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default OrderTrackingPage;
