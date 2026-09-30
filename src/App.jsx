import React from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Customer Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin SaaS Modules
import OrderManagement from './components/admin/OrderManagement';
import MenuManagement from './components/admin/MenuManagement';
import InventoryManagement from './components/admin/InventoryManagement';
import ReservationManagement from './components/admin/ReservationManagement';
import StaffManagement from './components/admin/StaffManagement';
import ReportsManagement from './components/admin/ReportsManagement';

import AdminErrorBoundary from './components/AdminErrorBoundary';

/**
 * Route wrapper that wraps views in AdminErrorBoundary and passes AdminLayout's notifications context
 */
const AdminRoute = ({ Component }) => {
  const context = useOutletContext();
  return (
    <AdminErrorBoundary>
      <Component onNotify={context?.onNotify} />
    </AdminErrorBoundary>
  );
};

/**
 * Root Application Router
 * Strict architectural separation:
 * 1. CustomerLayout: Public storefront with Navbar, Footer, and Cart Drawer.
 * 2. AdminLayout: Dedicated full-height SaaS layout with dark luxury sidebar, custom header, and no customer chrome.
 * 3. Kitchen KDS Decommissioned: All order fulfillment integrated directly into Admin Operations.
 */
function App() {
  return (
    <Routes>
      {/* 1. Public Customer Routes (Rendered inside CustomerLayout) */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/reservations" element={<Navigate to="/menu" replace />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/track" element={<OrderTrackingPage />} />
        <Route path="/orders/track/:orderId" element={<OrderTrackingPage />} />
        <Route path="/tracking" element={<OrderTrackingPage />} />
        <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Dedicated SaaS Admin Portal & Nested Module Routing */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'KITCHEN_STAFF']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<AdminRoute Component={OrderManagement} />} />
        <Route path="menu" element={<AdminRoute Component={MenuManagement} />} />
        <Route path="inventory" element={<AdminRoute Component={InventoryManagement} />} />
        <Route path="reservations" element={<AdminRoute Component={ReservationManagement} />} />
        <Route path="staff" element={<AdminRoute Component={StaffManagement} />} />
        <Route path="reports" element={<AdminRoute Component={ReportsManagement} />} />
        <Route path="*" element={<Navigate to="orders" replace />} />
      </Route>

      {/* 3. Decommissioned Legacy Kitchen Display - Permanent Immediate Redirection to Admin Orders */}
      <Route path="/kitchen/*" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/kitchen" element={<Navigate to="/admin/orders" replace />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
