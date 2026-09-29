import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

/**
 * Decommissioned Kitchen Dashboard
 * All kitchen fulfillment is now integrated into Admin Operations at /admin/orders
 */
export const KitchenDashboard = () => {
  return <Navigate to="/admin/orders" replace />;
};

export default KitchenDashboard;
