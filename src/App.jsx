import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservationPage from './pages/ReservationPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import KitchenDashboard from './pages/KitchenDashboard';

/**
 * Root Application Router
 * Strict architectural separation:
 * 1. CustomerLayout: Public storefront with Navbar, Footer, and Cart Drawer.
 * 2. AdminLayout: Dedicated full-height SaaS layout with dark luxury sidebar, custom header, and no customer chrome.
 * 3. KitchenDashboard: Dedicated full-screen KDS ticket terminal.
 */
function App() {
  return (
    <Routes>
      {/* 1. Public Customer Routes (Rendered inside CustomerLayout) */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/track" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Dedicated SaaS Admin Portal (Completely separated from customer layout) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* 3. Dedicated Kitchen Display Screen (KDS/KOT) */}
      <Route
        path="/kitchen/*"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN_STAFF', 'ADMIN']}>
            <KitchenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN_STAFF', 'ADMIN']}>
            <KitchenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
