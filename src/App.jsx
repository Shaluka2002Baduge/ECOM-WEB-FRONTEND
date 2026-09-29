import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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

      {/* 2. Dedicated SaaS Admin Portal & Central Order Fulfillment */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'KITCHEN_STAFF']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'KITCHEN_STAFF']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* 3. Decommissioned Legacy Kitchen Display - Permanent Immediate Redirection to Admin Orders */}
      <Route path="/kitchen/*" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/kitchen" element={<Navigate to="/admin/orders" replace />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
