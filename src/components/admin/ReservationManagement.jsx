import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Users,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  Layers,
  Check,
  UserCheck,
  LogOut,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../api/apiClient';
import Button from '../common/Button';
import ReservationModal from './ReservationModal';

// 3 Distinct Halls with 4 Tables in Each (12 Total Tables)
const INITIAL_HALL_STRUCTURE = [
  {
    id: 'hall-royal',
    name: 'Royal Dining Hall',
    description: 'Main Grand Courtyard & Heirloom Dining Area',
    tables: [
      { id: 'RDH-1', name: 'Table 1', hall: 'Royal Dining Hall', capacity: 2, status: 'AVAILABLE', currentBooking: null },
      { id: 'RDH-2', name: 'Table 2', hall: 'Royal Dining Hall', capacity: 4, status: 'AVAILABLE', currentBooking: null },
      { id: 'RDH-3', name: 'Table 3', hall: 'Royal Dining Hall', capacity: 4, status: 'AVAILABLE', currentBooking: null },
      { id: 'RDH-4', name: 'Table 4', hall: 'Royal Dining Hall', capacity: 6, status: 'AVAILABLE', currentBooking: null }
    ]
  },
  {
    id: 'hall-balcony',
    name: 'Balcony Court',
    description: 'Open-Air Verandah with Panoramic Coastal Views',
    tables: [
      { id: 'BC-1', name: 'Table 1', hall: 'Balcony Court', capacity: 2, status: 'AVAILABLE', currentBooking: null },
      { id: 'BC-2', name: 'Table 2', hall: 'Balcony Court', capacity: 4, status: 'AVAILABLE', currentBooking: null },
      { id: 'BC-3', name: 'Table 3', hall: 'Balcony Court', capacity: 4, status: 'AVAILABLE', currentBooking: null },
      { id: 'BC-4', name: 'Table 4', hall: 'Balcony Court', capacity: 6, status: 'AVAILABLE', currentBooking: null }
    ]
  },
  {
    id: 'hall-suite',
    name: 'Private Suite',
    description: 'Exclusive Maharaja Dining Chamber with VIP Butler Protocol',
    tables: [
      { id: 'PS-1', name: 'Table 1', hall: 'Private Suite', capacity: 4, status: 'AVAILABLE', currentBooking: null },
      { id: 'PS-2', name: 'Table 2', hall: 'Private Suite', capacity: 6, status: 'AVAILABLE', currentBooking: null },
      { id: 'PS-3', name: 'Table 3', hall: 'Private Suite', capacity: 8, status: 'AVAILABLE', currentBooking: null },
      { id: 'PS-4', name: 'Table 4', hall: 'Private Suite', capacity: 10, status: 'AVAILABLE', currentBooking: null }
    ]
  }
];

