import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SkipLink from './components/common/SkipLink';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservationPage from './pages/ReservationPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Root Application Component
 * Structured with strict WCAG 2.1 Landmark roles:
 * - <header role="banner"> (inside Navbar)
 * - <main id="main-content" role="main">
 * - <footer role="contentinfo"> (inside Footer)
 */
function App() {
  return (
    <>
      {/* WCAG 2.1 Skip Link (Bypass Blocks 2.4.1) */}
      <SkipLink targetId="main-content" />

      {/* Accessible Fixed Navbar */}
      <Navbar />

      {/* Primary Main Content Landmark */}
      <main id="main-content" className="main-content" role="main" tabIndex="-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reservations" element={<ReservationPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/track" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Slide-out Accessible Cart Drawer */}
      <CartDrawer />

      {/* Accessible Footer */}
      <Footer />
    </>
  );
}

export default App;
