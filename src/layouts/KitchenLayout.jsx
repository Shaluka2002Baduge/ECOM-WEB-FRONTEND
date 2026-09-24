import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Clock,
  LogOut,
  Flame,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Volume2,
  VolumeX,
  Timer,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/**
 * Dedicated Full-Screen Kitchen Display System (KDS / KOT) Layout
 * Completely isolated from public customer UI (no customer Navbar, Footer, or Cart).
 * Built for high-contrast visibility and fast kitchen line throughput:
 * - Header Bar with ChefHat icon, real-time clock, pending orders badge, staff email, and Sign Out button.
 * - Filter Tabs: All Active, Queued / Placed, In Preparation, Ready for Dispatch.
 * - WCAG High-Contrast KDS Ticket Grid with State Machine actions ('Start Cooking' -> 'Mark as Ready').
 */
export const KitchenLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  // Filter & UI States
  const [filterStatus, setFilterStatus] = useState('ALL_ACTIVE'); // 'ALL_ACTIVE' | 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED'
  const [stationFilter, setStationFilter] = useState('ALL');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState(null);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Orders State (initialized with demo orders + storage)
  const [orders, setOrders] = useState(() => {
    const storedDemoOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');

    const baselineKdsTickets = [
      {
        id: 'KOT-101',
        orderNumber: 'RAL-839210',
        table: 'Table 6 (Courtyard Garden)',
        orderType: 'Dine-In',
        createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
        status: 'PREPARING',
        station: 'Mains & Lamprais',
        dietary: ['Halal', 'Chef Special'],
        specialNotes: 'Banana leaf extra charred on charcoal grill. Mild spice for children.',
        items: [
          { name: 'Royal Dutch Burgher Lamprais', quantity: 2, price: 1850 },
          { name: 'Cashew Nut & Green Pea Baduma', quantity: 1, price: 1650 }
        ]
      },
      {
        id: 'KOT-102',
        orderNumber: 'RAL-839211',
        table: 'Table 2 (Royal Saloon)',
        orderType: 'Dine-In',
        createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
        status: 'PLACED',
        station: 'Seafood Grill',
        dietary: ['Gluten-Free', 'Chef Special'],
        specialNotes: 'Lagoon crab cracked thoroughly for easy dining. Extra lime wedges.',
        items: [
          { name: 'Jaffna Spiced Mud Crab Curry', quantity: 1, price: 3800 },
          { name: 'Crispy Organic Egg Hopper Feast', quantity: 2, price: 950 }
        ]
      },
      {
        id: 'KOT-103',
        orderNumber: 'RAL-839212',
        table: 'Courier Takeaway (#402)',
        orderType: 'Takeaway',
        createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
        status: 'READY',
        station: 'Mains & Lamprais',
        dietary: ['Gluten-Free'],
        specialNotes: 'Customer waiting at royal host stand. Double thermal insulation.',
        items: [
          { name: 'Slow-Cooked Black Pork Curry', quantity: 1, price: 2200 },
          { name: 'Royal Heritage Watalappan', quantity: 2, price: 850 }
        ]
      },
      {
        id: 'KOT-104',
        orderNumber: 'RAL-839215',
        table: 'Table 5 (Maharaja VIP)',
        orderType: 'Dine-In',
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        status: 'PLACED',
        station: 'Mains & Lamprais',
        dietary: ['Halal'],
        specialNotes: 'Diplomatic delegation table; serve all dishes synchronously.',
        items: [
          { name: 'Royal Dutch Burgher Lamprais', quantity: 4, price: 1850 },
          { name: 'Slow-Cooked Black Pork Curry', quantity: 2, price: 2200 },
          { name: 'Royal Heritage Watalappan', quantity: 4, price: 850 }
        ]
      }
    ];

    // Merge any customer checkout orders from current browser session
    const mappedStored = storedDemoOrders.map((stored, idx) => ({
      id: `KOT-LIVE-${idx + 1}`,
      orderNumber: stored.id || `RAL-${Math.floor(100000 + Math.random() * 900000)}`,
      table: stored.deliveryAddress ? 'Royal Delivery Dispatch' : 'Table 1 (Main Hall)',
      orderType: stored.deliveryAddress ? 'Delivery' : 'Dine-In',
      createdAt: stored.createdAt || new Date().toISOString(),
      status: stored.status || 'PLACED',
      station: 'Mains & Lamprais',
      dietary: ['Customer Order'],
      specialNotes: stored.notes || 'Handle with signature presentation care.',
      items: stored.items || [{ name: 'Royal Dutch Burgher Lamprais', quantity: 1, price: 1850 }]
    }));

    return [...mappedStored, ...baselineKdsTickets];
  });

  // Calculate elapsed minutes from order timestamp
  const getElapsedMinutes = (createdAt) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(elapsedMs / 60000));
  };

  // State Machine Action Handlers
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      })
    );

    // Sync to sessionStorage if applicable
    const storedDemoOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const updatedStored = storedDemoOrders.map((o) =>
        o.id === targetOrder.orderNumber ? { ...o, status: newStatus } : o
      );
      sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(updatedStored));
    }

    setNotification({
      type: 'info',
      title: 'Ticket State Updated',
      message: `Order #${orderId} marked as ${newStatus}.`
    });
  };

  // Simulate new incoming ticket
  const handleIngestTestOrder = () => {
    const newId = 'KOT-' + Math.floor(105 + Math.random() * 800);
    const newTicket = {
      id: newId,
      orderNumber: 'RAL-' + Math.floor(100000 + Math.random() * 900000),
      table: `Table ${Math.floor(1 + Math.random() * 8)} (${['Courtyard', 'Royal Saloon', 'Lagoon Deck'][Math.floor(Math.random() * 3)]})`,
      orderType: Math.random() > 0.3 ? 'Dine-In' : 'Takeaway',
      createdAt: new Date().toISOString(),
      status: 'PLACED',
      station: Math.random() > 0.5 ? 'Mains & Lamprais' : 'Seafood Grill',
      dietary: ['Halal', 'Chef Special'],
      specialNotes: 'Hot service requested. Garnish with toasted curry leaves.',
      items: [
        { name: 'Royal Dutch Burgher Lamprais', quantity: 2, price: 1850 },
        { name: 'Royal Heritage Watalappan', quantity: 1, price: 850 }
      ]
    };

    setOrders((prev) => [newTicket, ...prev]);
    setNotification({
      type: 'success',
      title: '✦ New Order Ingested',
      message: `New ticket ${newId} received from front-of-house.`
    });
  };

  // Ticket status counts
  const placedOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const activeOrdersCount = placedOrders.length + preparingOrders.length + readyOrders.length;

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchStation = stationFilter === 'ALL' || order.station === stationFilter;
    if (!matchStation) return false;

    if (filterStatus === 'ALL_ACTIVE') {
      return order.status !== 'COMPLETED';
    }
    return order.status === filterStatus;
  });

  return (
    <div
      className="kitchen-standalone-layout"
      style={{
        minHeight: '100vh',
        backgroundColor: '#090B0E',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* =================================================================== */}
      {/* 1. PURPOSE-DESIGNED KDS HEADER BAR                                  */}
      {/* =================================================================== */}
      <header
        style={{
          height: '4.75rem',
          backgroundColor: '#11151E',
          borderBottom: '2px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Title with ChefHat Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div
            style={{
              width: '2.85rem',
              height: '2.85rem',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0D11',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)'
            }}
          >
            <ChefHat size={26} strokeWidth={2.3} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.1
                }}
              >
                Raalahami Kitchen Display System (KDS)
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--accent-amber)',
                  fontWeight: '800',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  textTransform: 'uppercase'
                }}
              >
                Live Kitchen
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hot Line Order Queue • Expeditor Dispatch Console
            </div>
          </div>
        </div>

        {/* Center: Real-Time Clock & Active Pending Orders Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Active Pending Orders Counter Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#191E2A',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: activeOrdersCount > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                boxShadow: `0 0 10px ${activeOrdersCount > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}`,
                display: 'inline-block'
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending:</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '800' }}>
              {activeOrdersCount} {activeOrdersCount === 1 ? 'Order' : 'Orders'}
            </strong>
          </div>

          {/* Real-Time Digital Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#191E2A',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: '700',
              color: 'var(--accent-gold)',
              letterSpacing: '0.05em'
            }}
          >
            <Clock size={16} />
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Right: Sound Toggle, Ingest Order, Staff Indicator & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Sound alert toggle */}
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: audioEnabled ? 'var(--accent-gold)' : 'var(--text-muted)',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={audioEnabled ? 'Kitchen Chime Enabled' : 'Kitchen Chime Muted'}
            aria-label="Toggle kitchen audio"
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Ingest Test Order Button */}
          <Button variant="outline" size="sm" onClick={handleIngestTestOrder}>
            <Plus size={15} style={{ marginRight: '0.35rem' }} />
            + Test Order
          </Button>

          {/* Logged-In Staff Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              backgroundColor: '#191E2A',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald)'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Chef:</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {user?.email || 'kitchen@raalahami.lk'}
            </strong>
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                fontWeight: '700',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {role || 'KITCHEN_STAFF'}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--accent-danger-muted)',
              color: 'var(--accent-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Sign Out of Kitchen Display"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Global Notification Banner */}
      {notification && (
        <div style={{ padding: '0.75rem 1.5rem 0 1.5rem' }}>
          <Alert
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onDismiss={() => setNotification(null)}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. FILTER TABS & STATION SELECTOR                                   */}
      {/* =================================================================== */}
      <div
        style={{
          backgroundColor: '#121620',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        {/* Quick Filter Buttons for Orders */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {[
            {
              id: 'ALL_ACTIVE',
              label: 'All Active',
              count: activeOrdersCount,
              color: 'var(--text-primary)'
            },
            {
              id: 'PLACED',
              label: 'Queued / Placed',
              count: placedOrders.length,
              color: '#38BDF8',
              icon: Clock
            },
            {
              id: 'PREPARING',
              label: 'In Preparation',
              count: preparingOrders.length,
              color: 'var(--accent-amber)',
              icon: Flame
            },
            {
              id: 'READY',
              label: 'Ready for Dispatch',
              count: readyOrders.length,
              color: 'var(--accent-emerald)',
              icon: CheckCircle2
            },
            {
              id: 'COMPLETED',
              label: 'Completed History',
              count: completedOrders.length,
              color: 'var(--text-muted)'
            }
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? '800' : '600',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--accent-gold)' : '#1A1F2C',
                  color: isActive ? '#0B0D11' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.25)' : '#0F1219',
                    color: isActive ? '#0B0D11' : tab.color,
                    fontWeight: '800'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Station Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="station-filter" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Kitchen Station:
          </label>
          <select
            id="station-filter"
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            style={{
              fontSize: '0.85rem',
              padding: '0.45rem 0.8rem',
              backgroundColor: '#1A1F2C',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Kitchen Lines</option>
            <option value="Mains & Lamprais">Mains & Lamprais Line</option>
            <option value="Seafood Grill">Seafood Grill Station</option>
          </select>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. KDS TICKET GRID (High Contrast WCAG Accessibility)               */}
      {/* =================================================================== */}
      <main
        style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto'
        }}
      >
        {filteredOrders.length === 0 ? (
          <div
            style={{
              padding: '5rem 1rem',
              textAlign: 'center',
              backgroundColor: '#121620',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
              maxWidth: '600px',
              margin: '2rem auto'
            }}
          >
            <ChefHat size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No Active Tickets in this View
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              All tickets for this station have been attended to or fulfilled.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isLate = elapsed > 20 && order.status !== 'COMPLETED';
              const isMedium = elapsed > 10 && elapsed <= 20 && order.status !== 'COMPLETED';

              const isPlaced = order.status === 'PLACED';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';
              const isCompleted = order.status === 'COMPLETED';

              // Header Accent Border & Status Colors
              const statusThemeColor = isReady
                ? 'var(--accent-emerald)'
                : isPreparing
                ? 'var(--accent-amber)'
                : isCompleted
                ? 'var(--text-muted)'
                : '#38BDF8';

              return (
                <article
                  key={order.id}
                  aria-label={`Order ticket ${order.id} for ${order.table}`}
                  style={{
                    backgroundColor: '#131722',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isLate ? 'var(--accent-danger)' : statusThemeColor}`,
                    boxShadow: isLate
                      ? '0 0 20px rgba(239, 68, 68, 0.4)'
                      : '0 4px 16px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden'
                  }}
                >
                  {/* ======================================================= */}
                  {/* CARD HEADER: Order #ID, Dining Mode & Elapsed Timer     */}
                  {/* ======================================================= */}
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: isLate
                        ? 'rgba(239, 68, 68, 0.15)'
                        : isPreparing
                        ? 'rgba(245, 158, 11, 0.1)'
                        : isReady
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(56, 189, 248, 0.08)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      {/* Ticket ID & Master Order # */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '1.45rem',
                              fontWeight: '900',
                              color: '#FFFFFF',
                              letterSpacing: '0.03em'
                            }}
                          >
                            {order.id}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ({order.orderNumber})
                          </span>
                        </div>
                        {/* Dining Mode (Table # or Takeaway) */}
                        <div
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            color: 'var(--accent-gold)',
                            marginTop: '0.15rem'
                          }}
                        >
                          {order.table} • {order.orderType}
                        </div>
                      </div>

                      {/* Elapsed Timer Since Placed */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          backgroundColor: isLate
                            ? 'var(--accent-danger)'
                            : isMedium
                            ? 'var(--accent-amber)'
                            : '#1E2536',
                          color: isLate || isMedium ? '#0B0D11' : '#E2E8F0',
                          boxShadow: isLate ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
                        }}
                      >
                        <Timer size={15} />
                        <span>{elapsed}m ago</span>
                        {isLate && <span>🚨 LATE</span>}
                      </div>
                    </div>

                    {/* Status Badge & Line Station */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isReady
                            ? 'var(--accent-emerald)'
                            : isPreparing
                            ? 'var(--accent-amber)'
                            : isCompleted
                            ? '#2A3042'
                            : '#0284C7',
                          color: isCompleted ? '#CBD5E1' : '#0B0D11',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        ● {order.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Line: <strong style={{ color: 'var(--text-secondary)' }}>{order.station}</strong>
                      </span>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* CARD BODY: Item Names, Large Quantities, Dietary Chips  */}
                  {/* ======================================================= */}
                  <div style={{ padding: '1.25rem', flex: 1 }}>
                    {/* Dishes List */}
                    <div
                      style={{
                        backgroundColor: '#0D1017',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem 1rem',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '1rem'
                      }}
                    >
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '0.75rem',
                              padding: '0.5rem 0',
                              borderBottom:
                                idx < order.items.length - 1
                                  ? '1px dashed rgba(62, 70, 94, 0.6)'
                                  : 'none'
                            }}
                          >
                            {/* Bold Large Quantity for distance visibility */}
                            <span
                              style={{
                                fontSize: '1.35rem',
                                fontWeight: '900',
                                color: 'var(--accent-gold)',
                                minWidth: '2rem',
                                lineHeight: 1
                              }}
                            >
                              {item.quantity}×
                            </span>
                            <span
                              style={{
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                color: '#FFFFFF',
                                lineHeight: 1.3
                              }}
                            >
                              {item.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dietary Tags (Vegan, Halal, Gluten-Free) */}
                    {order.dietary && order.dietary.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        {order.dietary.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: 'var(--accent-emerald)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-full)'
                            }}
                          >
                            🌿 {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Special Chef Instructions Callout */}
                    {order.specialNotes && (
                      <div
                        style={{
                          fontSize: '0.85rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          borderLeft: '4px solid var(--accent-amber)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          color: '#F8FAFC'
                        }}
                      >
                        <strong style={{ color: 'var(--accent-amber)' }}>Chef Note: </strong>
                        {order.specialNotes}
                      </div>
                    )}
                  </div>

                  {/* ======================================================= */}
                  {/* CARD FOOTER: State Machine Action Controls              */}
                  {/* ======================================================= */}
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: '#0F131C',
                      display: 'flex',
                      gap: '0.75rem'
                    }}
                  >
                    {isPlaced && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'var(--accent-amber)',
                          color: '#0B0D11',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem',
                          fontSize: '1rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        <Flame size={18} />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'var(--accent-emerald)',
                          color: '#0B0D11',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem',
                          fontSize: '1rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <Bell size={18} />
                        <span>Mark as Ready</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'var(--accent-gold)',
                          color: '#0B0D11',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem',
                          fontSize: '1rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
                        }}
                      >
                        <CheckCircle2 size={18} />
                        <span>Dispatch & Serve</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ↩ Reopen Ticket
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenLayout;
