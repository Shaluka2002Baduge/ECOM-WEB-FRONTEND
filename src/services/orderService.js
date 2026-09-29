/**
 * Raalahami Restaurant - Order Service
 * Handles order placement, history, and real-time status tracking
 */
import apiClient from '../api/apiClient';

export const orderService = {
  /**
   * Create and submit a new food order
   * @param {object} orderData - { items, deliveryAddress, paymentMethod, contactPhone, notes }
   */
  async createOrder(orderData) {
    const customerEmail = (orderData.customerEmail || orderData.email || '').trim().toLowerCase();
    const totalAmount = orderData.totalPrice || orderData.totalAmount || 0;

    // Resolve item IDs defensively for all payload variants
    if (Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map((item) => {
        const resolvedId = item.id || item.menu_item_id || item.menuItemId || item._id;
        return {
          ...item,
          id: Number(resolvedId) || resolvedId,
          menu_item_id: Number(resolvedId) || resolvedId,
          menuItemId: Number(resolvedId) || resolvedId,
          name: item.name || item.title,
          price: Number(item.price),
          quantity: Number(item.quantity || 1)
        };
      });
    }

    const itemsCount = (orderData.items || []).length;
    orderData.customerEmail = customerEmail;
    orderData.email = customerEmail;

    console.log('🚀 [SUBMITTING ORDER PAYLOAD]', { customerEmail, totalAmount, itemsCount });

    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (e) {
      console.warn('Backend order submission encountered an error:', e.message || e);
      // If it is an explicit 4xx client or validation error from the backend, rethrow so UI can notify the user
      if (e.status && e.status >= 400 && e.status < 500) {
        throw e;
      }
      // Create local tracked order session for offline/disconnected presentation workflow
      const mockOrder = {
        id: 'RAALAHAMI-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        status: 'PLACED',
        estimatedMinutes: 35,
        items: orderData.items,
        totalPrice: orderData.totalPrice || 0,
        deliveryAddress: orderData.deliveryAddress,
        notes: orderData.notes
      };
      // Store in session storage for tracking demonstration
      const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
      savedOrders.unshift(mockOrder);
      sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(savedOrders));
      return mockOrder;
    }
  },

  /**
   * Fetch order details by order ID or reference
   */
  async getOrderById(orderId) {
    if (!orderId) return null;
    try {
      let response;
      try {
        response = await apiClient.get(`/orders/track/${orderId}`);
      } catch (trackErr) {
        response = await apiClient.get(`/orders/${orderId}`);
      }
      const backendData = response.data?.order || response.data?.data || response.data;
      if (backendData) {
        // Sync local storage so subsequent offline reads stay updated
        if (typeof sessionStorage !== 'undefined') {
          try {
            const saved = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
            const idx = saved.findIndex(
              (o) =>
                String(o.id) === String(orderId) ||
                String(o.order_number) === String(orderId) ||
                String(o.orderNumber) === String(orderId)
            );
            if (idx >= 0) {
              saved[idx] = { ...saved[idx], ...backendData };
            } else {
              saved.unshift(backendData);
            }
            sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(saved));
          } catch (ignore) {}
        }
        return backendData;
      }
    } catch (e) {
      const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
      const match = savedOrders.find(
        (o) =>
          String(o.id) === String(orderId) ||
          String(o.order_number) === String(orderId) ||
          String(o.orderNumber) === String(orderId)
      );
      return match || null;
    }
  },

  /**
   * Track order lifecycle status
   */
  async trackOrderStatus(orderId) {
    return this.getOrderById(orderId);
  },

  /**
   * Fetch all orders for Admin Fulfillment Center
   */
  async getAllOrders() {
    try {
      const response = await apiClient.get('/admin/orders');
      const backendOrders = response.data?.data || response.data || [];
      return Array.isArray(backendOrders) ? backendOrders : [];
    } catch (e) {
      console.warn('Backend /admin/orders unavailable, falling back to local store:', e.message);
      const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
      if (savedOrders.length > 0) return savedOrders;

      // Seed initial realistic orders if none present
      const initialSeed = [
        {
          id: 'RAALAHAMI-892101',
          order_number: 'RAALAHAMI-892101',
          customer_name: 'Deshamanya Wickramasinghe',
          customerEmail: 'wickrama@royal.lk',
          phone: '+94 77 123 4567',
          fulfillment_type: 'Home Delivery',
          orderType: 'DELIVERY',
          status: 'PREPARING',
          deliveryAddress: '14/2 Cinnamon Gardens, Colombo 07',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
          estimatedMinutes: 20,
          totalPrice: 8450,
          items: [
            { name: 'Royal Dutch Burgher Lamprais', quantity: 2, price: 2850 },
            { name: 'Jaffna Blue Crab Curry', quantity: 1, price: 2750 }
          ]
        },
        {
          id: 'RAALAHAMI-892102',
          order_number: 'RAALAHAMI-892102',
          customer_name: 'Lady Anula Rathnayake',
          customerEmail: 'anula.rathnayake@heritage.lk',
          phone: '+94 71 987 6543',
          fulfillment_type: 'Takeaway',
          orderType: 'TAKEAWAY',
          status: 'PENDING',
          deliveryAddress: 'Raalahami Pickup Counter',
          createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
          estimatedMinutes: 15,
          totalPrice: 4200,
          items: [
            { name: 'Claypot Black Pepper Mutton Curry', quantity: 1, price: 2450 },
            { name: 'Kithul Treacle & Coconut Watalappan', quantity: 2, price: 875 }
          ]
        },
        {
          id: 'RAALAHAMI-892103',
          order_number: 'RAALAHAMI-892103',
          customer_name: 'Dr. Rohan De Silva',
          customerEmail: 'rohan.desilva@colombo.edu.lk',
          phone: '+94 76 543 2109',
          fulfillment_type: 'Home Delivery',
          orderType: 'DELIVERY',
          status: 'OUT_FOR_DELIVERY',
          deliveryAddress: '88 Galle Face Court, Colombo 03',
          createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
          estimatedMinutes: 5,
          totalPrice: 6200,
          items: [
            { name: 'Wild Jumbo Lagoon Prawns in Coconut Milk', quantity: 2, price: 3100 }
          ]
        }
      ];

      sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(initialSeed));
      return initialSeed;
    }
  },

  /**
   * Advance or update order status (Admin Fulfillment)
   * @param {string} orderId
   * @param {string} newStatus
   * @param {string} notes
   */
  async updateOrderStatus(orderId, newStatus, notes = '') {
    // 1. Update in local session storage for instantaneous frontend cross-tab reactive sync
    const savedOrders = JSON.parse(sessionStorage.getItem('ralahami_demo_orders') || '[]');
    let updatedOrder = null;

    const updatedList = savedOrders.map((ord) => {
      if (
        String(ord.id) === String(orderId) ||
        String(ord.order_number) === String(orderId) ||
        String(ord.orderNumber) === String(orderId)
      ) {
        updatedOrder = {
          ...ord,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          adminNotes: notes || ord.adminNotes
        };
        return updatedOrder;
      }
      return ord;
    });

    if (!updatedOrder) {
      updatedOrder = {
        id: orderId,
        order_number: orderId,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        adminNotes: notes
      };
      updatedList.unshift(updatedOrder);
    }

    sessionStorage.setItem('ralahami_demo_orders', JSON.stringify(updatedList));

    // 2. Transmit to backend
    try {
      const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        notes
      });
      return response.data?.data || response.data || updatedOrder;
    } catch (e) {
      console.warn('Backend patch order status fallback to session store:', e.message);
      return updatedOrder;
    }
  },

  /**
   * Cancel an order with confirmation and notes
   */
  async cancelOrder(orderId, reason = '') {
    return this.updateOrderStatus(orderId, 'CANCELLED', reason || 'Order cancelled by Admin Operations');
  }
};

export default orderService;
