import React from 'react';
import { Outlet } from 'react-router-dom';
import SkipLink from '../components/common/SkipLink';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';

/**
 * Public Customer Layout
 * Wraps customer-facing storefront routes with Navbar, Cart Drawer, and Footer
 */
export const CustomerLayout = () => {
  return (
    <>
      {/* WCAG 2.1 Skip Link */}
      <SkipLink targetId="main-content" />

      {/* Accessible Fixed Public Navbar */}
      <Navbar />

      {/* Primary Customer Content Landmark */}
      <main id="main-content" className="main-content" role="main" tabIndex="-1">
        <Outlet />
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Accessible Customer Footer */}
      <Footer />
    </>
  );
};

export default CustomerLayout;
