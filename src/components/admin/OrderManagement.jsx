import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingBag,
  Truck,
  Flame,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  FileDown,
  Calendar
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import orderService from '../../services/orderService';
import { generateOrdersDailyPDF } from '../../utils/pdfReportGenerator';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import RoyalPagination from '../common/RoyalPagination';

const isCompleted = (status) => ['COMPLETED', 'DELIVERED', 'SERVED'].includes(status?.toUpperCase());
const isCancelled = (status) => ['CANCELLED', 'REJECTED'].includes(status?.toUpperCase());

const ORDERS_PER_PAGE = 8;

/**
 * Dedicated Admin Order Fulfillment & Dispatch Center
 * Prevents status bounce-back and synchronizes user order tracking in real-time.
 */
export const OrderManagement = ({ onNotify }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Single activeTab state: 'all_feasts' | 'delivery' | 'takeaway' | 'dine_in' | 'completed' | 'cancelled'
  const [activeTab, setActiveTab] = useState('all_feasts');
  const [isUpdating, setIsUpdating] = useState(null);

  // Reset pagination on tab or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');

  // Selected Order for Full Details Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Daily Report Export State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleDownloadDailyReport = async () => {
    setIsExportingPDF(true);
    try {
      const data = await orderService.getDailyOrdersReport(reportDate);
      if (!data || !data.orders || data.orders.length === 0) {
        toast.warning(`No orders found for selected date: ${reportDate}`);
      }
      const filename = generateOrdersDailyPDF(data, 'Admin Operations');
      toast.success(`Downloaded Daily Orders Report (${reportDate})`);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Daily Report Generated',
          message: `Generated and downloaded ${filename}`
        });
      }
    } catch (err) {
      console.error('[DAILY ORDER REPORT ERROR]', err);
      toast.error('Failed to generate daily orders report');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      if (Array.isArray(data) && data.length > 0) {
        setOrders((prevOrders) => {
          if (prevOrders.length === 0) return data;
          // Merge preserving recent local updates to prevent status bounce-back
          return data.map((d) => {
            const local = prevOrders.find(
              (p) => String(p.id) === String(d.id) || String(p.order_number) === String(d.order_number)
            );
            if (local && local.updatedAt && (!d.updatedAt || new Date(local.updatedAt) >= new Date(d.updatedAt))) {
              return { ...d, ...local };
            }
            return d;
          });
        });
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Order Sync Error',
          message: 'Unable to synchronize orders with fulfillment engine.'
        });
      }
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [onNotify]);

  // Initial fetch and auto-polling every 4 seconds
  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // 1. Dine-In Stages Definition (Strict 3 stages: Placed -> Preparing -> Served)
  const DINE_IN_STAGES = useMemo(
    () => [
      { key: 'CONFIRMED', label: 'Order Placed', nextKey: 'PREPARING', nextLabel: 'Start Preparing', color: '#E5A93C' },
      { key: 'PREPARING', label: 'Preparing', nextKey: 'SERVED', nextLabel: 'Mark Served & Completed', color: '#F97316' },
      { key: 'SERVED', label: 'Served / Completed', nextKey: null, nextLabel: 'Completed', color: '#10B981' }
    ],
    []
  );

  // 2. Takeaway Stages Definition (Strict 3 stages: Placed -> Preparing -> Ready for Pickup)
  const TAKEAWAY_STAGES = useMemo(
    () => [
      { key: 'PENDING', label: 'Order Placed', nextKey: 'PREPARING', nextLabel: 'Preparing', color: '#E5A93C' },
      { key: 'PREPARING', label: 'Preparing', nextKey: 'READY_FOR_PICKUP', nextLabel: 'Ready for Pickup', color: '#F97316' },
      { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup / Completed', nextKey: 'COMPLETED', nextLabel: 'Complete Pickup', color: '#10B981' }
    ],
    []
  );

  // 3. Delivery Stages Definition (5 stages: Placed -> Kitchen Confirmed -> Cooking -> Out for Delivery -> Delivered)
  const DELIVERY_STAGES = useMemo(
    () => [
      { key: 'PENDING', label: 'Order Placed', nextKey: 'KITCHEN_CONFIRMED', nextLabel: 'Kitchen Confirmed', color: '#E5A93C' },
      { key: 'KITCHEN_CONFIRMED', label: 'Kitchen Confirmed', nextKey: 'COOKING', nextLabel: 'Cooking & Simmering', color: '#60A5FA' },
      { key: 'CONFIRMED', label: 'Kitchen Confirmed', nextKey: 'COOKING', nextLabel: 'Cooking & Simmering', color: '#60A5FA' },
      { key: 'COOKING', label: 'Cooking & Simmering', nextKey: 'OUT_FOR_DELIVERY', nextLabel: 'Out for Delivery', color: '#F97316' },
      { key: 'PREPARING', label: 'Cooking & Simmering', nextKey: 'OUT_FOR_DELIVERY', nextLabel: 'Out for Delivery', color: '#F97316' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', nextKey: 'DELIVERED', nextLabel: 'Delivered', color: '#A855F7' },
      { key: 'DELIVERED', label: 'Delivered', nextKey: null, nextLabel: 'Completed', color: '#10B981' }
    ],
    []
  );

  // Display stages without duplicates for the visual stepper line
  const DISPLAY_DELIVERY_STAGES = useMemo(
    () => [
      { key: 'PENDING', label: 'Order Placed', color: '#E5A93C' },
      { key: 'KITCHEN_CONFIRMED', label: 'Kitchen Confirmed', color: '#60A5FA' },
      { key: 'COOKING', label: 'Cooking & Simmering', color: '#F97316' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#A855F7' },
      { key: 'DELIVERED', label: 'Delivered', color: '#10B981' }
    ],
    []
  );

  const getFulfillmentInfo = (order) => {
    const raw = (order.fulfillment_type || order.fulfillmentMethod || order.orderType || 'DELIVERY').toUpperCase();
    if (raw.includes('DINE')) {
      return { type: 'Dine-In', isDineIn: true, stages: DINE_IN_STAGES, displayStages: DINE_IN_STAGES };
    }
    if (raw.includes('TAKEAWAY') || raw.includes('PICKUP')) {
      return { type: 'Takeaway', isTakeaway: true, stages: TAKEAWAY_STAGES, displayStages: TAKEAWAY_STAGES };
    }
    return { type: 'Home Delivery', isDelivery: true, stages: DELIVERY_STAGES, displayStages: DISPLAY_DELIVERY_STAGES };
  };

  const getStageIndex = (currentStatus, isDineIn, isTakeaway) => {
    const norm = (currentStatus || 'PENDING').toUpperCase();
    if (isDineIn) {
      if (norm === 'PENDING' || norm === 'CONFIRMED' || norm === 'PLACED') return 0;
      if (norm === 'PREPARING' || norm === 'COOKING' || norm === 'IN_PREPARATION') return 1;
      if (norm === 'SERVED' || norm === 'COMPLETED' || norm === 'DELIVERED') return 2;
      return 0;
    }
    if (isTakeaway) {
      if (norm === 'PENDING' || norm === 'PLACED') return 0;
      if (norm === 'CONFIRMED' || norm === 'PREPARING' || norm === 'IN_PREPARATION' || norm === 'COOKING') return 1;
      if (norm === 'READY_FOR_PICKUP' || norm === 'READY' || norm === 'COMPLETED' || norm === 'DELIVERED' || norm === 'SERVED') return 2;
      return 0;
    }
    // Delivery (5-stage)
    if (norm === 'PENDING' || norm === 'PLACED') return 0;
    if (norm === 'KITCHEN_CONFIRMED' || norm === 'CONFIRMED') return 1;
    if (norm === 'COOKING' || norm === 'PREPARING' || norm === 'IN_PREPARATION') return 2;
    if (norm === 'OUT_FOR_DELIVERY' || norm === 'DISPATCHED' || norm === 'READY_FOR_PICKUP') return 3;
    if (norm === 'DELIVERED' || norm === 'COMPLETED' || norm === 'SERVED') return 4;
    return 0;
  };

  // Resilient status update / advance handler with clean ID parsing & response binding
  const handleStatusUpdate = async (orderOrId, targetStatus) => {
    let order = null;
    if (orderOrId && typeof orderOrId === 'object') {
      order = orderOrId;
    } else {
      order = orders.find(
        (o) =>
          (o.id || o.order_number || '').toString().replace('#', '').trim() ===
          (orderOrId || '').toString().replace('#', '').trim()
      ) || { id: orderOrId };
    }

    const cleanId = (order.id || order.order_number || order.orderNumber || orderOrId || '')
      .toString()
      .replace('#', '')
      .trim();

    console.log(`[FRONTEND DISPATCH] Updating Order ID: ${cleanId} to: ${targetStatus}`);
    setIsUpdating(cleanId);

    try {
      // Call unified status endpoint
      const response = await apiClient.patch(`/api/admin/orders/${cleanId}/status`, {
        status: targetStatus
      });

      const persistedStatus =
        response.data?.order?.status ||
        response.data?.data?.order?.status ||
        response.data?.data?.status ||
        response.data?.status ||
        targetStatus;

      // Update session storage immediately
      if (typeof sessionStorage !== 'undefined') {
        try {
          const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
          const updated = savedOrders.map((o) => {
            const oId = (o.id || o.order_number || o.orderNumber || '').toString().replace('#', '').trim();
            return oId === cleanId ? { ...o, status: persistedStatus, updatedAt: new Date().toISOString() } : o;
          });
          sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(updated));
        } catch (e) {}
      }

      // Instantly update orders state
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          const oId = (o.id || o.order_number || o.orderNumber || '').toString().replace('#', '').trim();
          return oId === cleanId ? { ...o, status: persistedStatus, updatedAt: new Date().toISOString() } : o;
        })
      );

      toast.success(`Order advanced to ${persistedStatus.replace(/_/g, ' ')}`);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Order Status Updated',
          message: `Order #${cleanId} moved to ${persistedStatus}`
        });
      }
    } catch (err) {
      console.error('[STATUS DISPATCH ERROR]', err.response?.data || err.message);
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not persist status change to database'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  // Conditional next status determination per fulfillment type
  const getNextStatus = (order) => {
    if (!order) return 'COMPLETED';
    const type = (order?.fulfillment_type || order?.fulfillmentMethod || order?.orderType || '').toLowerCase();
    const current = (order?.status || '').toUpperCase().replace(/[\s-]+/g, '_');

    // HOME DELIVERY FLOW (5 Steps)
    if (type.includes('delivery')) {
      if (current === 'PENDING' || current === 'PLACED') return 'KITCHEN_CONFIRMED';
      if (current === 'KITCHEN_CONFIRMED' || current === 'CONFIRMED') return 'COOKING';
      if (current === 'COOKING' || current === 'PREPARING' || current === 'IN_PREPARATION') return 'OUT_FOR_DELIVERY';
      if (current === 'OUT_FOR_DELIVERY' || current === 'DISPATCHED') return 'DELIVERED';
    }

    // TAKEAWAY FLOW (3 Steps)
    if (type.includes('takeaway') || type.includes('pickup')) {
      if (current === 'PENDING' || current === 'PLACED' || current === 'CONFIRMED') return 'PREPARING';
      if (current === 'PREPARING' || current === 'COOKING' || current === 'IN_PREPARATION') return 'READY_FOR_PICKUP';
      if (current === 'READY_FOR_PICKUP' || current === 'READY') return 'COMPLETED';
    }

    // DINE-IN FLOW (3 Steps)
    if (type.includes('dine')) {
      if (current === 'CONFIRMED' || current === 'PENDING' || current === 'PLACED') return 'PREPARING';
      if (current === 'PREPARING' || current === 'COOKING' || current === 'IN_PREPARATION') return 'SERVED';
      if (current === 'SERVED') return 'COMPLETED';
    }

    // Safe fallbacks to prevent mixing flows
    if (type.includes('takeaway') || type.includes('pickup')) {
      return 'READY_FOR_PICKUP';
    }
    if (type.includes('dine')) {
      return 'SERVED';
    }

    return 'COMPLETED';
  };

  const getNextStatusLabel = (order) => {
    const next = getNextStatus(order);
    const labels = {
      'KITCHEN_CONFIRMED': 'Kitchen Confirmed',
      'COOKING': 'Cooking & Simmering',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Mark Delivered',
      'PREPARING': 'Start Preparing',
      'READY_FOR_PICKUP': 'Ready for Pickup',
      'SERVED': 'Mark Served & Completed',
      'COMPLETED': 'Mark Completed'
    };
    return labels[next] || (next ? next.replace(/_/g, ' ') : 'Next Stage');
  };

  // Dedicated Advance Handler mapping transitions and capturing returned persisted state
  const handleAdvance = async (order, customTargetStatus = null) => {
    const targetStatus = customTargetStatus || getNextStatus(order);
    return handleStatusUpdate(order, targetStatus);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    await handleAdvance(cancellingOrder, 'CANCELLED');
    setCancellingOrder(null);
    setCancelReason('Customer requested cancellation');
  };

  // Tab counts for badge counters
  const tabCounts = useMemo(() => {
    let all_feasts = 0;
    let delivery = 0;
    let takeaway = 0;
    let dine_in = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach((o) => {
      const status = (o.status || 'PENDING').toUpperCase();
      const type = (o.fulfillment_type || o.fulfillmentMethod || o.orderType || '').toLowerCase();

      if (isCancelled(status)) {
        cancelled++;
      } else if (isCompleted(status)) {
        completed++;
      } else {
        all_feasts++;
        if (type.includes('dine')) {
          dine_in++;
        } else if (type.includes('takeaway') || type.includes('pickup')) {
          takeaway++;
        } else {
          delivery++;
        }
      }
    });

    return { all_feasts, delivery, takeaway, dine_in, completed, cancelled };
  }, [orders]);

  // Strict Exclusion & Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.status?.toUpperCase();
      const type = (order.fulfillment_type || order.fulfillmentMethod || order.orderType || '').toLowerCase();

      // Cancelled Tab: Strictly show cancelled/rejected orders only
      if (activeTab === 'cancelled') {
        if (!isCancelled(status)) return false;
      } else if (activeTab === 'completed') {
        // Completed Tab: Strictly show completed/delivered/served orders only
        if (!isCompleted(status)) return false;
      } else {
        // FOR ALL ACTIVE TABS: Instantly eliminate any order that is completed, delivered, served or cancelled
        if (isCancelled(status) || isCompleted(status)) {
          return false;
        }

        if (activeTab === 'all_feasts') {
          // Show all active feasts
        } else if (activeTab === 'delivery') {
          if (!type.includes('delivery')) return false;
        } else if (activeTab === 'takeaway') {
          if (!type.includes('takeaway') && !type.includes('pickup')) return false;
        } else if (activeTab === 'dine_in') {
          if (!type.includes('dine')) return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const idMatch = String(order.id || '').toLowerCase().includes(query) ||
          String(order.order_number || '').toLowerCase().includes(query);
        const nameMatch = String(order.customer_name || order.recipientName || order.name || '').toLowerCase().includes(query);
        const emailMatch = String(order.customerEmail || order.email || '').toLowerCase().includes(query);
        const phoneMatch = String(order.phone || order.contactPhone || '').toLowerCase().includes(query);
        const addressMatch = String(order.deliveryAddress || order.deliveryStreetAddress || '').toLowerCase().includes(query);

        if (!idMatch && !nameMatch && !emailMatch && !phoneMatch && !addressMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Paginate filtered orders
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Unified Single Horizontal Tab Items
  const filterTabs = [
    { id: 'all_feasts', label: 'All Feasts', count: tabCounts.all_feasts, icon: Sparkles },
    { id: 'delivery', label: 'Home Delivery', count: tabCounts.delivery, icon: Truck },
    { id: 'takeaway', label: 'Takeaway', count: tabCounts.takeaway, icon: ShoppingBag },
    { id: 'dine_in', label: 'Dine-In', count: tabCounts.dine_in, icon: UtensilsCrossed },
    { id: 'completed', label: 'Completed', count: tabCounts.completed, icon: CheckCircle2, badgeColor: '#10B981' },
    { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled, icon: XCircle, badgeColor: '#EF4444' }
  ];

  return (
    <div className="order-fulfillment-panel fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <Sparkles size={13} /> CENTRAL DISPATCH & FULFILLMENT CENTER
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #F8FAFC)', margin: 0 }}>
            Order Fulfillment & Live Dispatch
          </h2>
          <p style={{ color: 'var(--text-muted, #94A3B8)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Advance live orders across 3-stage Dine-In, 3-stage Takeaway, and 5-stage Home Delivery queues in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Daily Report Date Selector */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-surface, #1E293B)',
              border: '1px solid var(--border-medium, rgba(244, 237, 228, 0.2))',
              borderRadius: 'var(--radius-sm, 8px)',
              padding: '0.35rem 0.65rem'
            }}
          >
            <Calendar size={14} style={{ color: 'var(--accent-gold, #D97706)' }} />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary, #F8FAFC)',
                fontSize: '0.85rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
              title="Select specific date for Daily Fulfillment Report"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadDailyReport}
            isLoading={isExportingPDF}
            style={{
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(245, 158, 11, 0.28))',
              borderColor: 'var(--accent-gold, #D97706)',
              color: 'var(--accent-gold, #F59E0B)'
            }}
            title="Download PDF report for the selected date"
          >
            <FileDown size={14} style={{ marginRight: '0.4rem' }} />
            Download Daily Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(false)}
            isLoading={isLoading}
            style={{ fontWeight: '600' }}
          >
            <RefreshCw size={14} style={{ marginRight: '0.4rem' }} /> Refresh Orders
          </Button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-gold, #E5A93C)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Active Kitchen Feasts
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
            {tabCounts.all_feasts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Active orders in progress
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #60A5FA' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Home Delivery Expeditions
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#60A5FA', marginTop: '0.25rem' }}>
            {tabCounts.delivery}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            In cooking or en route
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #F97316' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Takeaway Pickups
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#F97316', marginTop: '0.25rem' }}>
            {tabCounts.takeaway}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Counter prep & boxed
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Dine-In Active Tables
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
            {tabCounts.dine_in}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Claypot & table service
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
            Fulfilled Feasts Today
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10B981', marginTop: '0.25rem' }}>
            {tabCounts.completed}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Served & delivered
          </div>
        </div>
      </div>

      {/* Unified Filter & Search Bar with Single Horizontal Tab Group */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          border: '1px solid rgba(244, 237, 228, 0.1)'
        }}
      >
        {/* Row 1: Search Bar & Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative', maxWidth: '480px' }}>
            <Input
              placeholder="Search reference #, user name, phone, table, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="m-0"
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--accent-gold)' }}>{filteredOrders.length}</strong> orders
          </div>
        </div>

        {/* Row 2: Unified Horizontal Button Tab Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid rgba(244, 237, 228, 0.08)'
          }}
        >
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  border: isActive
                    ? tab.id === 'cancelled'
                      ? '1px solid #EF4444'
                      : tab.id === 'completed'
                      ? '1px solid #10B981'
                      : '1px solid var(--accent-gold, #E5A93C)'
                    : '1px solid transparent',
                  background: isActive
                    ? tab.id === 'cancelled'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : tab.id === 'completed'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'linear-gradient(135deg, var(--accent-gold, #E5A93C), #C68E2D)'
                    : 'transparent',
                  color: isActive
                    ? tab.id === 'cancelled'
                      ? '#EF4444'
                      : tab.id === 'completed'
                      ? '#10B981'
                      : '#0B0D11'
                    : 'var(--text-secondary, #D5CBBF)',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive && tab.id !== 'cancelled' && tab.id !== 'completed'
                    ? '0 0 12px rgba(229, 169, 60, 0.35)'
                    : 'none'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive
                      ? tab.id === 'cancelled'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : tab.id === 'completed'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(0, 0, 0, 0.35)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isActive
                      ? tab.id === 'cancelled'
                        ? '#EF4444'
                        : tab.id === 'completed'
                        ? '#10B981'
                        : '#0B0D11'
                      : 'var(--text-muted, #94A3B8)',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    marginLeft: '0.2rem'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid var(--accent-gold)',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.75s linear infinite'
            }}
          />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading live orders from fulfillment queue...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            border: '1px dashed var(--border-subtle)'
          }}
        >
          <ShoppingBag size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Orders In This Tab
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'completed'
              ? 'No completed feasts recorded yet.'
              : activeTab === 'cancelled'
              ? 'No cancelled orders.'
              : 'There are currently no active orders matching this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {paginatedOrders.map((order) => {
            const userRef =
              order.order_number ||
              order.orderNumber ||
              (order.id ? (String(order.id).startsWith('RAALAHAMI') ? order.id : `ORD-${order.id}`) : 'ORD-NEW');
            const cleanUserRef = (userRef || '').toString().replace('#', '').trim();
            const dbId = order.id && String(order.id) !== cleanUserRef ? order.id : null;
            const orderId = cleanUserRef;
            const cleanId = cleanUserRef;
            const currentStatus = (order.status || 'PENDING').toUpperCase();
            const { type, isDineIn, isTakeaway, stages, displayStages } = getFulfillmentInfo(order);

            // Determine stage index accurately
            const stageIndex = getStageIndex(currentStatus, isDineIn, isTakeaway);
            const currentStageObj = stages.find((s) => s.key === currentStatus) || stages[stageIndex] || stages[0];
            const nextStatus = getNextStatus(order);
            const nextStageLabel = getNextStatusLabel(order);

            const orderIsCancelled = isCancelled(currentStatus);
            const orderIsCompleted = isCompleted(currentStatus);

            return (
              <div
                key={cleanUserRef || order.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  border: orderIsCancelled
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : orderIsCompleted
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : isDineIn
                    ? '1px solid rgba(212, 175, 55, 0.4)'
                    : '1px solid rgba(229, 169, 60, 0.3)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Info Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid rgba(244, 237, 228, 0.08)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', margin: 0, fontWeight: '700', letterSpacing: '0.02em' }}>
                          #{cleanUserRef}
                        </h3>
                        {dbId && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            (DB ID: #{dbId})
                          </span>
                        )}
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isDineIn
                              ? 'rgba(212, 175, 55, 0.18)'
                              : isTakeaway
                              ? 'rgba(229, 169, 60, 0.15)'
                              : 'rgba(96, 165, 250, 0.15)',
                            color: isDineIn || isTakeaway ? 'var(--accent-gold)' : '#60A5FA',
                            border: `1px solid ${
                              isDineIn || isTakeaway
                                ? 'rgba(229, 169, 60, 0.4)'
                                : 'rgba(96, 165, 250, 0.4)'
                            }`,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isDineIn ? (
                            <UtensilsCrossed size={12} />
                          ) : isTakeaway ? (
                            <ShoppingBag size={12} />
                          ) : (
                            <Truck size={12} />
                          )}
                          {type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: orderIsCancelled
                          ? 'rgba(239, 68, 68, 0.2)'
                          : orderIsCompleted
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(229, 169, 60, 0.2)',
                        color: orderIsCancelled ? '#EF4444' : orderIsCompleted ? '#10B981' : 'var(--accent-gold)',
                        border: `1px solid ${
                          orderIsCancelled
                            ? 'rgba(239, 68, 68, 0.5)'
                            : orderIsCompleted
                            ? 'rgba(16, 185, 129, 0.5)'
                            : 'rgba(229, 169, 60, 0.5)'
                        }`,
                        fontSize: '0.82rem',
                        padding: '0.35rem 0.85rem',
                        fontWeight: '700',
                        borderRadius: '9999px'
                      }}
                    >
                      {currentStatus.replace(/_/g, ' ')}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrderDetails(order)}
                      style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                    >
                      View Items ({order.items?.length || 0})
                    </Button>
                  </div>
                </div>

                {/* Main Order Content Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  {/* User Details */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.4rem' }}>
                      User Details
                    </div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {order.customer_name || order.recipientName || order.name || 'Honored Guest'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Phone size={13} /> {order.phone || order.contactPhone || 'No contact provided'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Mail size={13} /> {order.customerEmail || order.email || 'guest@raalahami.lk'}
                    </div>
                  </div>

                  {/* Destination / Table Seating */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.4rem' }}>
                      {isDineIn ? 'Royal Table Seating' : 'Fulfillment Destination'}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      {isDineIn ? (
                        <UtensilsCrossed size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-gold)' }} />
                      ) : (
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-gold)' }} />
                      )}
                      <span>
                        {isDineIn
                          ? order.table ||
                            order.selectedTable ||
                            order.assignedTable ||
                            order.table_number ||
                            order.deliveryAddress ||
                            'Royal Dining Hall - Table 1'
                          : order.deliveryAddress ||
                            order.deliveryStreetAddress ||
                            'Raalahami Heritage Counter'}
                      </span>
                    </div>
                    {order.reservation?.diningDate && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginTop: '0.3rem' }}>
                        Reservation: {order.reservation.diningDate} at {order.reservation.timeSlot || '19:30'} ({order.reservation.partySize || '2 Guests'})
                      </div>
                    )}
                    {order.deliveryInstructions && (
                      <div style={{ fontSize: '0.78rem', color: '#E5A93C', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        Note: "{order.deliveryInstructions}"
                      </div>
                    )}
                  </div>

                  {/* Pricing and Items Quick Snippet */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.4rem' }}>
                      Feast Summary
                    </div>
                    <div style={{ fontSize: '1.15rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                      {formatCurrency(order.totalPrice || order.totalAmount || 0)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ') || 'No item details'}
                    </div>
                  </div>
                </div>

                {/* Interactive Fulfillment Stepper Line (Strictly 3 for Dine-In/Takeaway, 5 for Delivery) */}
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(244, 237, 228, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {isDineIn ? 'Dine-In Pipeline (3 Milestones)' : isTakeaway ? 'Takeaway Pipeline (3 Milestones)' : 'Delivery Pipeline (5 Milestones)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: currentStageObj?.color || 'var(--accent-gold)', fontWeight: '600' }}>
                      Active: {currentStageObj?.label || currentStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {displayStages.map((st, idx) => {
                      const isPast = stageIndex > idx || orderIsCompleted;
                      const isCurr = stageIndex === idx && !orderIsCompleted && !orderIsCancelled;

                      return (
                        <React.Fragment key={st.key}>
                          <button
                            type="button"
                            onClick={() => !orderIsCancelled && handleStatusUpdate(orderId, st.key)}
                            disabled={orderIsCancelled || isUpdating === orderId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              backgroundColor: isCurr
                                ? 'var(--accent-gold)'
                                : isPast
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.05)',
                              color: isCurr ? '#0B0D11' : isPast ? '#10B981' : 'var(--text-muted)',
                              border: isCurr
                                ? '1px solid var(--accent-gold)'
                                : isPast
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '9999px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.78rem',
                              fontWeight: isCurr ? '700' : '500',
                              cursor: orderIsCancelled ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease'
                            }}
                            title={`Jump to ${st.label}`}
                          >
                            {isPast ? <CheckCircle2 size={13} /> : idx + 1}. {st.label}
                          </button>
                          {idx < displayStages.length - 1 && (
                            <ChevronRight size={14} style={{ color: isPast ? '#10B981' : 'var(--text-muted)', flexShrink: 0 }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Command Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  {/* Left: Quick Status Action Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set Status:</span>
                    <select
                      value={currentStatus}
                      disabled={isUpdating === orderId}
                      onChange={(e) => handleStatusUpdate(orderId, e.target.value)}
                      style={{
                        backgroundColor: '#0F1219',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isDineIn ? (
                        <>
                          <option value="CONFIRMED">Order Placed / Confirmed (CONFIRMED)</option>
                          <option value="PREPARING">Start Preparing (PREPARING)</option>
                          <option value="SERVED">Mark Served & Completed (SERVED)</option>
                          <option value="CANCELLED">Cancel Order (CANCELLED)</option>
                        </>
                      ) : isTakeaway ? (
                        <>
                          <option value="PENDING">Order Placed (PENDING)</option>
                          <option value="PREPARING">Start Preparing (PREPARING)</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup (READY_FOR_PICKUP)</option>
                          <option value="COMPLETED">Mark Completed (COMPLETED)</option>
                          <option value="CANCELLED">Cancel Order (CANCELLED)</option>
                        </>
                      ) : (
                        <>
                          <option value="PENDING">Order Placed (PENDING)</option>
                          <option value="KITCHEN_CONFIRMED">Kitchen Confirmed (KITCHEN_CONFIRMED)</option>
                          <option value="COOKING">Cooking & Simmering (COOKING)</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery (OUT_FOR_DELIVERY)</option>
                          <option value="DELIVERED">Mark Delivered & Completed (DELIVERED)</option>
                          <option value="CANCELLED">Cancel Order (CANCELLED)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Right: Progressive Advance & Cancel Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {!orderIsCancelled && !orderIsCompleted && nextStatus && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isUpdating === cleanId || isUpdating === orderId}
                        onClick={() => handleAdvance(order)}
                        style={{
                          fontWeight: '700',
                          padding: '0.45rem 1.1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 0 15px rgba(229, 169, 60, 0.3)'
                        }}
                      >
                        Advance: {nextStageLabel} <ArrowRight size={14} />
                      </Button>
                    )}

                    {orderIsCompleted && (
                      <div className="badge badge-emerald" style={{ padding: '0.45rem 0.9rem' }}>
                        <CheckCircle2 size={14} style={{ marginRight: '0.35rem' }} /> {isDineIn ? 'Feast Served at Table' : 'Feast Fully Fulfilled'}
                      </div>
                    )}

                    {orderIsCancelled && (
                      <div
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '0.45rem 0.9rem'
                        }}
                      >
                        <XCircle size={14} style={{ marginRight: '0.35rem' }} /> Order Cancelled
                      </div>
                    )}

                    {!orderIsCancelled && !orderIsCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancellingOrder(order)}
                        style={{
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <XCircle size={14} style={{ marginRight: '0.35rem' }} /> Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RoyalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }}
        itemsPerPage={ORDERS_PER_PAGE}
        totalItems={filteredOrders.length}
      />

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        title="Confirm Order Cancellation"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              color: '#EF4444'
            }}
          >
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.88rem' }}>
              Are you sure you want to cancel Order #
              <strong>{cancellingOrder?.id || cancellingOrder?.order_number}</strong>? This will immediately move the order to the Cancelled queue and notify the customer.
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
              Reason for Cancellation:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0F1219',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem'
              }}
            >
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Kitchen ingredient stock exhausted">Kitchen ingredient stock exhausted</option>
              <option value="Table reservation conflict or unavailable">Table reservation conflict or unavailable</option>
              <option value="Delivery address out of service boundary">Delivery address out of service boundary</option>
              <option value="Payment verification rejected">Payment verification rejected</option>
              <option value="Duplicate order submission">Duplicate order submission</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="ghost" onClick={() => setCancellingOrder(null)}>
              Keep Order Active
            </Button>
            <Button
              variant="danger"
              isLoading={isUpdating === (cancellingOrder?.id || cancellingOrder?.order_number)}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Itemized Order Details Modal */}
      <Modal
        isOpen={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        title={`Order Details #${selectedOrderDetails?.id || selectedOrderDetails?.order_number}`}
      >
        {selectedOrderDetails && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fulfillment Type</span>
                <span className="badge badge-gold">{getFulfillmentInfo(selectedOrderDetails).type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedOrderDetails.customer_name || selectedOrderDetails.recipientName || 'User'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone</span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedOrderDetails.phone || 'N/A'}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
              Ordered Items
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {selectedOrderDetails.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <strong>{item.quantity}x</strong> {item.name || item.title}
                  </span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: '600', fontSize: '0.9rem' }}>
                    {formatCurrency(Number(item.price) * Number(item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(229, 169, 60, 0.1)',
                border: '1px solid rgba(229, 169, 60, 0.25)',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '1.05rem',
                color: 'var(--accent-gold)'
              }}
            >
              <span>Total Bill</span>
              <span>{formatCurrency(selectedOrderDetails.totalPrice || selectedOrderDetails.totalAmount || 0)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
