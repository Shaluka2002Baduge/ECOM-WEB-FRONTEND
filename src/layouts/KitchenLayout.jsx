import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Decommissioned KitchenLayout
 * All kitchen fulfillment is now integrated into Admin Operations at /admin/orders
 */
export const KitchenLayout = () => {
  return <Navigate to="/admin/orders" replace />;
};

export default KitchenLayout;
