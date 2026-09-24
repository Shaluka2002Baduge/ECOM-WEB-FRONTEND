import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Utensils,
  Boxes,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuService, FALLBACK_MENU_ITEMS } from '../services/menuService';
import { formatCurrency } from '../utils/currency';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';

/**
 * Dedicated Full-Height SaaS Admin Layout
 * Completely isolated from Customer Navbar & Footer.
 * Features:
 * - Sleek, fixed/collapsible dark luxury sidebar
 * - Dedicated Top Header with Admin title, logged-in admin email, and direct Logout
 * - Dynamic content area without full-page reloads:
 *   1. Menu Management (Utensils)
 *   2. Inventory & Stock (Boxes)
 *   3. Reservations & Table Management (CalendarDays)
 *   4. Staff & Role Clearance (ShieldCheck)
 *   5. Financial & Sales Reports (TrendingUp)
 */
export const AdminLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  // Active section state: 'menu' | 'inventory' | 'reservations' | 'staff' | 'reports'
  const [activeSection, setActiveSection] = useState('menu');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep live time clock updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Navigation Items with Icons from lucide-react
  const navItems = [
    {
      id: 'menu',
      label: 'Menu Management',
      icon: Utensils,
      description: 'Dishes, pricing & availability'
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Boxes,
      description: 'Pantry tracking & raw materials'
    },
    {
      id: 'reservations',
      label: 'Reservations & Tables',
      icon: CalendarDays,
      description: 'Floor plan, seating & guest bookings'
    },
    {
      id: 'staff',
      label: 'Staff & Role Clearance',
      icon: ShieldCheck,
      description: 'RBAC permissions & team roster'
    },
    {
      id: 'reports',
      label: 'Financial & Reports',
      icon: TrendingUp,
      description: 'Sales velocity, revenue & analytics'
    }
  ];

  // =========================================================================
  // 1. MENU MANAGEMENT STATE & ACTIONS
  // =========================================================================
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Mains',
    price: '',
    description: '',
    spiceLevel: 2,
    dietary: '',
    available: true
  });

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await menuService.getMenuItems();
        setMenuItems(items);
      } catch {
        setMenuItems(FALLBACK_MENU_ITEMS);
      }
    };
    loadMenu();
  }, []);

  const handleToggleDishAvailability = (dishId) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === dishId ? { ...item, available: !item.available } : item
      )
    );
    setNotification({
      type: 'info',
      title: 'Menu Updated',
      message: 'Dish availability status toggled successfully.'
    });
  };

  const handleDeleteDish = (dishId) => {
    if (window.confirm('Are you sure you want to remove this dish from the active menu?')) {
      setMenuItems((prev) => prev.filter((item) => item.id !== dishId));
      setNotification({
        type: 'success',
        title: 'Dish Deleted',
        message: 'The dish has been removed from the royal menu.'
      });
    }
  };

  const handleOpenDishModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        name: dish.name,
        category: dish.category,
        price: dish.price,
        description: dish.description,
        spiceLevel: dish.spiceLevel || 2,
        dietary: Array.isArray(dish.dietary) ? dish.dietary.join(', ') : '',
        available: dish.available ?? true
      });
    } else {
      setEditingDish(null);
      setDishForm({
        name: '',
        category: 'Mains',
        price: '',
        description: '',
        spiceLevel: 2,
        dietary: '',
        available: true
      });
    }
    setIsDishModalOpen(true);
  };

  const handleSaveDish = (e) => {
    e.preventDefault();
    const dietaryArr = dishForm.dietary
      ? dishForm.dietary.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (editingDish) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingDish.id
            ? {
                ...item,
                ...dishForm,
                price: Number(dishForm.price),
                spiceLevel: Number(dishForm.spiceLevel),
                dietary: dietaryArr
              }
            : item
        )
      );
      setNotification({
        type: 'success',
        title: 'Dish Updated',
        message: `${dishForm.name} updated successfully.`
      });
    } else {
      const newDish = {
        id: 'raalahami-' + Date.now(),
        ...dishForm,
        price: Number(dishForm.price),
        spiceLevel: Number(dishForm.spiceLevel),
        dietary: dietaryArr,
        imageUrl:
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
      };
      setMenuItems((prev) => [newDish, ...prev]);
      setNotification({
        type: 'success',
        title: 'Dish Created',
        message: `${dishForm.name} published to menu.`
      });
    }
    setIsDishModalOpen(false);
  };

  const filteredDishes = menuItems.filter((dish) => {
    const matchCat = selectedCategory === 'All' || dish.category === selectedCategory;
    const matchSearch =
      dish.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      dish.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // =========================================================================
  // 2. INVENTORY & STOCK MANAGEMENT STATE & ACTIONS
  // =========================================================================
  const [inventoryItems, setInventoryItems] = useState([
    { id: 'inv-1', name: 'Fragrant Samba Heritage Rice', category: 'Grains', stock: 120, unit: 'kg', threshold: 40, supplier: 'Polonnaruwa Organic Mills' },
    { id: 'inv-2', name: 'Fresh Blue Swimmer Lagoon Mud Crab', category: 'Seafood', stock: 18, unit: 'kg', threshold: 25, supplier: 'Negombo Coastal Co-op' },
    { id: 'inv-3', name: 'Pasture-Raised Black Pork Belly', category: 'Meat', stock: 45, unit: 'kg', threshold: 20, supplier: 'Central Highlands Farm' },
    { id: 'inv-4', name: 'Raw Sri Lankan Whole Cashew Nuts', category: 'Nuts & Seeds', stock: 12, unit: 'kg', threshold: 15, supplier: 'Puttalam Estate' },
    { id: 'inv-5', name: 'Charred & Cured Banana Leaves', category: 'Packaging', stock: 350, unit: 'leaves', threshold: 100, supplier: 'Gampaha Growers' },
    { id: 'inv-6', name: 'Pure Kitul Treacle & Jaggery', category: 'Sweeteners', stock: 28, unit: 'bottles', threshold: 10, supplier: 'Sinharaja Rainforest Guild' },
    { id: 'inv-7', name: 'Fresh Coconut Cream (Fresh Cold Pressed)', category: 'Dairy/Oils', stock: 65, unit: 'liters', threshold: 30, supplier: 'Kurunegala Coconut Triangle' },
    { id: 'inv-8', name: 'Traditional Roasted Jaffna Curry Blend', category: 'Spices', stock: 8, unit: 'kg', threshold: 10, supplier: 'Jaffna Heritage Spices' }
  ]);

  const handleAdjustStock = (itemId, delta) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stock + delta);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  // =========================================================================
  // 3. RESERVATIONS & TABLE MANAGEMENT STATE & ACTIONS
  // =========================================================================
  const [tables, setTables] = useState([
    { id: 'T1', name: 'Table 1', area: 'Courtyard Garden', capacity: 2, status: 'AVAILABLE', currentBooking: null },
    { id: 'T2', name: 'Table 2', area: 'Royal Saloon', capacity: 4, status: 'OCCUPIED', currentBooking: 'KOT-102 (4 guests)' },
    { id: 'T3', name: 'Table 3', area: 'Lagoon Terrace', capacity: 4, status: 'RESERVED', currentBooking: '7:30 PM • Senaka B. (3 guests)' },
    { id: 'T4', name: 'Table 4', area: 'Private Verandah', capacity: 6, status: 'AVAILABLE', currentBooking: null },
    { id: 'T5', name: 'Table 5', area: 'Maharaja VIP Suite', capacity: 8, status: 'RESERVED', currentBooking: '8:00 PM • Embassy Delegation (8 guests)' },
    { id: 'T6', name: 'Table 6', area: 'Courtyard Garden', capacity: 2, status: 'OCCUPIED', currentBooking: 'KOT-101 (2 guests)' },
    { id: 'T7', name: 'Table 7', area: 'Main Dining Hall', capacity: 4, status: 'TURNOVER', currentBooking: 'Sanitizing for next service' },
    { id: 'T8', name: 'Table 8', area: 'Main Dining Hall', capacity: 4, status: 'AVAILABLE', currentBooking: null }
  ]);

  const [tableFilter, setTableFilter] = useState('ALL');

  const [reservations, setReservations] = useState([
    { id: 'RES-301', guest: 'Dr. Senaka Bandara', phone: '+94 77 345 6789', table: 'Table 3', guests: 3, time: '7:30 PM', area: 'Lagoon Terrace', notes: 'Anniversary celebration; quiet corner preferred', status: 'CONFIRMED' },
    { id: 'RES-302', guest: 'Ambassadorial Office', phone: '+94 11 234 5678', table: 'Table 5', guests: 8, time: '8:00 PM', area: 'Maharaja VIP Suite', notes: 'Diplomatic protocol; Halal Lamprais requested', status: 'CONFIRMED' },
    { id: 'RES-303', guest: 'Kavindi Jayawardena', phone: '+94 71 890 1234', table: 'Table 4', guests: 5, time: '8:30 PM', area: 'Private Verandah', notes: 'Birthday party; bring out Watalappan with candle', status: 'CONFIRMED' },
    { id: 'RES-304', guest: 'Tariq Mansoor', phone: '+94 76 543 2109', table: 'Table 2', guests: 4, time: '6:30 PM', area: 'Royal Saloon', notes: 'Seated & dining (Order #RAL-839211)', status: 'SEATED' }
  ]);

  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resForm, setResForm] = useState({
    guest: '',
    phone: '',
    table: 'Table 1',
    guests: 2,
    time: '7:00 PM',
    notes: ''
  });

  const handleCreateReservation = (e) => {
    e.preventDefault();
    const newRes = {
      id: 'RES-' + Math.floor(305 + Math.random() * 600),
      guest: resForm.guest,
      phone: resForm.phone,
      table: resForm.table,
      guests: Number(resForm.guests),
      time: resForm.time,
      area: tables.find((t) => t.name === resForm.table)?.area || 'Main Dining',
      notes: resForm.notes || 'Standard booking',
      status: 'CONFIRMED'
    };

    setReservations((prev) => [newRes, ...prev]);

    // Update table status
    setTables((prev) =>
      prev.map((t) =>
        t.name === resForm.table
          ? { ...t, status: 'RESERVED', currentBooking: `${resForm.time} • ${resForm.guest} (${resForm.guests}p)` }
          : t
      )
    );

    setIsResModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Table Reserved',
      message: `Reservation confirmed for ${resForm.guest} at ${resForm.table}.`
    });
  };

  const handleUpdateTableStatus = (tableId, newStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t))
    );
  };

  const handleUpdateResStatus = (resId, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
    );
  };

  const filteredTables = tables.filter((t) => {
    if (tableFilter === 'ALL') return true;
    return t.status === tableFilter;
  });

  // =========================================================================
  // 4. STAFF PRIVILEGES & RBAC STATE & ACTIONS
  // =========================================================================
  const [staffMembers, setStaffMembers] = useState([
    { id: 'st-1', name: 'Duminda Alwis', email: 'admin@raalahami.lk', role: 'ADMIN', department: 'Executive Management', status: 'Active Shift' },
    { id: 'st-2', name: 'Nimalka Perera', email: 'kitchen@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Hot Line & Curry Station', status: 'Active Shift' },
    { id: 'st-3', name: 'Samantha Jayasinghe', email: 'samantha.chef@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Seafood & Grill Station', status: 'Active Shift' },
    { id: 'st-4', name: 'Kasun Bandara', email: 'kasun.manager@raalahami.lk', role: 'MANAGER', department: 'Dining Hall & Reservations', status: 'Active Shift' },
    { id: 'st-5', name: 'Roshan Silva', email: 'roshan.kitchen@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Hopper & Prep Station', status: 'Off Duty' }
  ]);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'KITCHEN_STAFF',
    department: 'Culinary Operations'
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    const newStaff = {
      id: 'st-' + Date.now(),
      ...staffForm,
      status: 'Active Shift'
    };
    setStaffMembers((prev) => [newStaff, ...prev]);
    setIsStaffModalOpen(false);
    setNotification({
      type: 'success',
      title: 'Staff Member Added',
      message: `${staffForm.name} assigned role ${staffForm.role} with backend RBAC credentials.`
    });
  };

  const handleUpdateStaffRole = (staffId, newRole) => {
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
    );
    setNotification({
      type: 'info',
      title: 'Role Privileges Updated',
      message: 'Staff clearance level modified.'
    });
  };

  return (
    <div
      className="admin-saas-layout"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      {/* =================================================================== */}
      {/* 1. DEDICATED DARK LUXURY ADMIN SIDEBAR                              */}
      {/* =================================================================== */}
      <aside
        className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '270px',
          flexShrink: 0,
          backgroundColor: '#0F1219',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 950,
          transition: 'transform 0.25s ease-in-out'
        }}
      >
        {/* Brand Crest Header */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--accent-gold), #8A6D1F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B0D11',
                fontFamily: 'var(--font-serif)',
                fontWeight: '800',
                fontSize: '1.25rem',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.35)'
              }}
            >
              R
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  letterSpacing: '0.05em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1
                }}
              >
                RAALAHAMI
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--accent-gold)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}
              >
                Admin Suite v2.0
              </div>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            className="mobile-close-sidebar"
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'none',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav
          aria-label="Admin Navigation"
          style={{
            padding: '1rem 0.75rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              padding: '0.5rem 0.75rem',
              fontWeight: '700'
            }}
          >
            Management Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
              >
                <Icon
                  size={19}
                  style={{
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isActive ? '700' : '500', fontSize: '0.9rem', lineHeight: 1.2 }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: isActive ? 'rgba(212, 175, 55, 0.8)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Patron Portal link & Admin identity pill */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: '#0B0D11',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {/* Quick link to public website */}
          <Link
            to="/menu"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span>Preview Patron Menu</span>
            <ExternalLink size={14} />
          </Link>

          {/* Current Admin user pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-gold-muted)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'System Admin'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>
                Role: {role || 'ADMIN'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 940
          }}
        />
      )}

      {/* =================================================================== */}
      {/* 2. MAIN ADMIN CONTENT CONTAINER                                     */}
      {/* =================================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Header of the Admin Layout */}
        <header
          style={{
            height: '4.25rem',
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 900
          }}
        >
          {/* Mobile hamburger & Module Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center'
              }}
              aria-label="Open Admin Menu"
            >
              <MenuIcon size={20} />
            </button>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Raalahami Operations
              </div>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>
                {navItems.find((n) => n.id === activeSection)?.label}
              </h1>
            </div>
          </div>

          {/* Right Header Controls: Time, Admin Email, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Live Clock */}
            <div
              className="admin-clock"
              style={{
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Clock size={14} />
              {currentTime.toLocaleTimeString()}
            </div>

            {/* Logged in Admin Profile */}
            <div
              className="admin-badge-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Signed in:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {user?.email || 'admin@raalahami.lk'}
              </strong>
              <span className="badge badge-gold">
                {role || 'ADMIN'}
              </span>
            </div>

            {/* Clean Direct Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
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
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Sign out of Admin Session"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
            <Alert
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onDismiss={() => setNotification(null)}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. DYNAMIC CONTENT AREA (Renders activeSection)                    */}
        {/* ================================================================= */}
        <main style={{ flex: 1, padding: '1.75rem' }}>
          {/* =============================================================== */}
          {/* VIEW 1: MENU MANAGEMENT                                         */}
          {/* =============================================================== */}
          {activeSection === 'menu' && (
            <section aria-label="Menu Management" className="fade-in">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, maxWidth: '650px' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search culinary dishes by name or description..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {['All', 'Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="primary" onClick={() => handleOpenDishModal(null)}>
                  <Plus size={16} style={{ marginRight: '0.4rem' }} />
                  Add New Royal Dish
                </Button>
              </div>

              {/* Menu Table */}
              <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Dish</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Spice</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDishes.map((dish) => (
                      <tr
                        key={dish.id}
                        style={{
                          borderBottom: '1px solid rgba(42, 48, 66, 0.4)',
                          opacity: dish.available ? 1 : 0.65
                        }}
                      >
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={dish.imageUrl}
                              alt=""
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: 'var(--radius-sm)',
                                objectFit: 'cover'
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{dish.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {Array.isArray(dish.dietary) ? dish.dietary.join(' • ') : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}>
                            {dish.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                          {formatCurrency(dish.price)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}>
                          {'🌶️'.repeat(dish.spiceLevel || 0) || 'None'}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleDishAvailability(dish.id)}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: dish.available ? 'var(--accent-emerald-muted)' : 'var(--accent-danger-muted)',
                              color: dish.available ? 'var(--accent-emerald)' : 'var(--accent-danger)'
                            }}
                          >
                            {dish.available ? '● Available' : '○ 86-ed (Sold Out)'}
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDishModal(dish)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-medium)',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(dish.id)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--accent-danger)',
                                color: 'var(--accent-danger)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =============================================================== */}
          {/* VIEW 2: INVENTORY & STOCK                                       */}
          {/* =============================================================== */}
          {activeSection === 'inventory' && (
            <section aria-label="Inventory Management" className="fade-in">
              {inventoryItems.some((i) => i.stock <= i.threshold) && (
                <div
                  style={{
                    backgroundColor: 'var(--accent-danger-muted)',
                    border: '1px solid var(--accent-danger)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <AlertTriangle size={24} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
                  <div>
                    <strong>Low Inventory Warning:</strong> Crucial kitchen ingredients are below minimum threshold levels. Immediate restocking recommended.
                  </div>
                </div>
              )}

              <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Raw Ingredient</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Current Stock</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Threshold</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Stock Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => {
                      const isLow = item.stock <= item.threshold;
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{item.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier: {item.supplier}</span>
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {item.category}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: '700', color: isLow ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                            {item.stock} {item.unit}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Min {item.threshold} {item.unit}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isLow ? 'var(--accent-danger-muted)' : 'var(--accent-emerald-muted)',
                                color: isLow ? 'var(--accent-danger)' : 'var(--accent-emerald)',
                                border: `1px solid ${isLow ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                              }}
                            >
                              {isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.id, -5)}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-medium)',
                                  color: 'var(--text-primary)',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer'
                                }}
                                title="Decrease 5 units"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.id, 10)}
                                style={{
                                  padding: '0.2rem 0.6rem',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--accent-gold)',
                                  color: 'var(--accent-gold)',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600'
                                }}
                                title="Restock +10 units"
                              >
                                +10 Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =============================================================== */}
          {/* VIEW 3: RESERVATIONS & TABLE MANAGEMENT                         */}
          {/* =============================================================== */}
          {activeSection === 'reservations' && (
            <section aria-label="Reservations and Table Management" className="fade-in">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Restaurant Floor Plan & Bookings</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Monitor live dining tables, active seatings, and guest reservations.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="primary" onClick={() => setIsResModalOpen(true)}>
                    <Plus size={16} style={{ marginRight: '0.4rem' }} />
                    Book New Table
                  </Button>
                </div>
              </div>

              {/* Table Status Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                {[
                  { id: 'ALL', label: `All Tables (${tables.length})` },
                  { id: 'AVAILABLE', label: `Available (${tables.filter((t) => t.status === 'AVAILABLE').length})` },
                  { id: 'OCCUPIED', label: `Occupied (${tables.filter((t) => t.status === 'OCCUPIED').length})` },
                  { id: 'RESERVED', label: `Reserved (${tables.filter((t) => t.status === 'RESERVED').length})` },
                  { id: 'TURNOVER', label: `Turnover (${tables.filter((t) => t.status === 'TURNOVER').length})` }
                ].map((pill) => {
                  const isSel = tableFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setTableFilter(pill.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: isSel ? '700' : '500',
                        backgroundColor: isSel ? 'var(--accent-gold)' : 'var(--bg-surface)',
                        color: isSel ? '#0B0D11' : 'var(--text-secondary)',
                        border: '1px solid',
                        borderColor: isSel ? 'var(--accent-gold)' : 'var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {/* Visual Floor Plan Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}
              >
                {filteredTables.map((t) => {
                  const isAvail = t.status === 'AVAILABLE';
                  const isOcc = t.status === 'OCCUPIED';
                  const isRes = t.status === 'RESERVED';

                  const borderColor = isAvail
                    ? 'var(--accent-emerald)'
                    : isOcc
                    ? 'var(--accent-amber)'
                    : isRes
                    ? 'var(--accent-info)'
                    : 'var(--text-muted)';

                  return (
                    <div
                      key={t.id}
                      className="glass-panel"
                      style={{
                        padding: '1rem',
                        borderTop: `4px solid ${borderColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t.name}</strong>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: isAvail ? 'var(--accent-emerald-muted)' : isOcc ? 'var(--accent-amber-muted)' : 'rgba(59, 130, 246, 0.15)',
                              color: isAvail ? 'var(--accent-emerald)' : isOcc ? 'var(--accent-amber)' : 'var(--accent-info)'
                            }}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {t.area} • Capacity: {t.capacity} Guests
                        </div>
                        {t.currentBooking && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.5rem',
                              backgroundColor: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              marginBottom: '0.75rem'
                            }}
                          >
                            {t.currentBooking}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTableStatus(t.id, e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="AVAILABLE">Mark Available</option>
                          <option value="OCCUPIED">Mark Occupied</option>
                          <option value="RESERVED">Mark Reserved</option>
                          <option value="TURNOVER">Mark Turnover</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirmed Reservations Table */}
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Active Guest Booking Directory</h3>
              <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Guest Name</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Table</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Time</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Party</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Notes</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{res.guest}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.phone}</span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: '600' }}>
                          {res.table}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}>
                          {res.time}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}>
                          {res.guests} Guests
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
                          {res.notes}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: res.status === 'SEATED' ? 'var(--accent-amber-muted)' : 'var(--accent-emerald-muted)',
                              color: res.status === 'SEATED' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                            }}
                          >
                            ● {res.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {res.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateResStatus(res.id, 'SEATED')}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: 'var(--accent-amber)',
                                  color: '#0B0D11',
                                  border: 'none',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  fontWeight: '600'
                                }}
                              >
                                Seat Guest
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateResStatus(res.id, 'COMPLETED')}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                backgroundColor: 'transparent',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              Complete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =============================================================== */}
          {/* VIEW 4: STAFF & ROLE CLEARANCE                                  */}
          {/* =============================================================== */}
          {activeSection === 'staff' && (
            <section aria-label="Staff Management" className="fade-in">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Staff Credential & RBAC Directory</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Manage authorization privileges for ADMIN, KITCHEN_STAFF, and MANAGER roles.
                  </p>
                </div>
                <Button variant="primary" onClick={() => setIsStaffModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '0.4rem' }} />
                  Register New Staff Member
                </Button>
              </div>

              <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Staff Member</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Department</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>RBAC Role</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Shift Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Clearance Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{staff.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {staff.department}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <select
                            value={staff.role}
                            onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.6rem',
                              backgroundColor: 'var(--bg-secondary)',
                              color: staff.role === 'ADMIN' ? 'var(--accent-gold)' : staff.role === 'KITCHEN_STAFF' ? 'var(--accent-amber)' : 'var(--text-primary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="KITCHEN_STAFF">KITCHEN_STAFF</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: staff.status === 'Active Shift' ? 'var(--accent-emerald-muted)' : 'var(--bg-surface)',
                              color: staff.status === 'Active Shift' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {staff.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {staff.role === 'ADMIN' ? 'Tier 1 (Master Privileges)' : staff.role === 'KITCHEN_STAFF' ? 'Tier 2 (KDS / Prep Only)' : 'Standard'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =============================================================== */}
          {/* VIEW 5: FINANCIAL & SALES REPORTS                               */}
          {/* =============================================================== */}
          {activeSection === 'reports' && (
            <section aria-label="Financial and Sales Reports" className="fade-in">
              {/* KPI Summary Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}
              >
                {[
                  { title: "Today's Gross Sales", value: 'LKR 248,500', note: '+14.2% vs yesterday', color: 'var(--accent-gold)' },
                  { title: 'Total Orders Placed', value: '84 Orders', note: 'Average 12/hour', color: 'var(--accent-emerald)' },
                  { title: 'Average Ticket Value', value: 'LKR 2,958', note: 'Fine dining metric', color: 'var(--accent-info)' },
                  { title: 'Table Occupancy', value: '18 / 22 Tables', note: '82% capacity tonight', color: 'var(--accent-amber)' }
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      borderLeft: `4px solid ${kpi.color}`
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      {kpi.title}
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: '600' }}>
                      {kpi.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Breakdown & Velocity Rankings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Culinary Revenue by Category</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { category: 'Mains & Lamprais', percentage: 45, revenue: 111825, color: 'var(--accent-gold)' },
                      { category: 'Lagoon Seafood', percentage: 30, revenue: 74550, color: 'var(--accent-info)' },
                      { category: 'Starters & Hoppers', percentage: 15, revenue: 37275, color: 'var(--accent-amber)' },
                      { category: 'Royal Desserts & Sweets', percentage: 10, revenue: 24850, color: 'var(--accent-emerald)' }
                    ].map((cat, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{cat.category}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(cat.revenue)} ({cat.percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${cat.percentage}%`,
                              height: '100%',
                              backgroundColor: cat.color,
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Top Velocity Culinary Dishes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[
                      { rank: 1, name: 'Royal Dutch Burgher Lamprais', count: 42, rev: 'LKR 77,700' },
                      { rank: 2, name: 'Jaffna Spiced Mud Crab Curry', count: 28, rev: 'LKR 106,400' },
                      { rank: 3, name: 'Royal Heritage Watalappan', count: 35, rev: 'LKR 29,750' },
                      { rank: 4, name: 'Slow-Cooked Black Pork Curry', count: 24, rev: 'LKR 52,800' }
                    ].map((dish) => (
                      <div
                        key={dish.rank}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: dish.rank === 1 ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                              color: dish.rank === 1 ? '#0B0D11' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '0.75rem'
                            }}
                          >
                            {dish.rank}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {dish.name}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                            {dish.rev}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {dish.count} sold
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* 4. MODALS: ADD/EDIT DISH, BOOK TABLE, REGISTER STAFF               */}
      {/* =================================================================== */}

      {/* Modal: Add/Edit Dish */}
      <Modal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        title={editingDish ? 'Edit Royal Dish' : 'Create New Menu Dish'}
      >
        <form onSubmit={handleSaveDish}>
          <Input
            label="Dish Name"
            value={dishForm.name}
            onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
            placeholder="e.g. Negombo Lagoon Crab"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                value={dishForm.category}
                onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              >
                {['Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price (LKR)"
              type="number"
              value={dishForm.price}
              onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
              placeholder="2200"
              required
            />
          </div>

          <Input
            label="Description"
            value={dishForm.description}
            onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
            placeholder="Aromatic spices, ingredients and cooking heritage..."
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Spice Level (0 to 5)"
              type="number"
              min="0"
              max="5"
              value={dishForm.spiceLevel}
              onChange={(e) => setDishForm({ ...dishForm, spiceLevel: e.target.value })}
            />

            <Input
              label="Dietary Tags (comma-separated)"
              value={dishForm.dietary}
              onChange={(e) => setDishForm({ ...dishForm, dietary: e.target.value })}
              placeholder="Halal, Gluten-Free"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDishModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDish ? 'Update Dish' : 'Publish Dish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Book Table Reservation */}
      <Modal
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        title="Create Table Reservation"
      >
        <form onSubmit={handleCreateReservation}>
          <Input
            label="Guest Full Name"
            value={resForm.guest}
            onChange={(e) => setResForm({ ...resForm, guest: e.target.value })}
            placeholder="e.g. Hon. Tilak Wickremasinghe"
            required
          />

          <Input
            label="Contact Mobile"
            type="tel"
            value={resForm.phone}
            onChange={(e) => setResForm({ ...resForm, phone: e.target.value })}
            placeholder="+94 77 123 4567"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Assigned Table
              </label>
              <select
                value={resForm.table}
                onChange={(e) => setResForm({ ...resForm, table: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              >
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.name}>
                    {tbl.name} ({tbl.area} - {tbl.capacity}p)
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Number of Guests"
              type="number"
              min="1"
              max="20"
              value={resForm.guests}
              onChange={(e) => setResForm({ ...resForm, guests: e.target.value })}
              required
            />
          </div>

          <Input
            label="Reservation Time"
            value={resForm.time}
            onChange={(e) => setResForm({ ...resForm, time: e.target.value })}
            placeholder="e.g. 7:30 PM"
            required
          />

          <Input
            label="Special Dietary or Seating Notes"
            value={resForm.notes}
            onChange={(e) => setResForm({ ...resForm, notes: e.target.value })}
            placeholder="e.g. Anniversary dinner, window view requested"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsResModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Register Staff Member */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Assign New Staff Privileges"
      >
        <form onSubmit={handleAddStaff}>
          <Input
            label="Staff Full Name"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            placeholder="e.g. Chandana Wickramasinghe"
            required
          />

          <Input
            label="Staff Email Address"
            type="email"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            placeholder="e.g. chandana.chef@raalahami.lk"
            required
          />

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              RBAC Security Role
            </label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="KITCHEN_STAFF">KITCHEN_STAFF (Kitchen Display & Prep)</option>
              <option value="ADMIN">ADMIN (Full Operational Control)</option>
              <option value="MANAGER">MANAGER (Dining & Floor Supervision)</option>
              <option value="CUSTOMER">CUSTOMER (Patron Access)</option>
            </select>
          </div>

          <Input
            label="Department / Assigned Station"
            value={staffForm.department}
            onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
            placeholder="e.g. Seafood & Lamprais Line"
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Staff Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Responsive Styles for Sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .mobile-hamburger {
            display: inline-flex !important;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
          .admin-clock {
            display: none !important;
          }
          .admin-badge-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