export const ReservationManagement = ({ onNotify }) => {
  const [halls, setHalls] = useState(INITIAL_HALL_STRUCTURE);
  const [reservations, setReservations] = useState([]);
  const [tableFilter, setTableFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to get persisted deleted reservation IDs across page refreshes
  const getPersistedDeletedIds = () => {
    try {
      const stored = localStorage.getItem('ralahami_deleted_reservation_ids');
      if (stored) return new Set(JSON.parse(stored));
    } catch (ignore) {}
    return new Set();
  };

  // Set of deleted IDs to prevent background polling & refresh from resurrecting deleted bookings
  const deletedReservationIdsRef = useRef(getPersistedDeletedIds());

  const persistDeletedId = useCallback((id) => {
    if (!id) return;
    deletedReservationIdsRef.current.add(String(id));
    try {
      localStorage.setItem(
        'ralahami_deleted_reservation_ids',
        JSON.stringify(Array.from(deletedReservationIdsRef.current))
      );
    } catch (ignore) {}
  }, []);

  const isRecordDeleted = useCallback((r) => {
    if (!r) return true;
    const deletedSet = deletedReservationIdsRef.current;
    if (r.id && deletedSet.has(String(r.id))) return true;
    if (r.order_id && deletedSet.has(String(r.order_id))) return true;
    if (r.order_number && deletedSet.has(String(r.order_number))) return true;
    if (r.orderId && deletedSet.has(String(r.orderId))) return true;
    if (r.reservation_id && deletedSet.has(String(r.reservation_id))) return true;
    if (r._id && deletedSet.has(String(r._id))) return true;
    return false;
  }, []);

  // Helper notification dispatcher
  const notify = useCallback(
    (type, title, message) => {
      setToastMessage({ type, title, message });
      setTimeout(() => setToastMessage(null), 4000);
      if (onNotify) {
        onNotify({ type, title, message });
      }
    },
    [onNotify]
  );

  // Helper: flatten all 12 tables for modals and lookup
  const allTablesList = halls.flatMap((h) => h.tables);

  // Synchronize 3-hall table states with active reservations list
  const syncHallsWithReservations = useCallback((resList, currentHalls) => {
    return currentHalls.map((hall) => {
      const updatedTables = hall.tables.map((tbl) => {
        // Find matching active booking for this specific hall and table
        const activeBooking = resList.find((r) => {
          if (isRecordDeleted(r)) return false;

          const resHall = r.hall || r.area || r.seatingPreference || r.seating_preference || 'Royal Dining Hall';
          const resTable = r.table || r.assignedTable || r.table_number || r.tableNumber || '';

          const hallMatch =
            resHall.toLowerCase().includes(hall.name.toLowerCase()) ||
            hall.name.toLowerCase().includes(resHall.toLowerCase());
          const tableMatch =
            resTable === tbl.name ||
            resTable === tbl.id ||
            resTable.toLowerCase() === tbl.name.toLowerCase() ||
            resTable === tbl.name.replace('Table ', '');

          return (
            hallMatch &&
            tableMatch &&
            r.status !== 'CANCELLED' &&
            r.status !== 'COMPLETED' &&
            r.status !== 'DEPARTED'
          );
        });

        if (activeBooking) {
          const patronName =
            activeBooking.patron_name ||
            activeBooking.customer_name ||
            activeBooking.customerName ||
            activeBooking.guest ||
            activeBooking.recipientName ||
            'Royal Patron';

          const orderId =
            activeBooking.order_number ||
            activeBooking.order_id ||
            activeBooking.orderId ||
            (activeBooking.isCheckoutOrder ? activeBooking.id : null);

          const timeSlot =
            activeBooking.time ||
            activeBooking.timeSlot ||
            activeBooking.time_slot ||
            '19:30';

          const partyCount =
            activeBooking.guests ||
            activeBooking.partySize ||
            activeBooking.party_size ||
            2;

          const bookingDetails = {
            patron_name: patronName,
            order_id: orderId,
            time: timeSlot,
            party_size: partyCount
          };

          if (activeBooking.status === 'SEATED' || activeBooking.status === 'OCCUPIED') {
            return {
              ...tbl,
              status: 'OCCUPIED',
              reservation: activeBooking,
              bookingDetails,
              currentBooking: `Seated • ${patronName} (${partyCount} Guests)`
            };
          }
          return {
            ...tbl,
            status: 'RESERVED',
            reservation: activeBooking,
            bookingDetails,
            currentBooking: `${timeSlot} • ${patronName} (${partyCount} Guests)`
          };
        }

        // If not matched to an active reservation, release to AVAILABLE
        return { ...tbl, status: 'AVAILABLE', currentBooking: null, bookingDetails: null, reservation: null };
      });

      return { ...hall, tables: updatedTables };
    });
  }, [isRecordDeleted]);

  // Fetch live API data from /api/reservations and incoming checkout Dine-In orders
  const fetchLiveReservations = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsRefreshing(true);
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';

      try {
        let fetchedList = [];

        // 1. Fetch from GET /api/reservations
        try {
          const resResp = await axios.get(`${apiBase}/reservations`).catch(async () => {
            return await apiClient.get('/reservations');
          });
          const resData = resResp?.data?.data || resResp?.data;
          if (Array.isArray(resData)) {
            fetchedList = resData
              .filter((r) => !isRecordDeleted(r) && r.status !== 'CANCELLED')
              .map((r) => {
                const patronName =
                  r.patron_name ||
                  r.customer_name ||
                  r.customerName ||
                  r.guest ||
                  r.recipientName ||
                  r.name ||
                  'Royal Patron';
                const orderId = r.order_number || r.order_id || r.orderId || r.orderNumber || null;
                return {
                  ...r,
                  id: r.id || r._id,
                  order_number: r.order_number || orderId,
                  patron_name: patronName,
                  customer_name: patronName,
                  guest: patronName,
                  order_id: orderId,
                  orderId: orderId,
                  hall: r.hall || r.seating_preference || r.area || 'Royal Dining Hall',
                  table: r.table || r.table_number || r.assignedTable || 'Table 1',
                  party_size: r.party_size || r.guests || r.partySize || 2,
                  guests: r.party_size || r.guests || r.partySize || 2,
                  time_slot: r.time_slot || r.time || r.timeSlot || '19:30',
                  time: r.time_slot || r.time || r.timeSlot || '19:30',
                  dining_date: r.dining_date || r.date || r.diningDate || new Date().toISOString().split('T')[0],
                  date: r.dining_date || r.date || r.diningDate || new Date().toISOString().split('T')[0]
                };
              });
          }
        } catch (err) {
          // Fallback
        }

        // 2. Fetch incoming Checkout Dine-In Orders from GET /api/orders
        let checkoutOrders = [];
        try {
          const ordResp = await axios.get(`${apiBase}/orders`).catch(async () => {
            return await apiClient.get('/orders');
          });
          const ordData = ordResp?.data?.data || ordResp?.data;
          if (Array.isArray(ordData)) {
            checkoutOrders = ordData.filter(
              (o) =>
                !isRecordDeleted(o) &&
                o.status !== 'CANCELLED' &&
                o.status !== 'DELETED' &&
                (o.orderType === 'DINE_IN' ||
                  o.fulfillment_type === 'Dine-In' ||
                  o.reservation != null ||
                  (o.notes && o.notes.includes('Dine-In Table Reservation')))
            );
          }
        } catch (err) {
          // Fallback
        }

        // 3. Scan local session storage for instant demo checkout Dine-In orders
        if (typeof sessionStorage !== 'undefined') {
          try {
            const sessionOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
            const sessionDineIn = sessionOrders.filter(
              (o) =>
                !isRecordDeleted(o) &&
                o.status !== 'CANCELLED' &&
                o.status !== 'DELETED' &&
                (o.orderType === 'DINE_IN' ||
                  o.fulfillment_type === 'Dine-In' ||
                  o.reservation != null ||
                  (o.notes && o.notes.includes('Dine-In Table Reservation')))
            );
            checkoutOrders = [...sessionDineIn, ...checkoutOrders];
          } catch (ignore) {}
        }

        // 4. Normalize checkout Dine-In orders into reservation objects (skip if already represented or deleted)
        const normalizedDineIn = [];
        checkoutOrders.forEach((ord, idx) => {
          const orderId = ord.order_number || ord.order_id || ord.orderId || ord.id || `DINE-${idx + 101}`;
          if (isRecordDeleted(ord) || isRecordDeleted({ id: orderId })) {
            return;
          }

          // Check if already represented in fetchedList from /api/reservations
          const alreadyInFetched = fetchedList.some(
            (f) =>
              (f.order_number && String(f.order_number) === String(orderId)) ||
              (f.order_id && String(f.order_id) === String(orderId)) ||
              (f.orderId && String(f.orderId) === String(orderId)) ||
              (f.id && String(f.id) === String(orderId))
          );
          if (alreadyInFetched) return;

          const resObj = ord.reservation || {};
          const partyNum =
            resObj.partySize || resObj.party_size || ord.party_size || ord.partySize
              ? parseInt(resObj.partySize || resObj.party_size || ord.party_size || ord.partySize, 10) || 2
              : ord.guests || 2;
          const hallName =
            resObj.seatingPreference ||
            resObj.seating_preference ||
            resObj.hallName ||
            ord.seating_preference ||
            ord.seatingPreference ||
            ord.hall ||
            ord.area ||
            'Royal Dining Hall';
          const tblName =
            resObj.selectedTable ||
            resObj.table ||
            resObj.table_number ||
            resObj.tableNumber ||
            ord.table_number ||
            ord.tableNumber ||
            ord.table ||
            ord.assignedTable ||
            'Table 1';

          const patronName =
            ord.customer_name ||
            ord.customerName ||
            ord.recipientName ||
            ord.fullName ||
            ord.name ||
            resObj.patron_name ||
            resObj.customer_name ||
            ord.guest ||
            'Royal Patron';

          normalizedDineIn.push({
            id: orderId,
            order_id: orderId,
            orderId: orderId,
            order_number: ord.order_number || orderId,
            patron_name: patronName,
            customer_name: patronName,
            guest: patronName,
            phone: ord.phone || ord.contactPhone || ord.customerPhone || '+94 77 123 4567',
            email: ord.customerEmail || ord.email || '',
            hall: hallName,
            area: hallName,
            table: tblName,
            assignedTable: tblName,
            guests: partyNum,
            partySize: partyNum,
            party_size: partyNum,
            time: resObj.timeSlot || resObj.time_slot || ord.time_slot || ord.timeSlot || ord.time || '19:30',
            time_slot: resObj.timeSlot || resObj.time_slot || ord.time_slot || ord.timeSlot || ord.time || '19:30',
            date: resObj.diningDate || resObj.dining_date || ord.dining_date || ord.diningDate || ord.date || new Date().toISOString().split('T')[0],
            dining_date: resObj.diningDate || resObj.dining_date || ord.dining_date || ord.diningDate || ord.date || new Date().toISOString().split('T')[0],
            notes:
              ord.notes ||
              (ord.items ? `Dine-In Feast: ${ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}` : 'Dine-In Online Checkout'),
            status:
              ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                ? 'COMPLETED'
                : 'CONFIRMED',
            isCheckoutOrder: true
          });
        });

        // 5. Merge all unique reservations and exclude deleted IDs
        setReservations((prev) => {
          const mergedMap = new Map();
          prev.forEach((r) => {
            if (!isRecordDeleted(r)) mergedMap.set(r.id, r);
          });
          fetchedList.forEach((r) => {
            const id = r.id || r._id;
            if (!isRecordDeleted(r)) mergedMap.set(id, { ...r, id });
          });
          normalizedDineIn.forEach((r) => {
            if (!isRecordDeleted(r)) mergedMap.set(r.id, r);
          });

          // Filter out deleted reservations so subsequent poll intervals DO NOT resurrect them
          const merged = Array.from(mergedMap.values()).filter(
            (r) => !isRecordDeleted(r) && r.status !== 'CANCELLED'
          );

          setHalls((prevHalls) => syncHallsWithReservations(merged, prevHalls));
          return merged;
        });
      } catch (err) {
        console.warn('Live reservation sync warning:', err);
      } finally {
        if (!isBackground) setIsRefreshing(false);
      }
    },
    [isRecordDeleted, syncHallsWithReservations]
  );

  // Auto-sync polling interval every 15 seconds
  useEffect(() => {
    fetchLiveReservations(false);
    const interval = setInterval(() => {
      fetchLiveReservations(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveReservations]);

  // ACTION 1: "Mark Departed & Free" Button
  const handleMarkDepartedAndFree = async (item) => {
    const res = typeof item === 'object' && item !== null ? item : { id: item };
    const resId = res.id || res.reservation_id || res.order_id;
    const hallName = res.hall || res.area || 'Royal Dining Hall';
    const tableName = res.table || res.assignedTable || 'Table 1';

    console.log('Dispatching DEPART / COMPLETE for ID:', resId, res);

    // 1. Immediately free linked table in local halls state (Green / Available)
    setHalls((prevHalls) =>
      prevHalls.map((h) => {
        if (!h.name.toLowerCase().includes(hallName.toLowerCase()) && !hallName.toLowerCase().includes(h.name.toLowerCase())) {
          return h;
        }
        return {
          ...h,
          tables: h.tables.map((t) => {
            if (t.name.toLowerCase() === tableName.toLowerCase() || t.id.toLowerCase() === tableName.toLowerCase()) {
              return { ...t, status: 'AVAILABLE', currentBooking: null, bookingDetails: null, reservation: null };
            }
            return t;
          })
        };
      })
    );

    // 2. Mark reservation completed/departed in UI state
    setReservations((prev) =>
      prev.map((r) => ((r.id || r.order_id || r.reservation_id) === resId ? { ...r, status: 'COMPLETED' } : r))
    );

    // 3. Call PUT /api/reservations/:id/depart (or fallback PATCH /api/reservations/:id with status: 'COMPLETED')
    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      try {
        await axios.put(`${apiBase}/reservations/${resId}/depart`, { status: 'COMPLETED' });
      } catch {
        try {
          await axios.patch(`${apiBase}/reservations/${resId}`, { status: 'COMPLETED' });
        } catch {
          await apiClient.patch(`/reservations/${resId}`, { status: 'COMPLETED' }).catch(() => {});
        }
      }

      // Also notify table release to backend if supported
      try {
        await axios.put(`${apiBase}/reservations/tables/${tableName}/status`, { status: 'AVAILABLE' });
      } catch (ignore) {}

      notify('success', 'Table Released', `Reservation #${resId} marked departed. Table released and marked Available.`);
    } catch (e) {
      console.warn('Mark departed error:', e.message);
      notify('error', 'Depart Error', 'Could not update server.');
    } finally {
      // Re-fetch to ensure sync with backend
      await fetchLiveReservations(true);
    }
  };

  // ACTION 2: Delete (Trash Icon) Button with Confirmation
  const handleDeleteReservation = async (item) => {
    const res = typeof item === 'object' && item !== null ? item : { id: item };
    const deleteId = res.order_number || res.order_id || res.id || res.reservation_id || res.orderId || res._id;

    if (!deleteId) return;

    const isConfirmed = window.confirm(`Delete reservation #${deleteId} permanently and release table?`);
    if (!isConfirmed) return;

    console.log('Dispatching DELETE for ID:', deleteId, res);

    // Track in deleted ref and local storage to prevent background poll & refresh resurrection
    persistDeletedId(deleteId);
    if (res.id) persistDeletedId(res.id);
    if (res.order_id) persistDeletedId(res.order_id);
    if (res.order_number) persistDeletedId(res.order_number);
    if (res.orderId) persistDeletedId(res.orderId);
    if (res.reservation_id) persistDeletedId(res.reservation_id);

    // Clean session storage if applicable
    if (typeof sessionStorage !== 'undefined') {
      try {
        const orders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
        const filtered = orders.filter(
          (o) =>
            (o.id || o.orderId || o.order_id || o.order_number) !== deleteId &&
            o.id !== res.id &&
            o.order_id !== res.order_id
        );
        sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(filtered));
      } catch (ignore) {}
    }

    const hallName = res.hall || res.area || res.seating_preference || res.seatingPreference || '';
    const tableName = res.table || res.assignedTable || res.table_number || res.tableNumber || '';

    // 1. Remove row immediately from reservations state
    setReservations((prev) =>
      prev.filter(
        (r) =>
          r.id !== deleteId &&
          r.order_id !== deleteId &&
          r.order_number !== deleteId &&
          r.orderId !== deleteId &&
          r.id !== res.id &&
          (!res.order_id || r.order_id !== res.order_id)
      )
    );

    // 2. Instantly reset the linked table card to Green ("Available")
    if (hallName || tableName) {
      setHalls((prevHalls) =>
        prevHalls.map((h) => {
          if (
            hallName &&
            !h.name.toLowerCase().includes(hallName.toLowerCase()) &&
            !hallName.toLowerCase().includes(h.name.toLowerCase())
          ) {
            return h;
          }
          return {
            ...h,
            tables: h.tables.map((t) => {
              if (
                t.name.toLowerCase() === tableName.toLowerCase() ||
                t.id.toLowerCase() === tableName.toLowerCase() ||
                (t.name && tableName && tableName.toLowerCase().includes(t.name.toLowerCase()))
              ) {
                return { ...t, status: 'AVAILABLE', currentBooking: null, bookingDetails: null, reservation: null };
              }
              return t;
            })
          };
        })
      );
    }

    // 3. Call DELETE /api/reservations/:id
    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      await axios.delete(`${apiBase}/reservations/${deleteId}`).catch(async () => {
        return await apiClient.delete(`/reservations/${deleteId}`);
      });

      notify('success', 'Reservation Deleted', 'Reservation deleted permanently.');
    } catch (err) {
      console.error('Failed to delete reservation from server:', err);
      notify('error', 'Delete Error', 'Could not delete from server.');
    } finally {
      // Re-fetch to ensure sync with backend
      await fetchLiveReservations(true);
    }
  };

  // ACTION 3: "+ BOOK TABLE RESERVATION" MODAL SUBMISSION
  const handleSaveReservation = async (savedData, id) => {
    if (id) {
      // Update existing booking
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...savedData, id } : r))
      );
      setHalls((prevHalls) =>
        syncHallsWithReservations(
          reservations.map((r) => (r.id === id ? { ...r, ...savedData, id } : r)),
          prevHalls
        )
      );
      notify('success', 'Booking Updated', `Reservation for ${savedData.guest} updated.`);
    } else {
      // Create new walk-in / admin booking
      const newBooking = {
        id: 'RES-' + Math.floor(400 + Math.random() * 500),
        status: 'CONFIRMED',
        ...savedData
      };

      // 1. Immediately prepend to reservations list
      setReservations((prev) => [newBooking, ...prev]);

      // 2. Immediately turn the selected table card to 'Reserved' (Yellow)
      setHalls((prevHalls) =>
        prevHalls.map((h) => {
          if (!h.name.toLowerCase().includes(savedData.hall.toLowerCase()) && !savedData.hall.toLowerCase().includes(h.name.toLowerCase())) {
            return h;
          }
          return {
            ...h,
            tables: h.tables.map((t) => {
              if (t.name === savedData.table || t.id === savedData.table) {
                return {
                  ...t,
                  status: 'RESERVED',
                  currentBooking: `${savedData.time} • ${savedData.guest} (${savedData.guests}p)`
                };
              }
              return t;
            })
          };
        })
      );

      // 3. Call POST /api/reservations/admin-book (with fallback to /api/reservations)
      try {
        const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
        try {
          await axios.post(`${apiBase}/reservations/admin-book`, newBooking);
        } catch (err) {
          try {
            await axios.post(`${apiBase}/reservations`, newBooking);
          } catch {
            await apiClient.post('/reservations', newBooking).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Backend admin booking post warning:', e.message);
      }

      notify(
        'success',
        'Reservation Confirmed',
        `Confirmed booking for ${savedData.guest} at ${savedData.hall} - ${savedData.table}.`
      );
    }
  };

  const handleOpenModal = (res = null) => {
    setSelectedRes(res);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRes(null);
  };

  // Filtered reservations for bottom roster
  const filteredReservations = reservations.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.patron_name && r.patron_name.toLowerCase().includes(q)) ||
      (r.guest && r.guest.toLowerCase().includes(q)) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.table && r.table.toLowerCase().includes(q)) ||
      (r.hall && r.hall.toLowerCase().includes(q)) ||
      (r.order_id && String(r.order_id).toLowerCase().includes(q)) ||
      (r.id && String(r.id).toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  return (
    <section aria-label="Reservations and Floor Management" className="fade-in">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5.5rem',
            right: '2rem',
            zIndex: 999,
            backgroundColor:
              toastMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.95)'
                : toastMessage.type === 'error'
                ? 'rgba(239, 68, 68, 0.95)'
                : 'rgba(59, 130, 246, 0.95)',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <CheckCircle2 size={18} />
          <div>
            <div>{toastMessage.title}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.9 }}>
              {toastMessage.message}
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0, marginBottom: '0.25rem' }}>
            <span className="text-gradient-gold">Floor Plan & Live Seating Roster</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time multi-hall table availability and reservation management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLiveReservations(false)}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} style={{ marginRight: '0.4rem' }} />
            {isRefreshing ? 'Syncing...' : 'Live Sync'}
          </Button>

          <Button variant="primary" onClick={() => handleOpenModal(null)}>
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            + Book Table Reservation
          </Button>
        </div>
      </div>

      {/* Filter Tabs for Floor Plan */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'AVAILABLE', 'RESERVED'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setTableFilter(status)}
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-sm)',
              border: tableFilter === status ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
              backgroundColor: tableFilter === status ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-surface)',
              color: tableFilter === status ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {status === 'ALL' ? 'ALL TABLES (12)' : status}
          </button>
        ))}
      </div>

      {/* 3 DISTINCT HALL CARDS (STRICTLY READ-ONLY TABLES 1-4) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        {halls.map((hall) => {
          const availableCount = hall.tables.filter((t) => t.status === 'AVAILABLE').length;
          const reservedCount = hall.tables.filter((t) => t.status === 'RESERVED' || t.status === 'OCCUPIED').length;

          const displayedTables = hall.tables.filter((t) => {
            if (tableFilter === 'ALL') return true;
            if (tableFilter === 'RESERVED') return t.status === 'RESERVED' || t.status === 'OCCUPIED';
            return t.status === tableFilter;
          });

          return (
            <div
              key={hall.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {/* Hall Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} style={{ color: 'var(--accent-gold)' }} />
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                      {hall.name}
                    </h2>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {hall.description}
                  </span>
                </div>

                {/* Live Hall Capacity Metrics */}
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--accent-emerald)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {availableCount} Available
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--accent-gold)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {reservedCount} Reserved
                  </span>
                </div>
              </div>

              {/* 4 Tables Grid for this Hall (Read-Only) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.15rem'
                }}
              >
                {displayedTables.map((tbl) => {
                  const isAvailable = tbl.status === 'AVAILABLE';
                  const isReserved = tbl.status === 'RESERVED' || tbl.status === 'OCCUPIED';

                  // Colors: Green = Available, Yellow = Reserved
                  const statusBg = isAvailable
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(212, 175, 55, 0.08)';

                  const statusColor = isAvailable
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-gold)';

                  const badgeText = isAvailable ? 'Available' : 'Reserved';

                  return (
                    <div
                      key={tbl.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${statusColor}44`,
                        backgroundColor: statusBg,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div>
                        {/* Table Name & Status Badge */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {tbl.name}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: `${statusColor}22`,
                              color: statusColor,
                              border: `1px solid ${statusColor}55`
                            }}
                          >
                            {badgeText}
                          </span>
                        </div>

                        {/* Capacity text */}
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          Capacity: <strong>{tbl.capacity} Guests</strong>
                        </div>

                        {/* If Reserved: Guest Name, Order Badge, Time & Party Size */}
                        {isReserved && (tbl.bookingDetails || tbl.currentBooking) ? (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-primary)',
                              backgroundColor: 'rgba(11, 15, 25, 0.75)',
                              padding: '0.55rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${statusColor}33`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <strong style={{ color: 'var(--accent-gold)', fontSize: '0.86rem' }}>
                                {tbl.bookingDetails?.patron_name || tbl.reservation?.patron_name || tbl.currentBooking}
                              </strong>
                              {(tbl.bookingDetails?.order_id || tbl.reservation?.order_id) && (
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                                  Order #{tbl.bookingDetails?.order_id || tbl.reservation?.order_id}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tbl.bookingDetails
                                ? `${tbl.bookingDetails.time} • ${tbl.bookingDetails.party_size} Guests`
                                : tbl.currentBooking}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--accent-emerald)',
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            ✓ Ready for dining guests
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM CONFIRMED RESERVATION ROSTER WITH WIRED ACTIONS */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, marginBottom: '0.25rem' }}>
              Active Reservation Roster & Live Checkout Bookings
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Auto-syncs incoming Dine-In checkout orders every 15 seconds.
            </span>
          </div>

          <div style={{ width: '280px' }}>
            <input
              type="text"
              placeholder="Search guest, table, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>Guest Name & Contact</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>Seating Hall & Table</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>Party Size</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active reservations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const isCompleted = res.status === 'COMPLETED';

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.92rem' }}>
                          {res.patron_name || res.customer_name || res.guest || res.customerName || res.recipientName || 'Royal Patron'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {res.phone || '+94 77 123 4567'} {res.email ? `• ${res.email}` : ''}
                        </span>
                        {(res.order_id || res.orderId || res.isCheckoutOrder) && (
                          <div style={{ marginTop: '0.35rem' }}>
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1 font-medium font-mono">
                              Dine-In Feast (Order #{res.order_id || res.orderId || res.id})
                            </span>
                          </div>
                        )}
                        {res.notes && !res.order_id && !res.isCheckoutOrder && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '0.2rem' }}>
                            {res.notes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{res.table || res.assignedTable || 'Table 1'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {res.hall || res.area || 'Royal Dining Hall'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        {res.guests || res.partySize || res.party_size || 2} Pax
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <div>{res.time || res.timeSlot || res.time_slot || '19:30'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {res.date || res.diningDate || res.dining_date || 'Today'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              res.status === 'CONFIRMED'
                                ? 'rgba(212, 175, 55, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              res.status === 'CONFIRMED'
                                ? 'var(--accent-gold)'
                                : 'var(--accent-emerald)',
                            border: `1px solid ${
                              res.status === 'CONFIRMED'
                                ? 'rgba(212, 175, 55, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`
                          }}
                        >
                          {res.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* "Mark Departed & Free" Action Button */}
                          <button
                            type="button"
                            onClick={() => handleMarkDepartedAndFree(res)}
                            disabled={isCompleted}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: isCompleted ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                              border: isCompleted ? '1px solid rgba(100, 116, 139, 0.4)' : '1px solid var(--accent-emerald)',
                              color: isCompleted ? 'var(--text-muted)' : 'var(--accent-emerald)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: isCompleted ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            title="Mark Departed & Free Table"
                          >
                            <LogOut size={12} /> Mark Departed & Free
                          </button>

                          {/* Edit Booking Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenModal(res)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-medium)',
                              color: 'var(--text-primary)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Edit Reservation"
                          >
                            <Edit3 size={12} />
                          </button>

                          {/* Delete (Trash Icon) Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReservation(res)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--accent-danger)',
                              color: 'var(--accent-danger)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete Reservation and Release Table"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-In & Table Booking Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selectedRes}
        tables={allTablesList}
        onSaved={handleSaveReservation}
      />
    </section>
  );
};

export default ReservationManagement;
