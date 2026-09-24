/**
 * Raalahami Restaurant - CartContext
 * Global shopping cart state with accessible live announcements & drawer control
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Safe hydration from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ralahami_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ralahami_cart_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Unable to persist cart to storage', e);
    }
  }, [items]);

  /**
   * Add item to cart with optional instructions
   */
  const addItem = useCallback((item, quantity = 1, specialInstructions = '') => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === item.id && (i.specialInstructions || '') === specialInstructions
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...prevItems, { ...item, quantity, specialInstructions }];
      }
    });

    // Screen reader announcement for WCAG EDI
    setAnnouncement(`Added ${quantity} ${item.name} to your royal order.`);
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((itemId, specialInstructions = '') => {
    setItems((prevItems) => {
      const target = prevItems.find((i) => i.id === itemId);
      if (target) {
        setAnnouncement(`Removed ${target.name} from your order.`);
      }
      return prevItems.filter(
        (i) => !(i.id === itemId && (i.specialInstructions || '') === specialInstructions)
      );
    });
  }, []);

  /**
   * Update quantity of specific item
   */
  const updateQuantity = useCallback((itemId, quantity, specialInstructions = '') => {
    if (quantity <= 0) {
      removeItem(itemId, specialInstructions);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId && (item.specialInstructions || '') === specialInstructions) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeItem]);

  /**
   * Clear all cart items
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setAnnouncement('Your royal cart has been cleared.');
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // Price and item count calculations
  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * 0.10; // 10% standard service / tax
  }, [subtotal]);

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 4500 ? 0 : 450; // Free royal delivery over Rs. 4,500, otherwise Rs. 450
  }, [items.length, subtotal]);

  const totalPrice = useMemo(() => {
    return subtotal + tax + deliveryFee;
  }, [subtotal, tax, deliveryFee]);

  const value = {
    items,
    totalItems,
    subtotal,
    tax,
    deliveryFee,
    totalPrice,
    isDrawerOpen,
    announcement,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Hidden live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
