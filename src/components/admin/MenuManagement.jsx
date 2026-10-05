import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  UtensilsCrossed,
  Lock,
  Package
} from 'lucide-react';
import axios from 'axios';
import { menuService, FALLBACK_MENU_ITEMS } from '../../services/menuService';
import { apiClient } from '../../api/apiClient';
import { formatCurrency } from '../../utils/currency';
import Button from '../common/Button';
import Alert from '../common/Alert';
import RoyalPagination from '../common/RoyalPagination';
import { CreateDishModal } from './CreateDishModal';

const DEFAULT_DISH_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
const DISHES_PER_PAGE = 8;

const CATEGORY_MAP = {
  1: 'Mains',
  2: 'Seafood',
  3: 'Starters',
  4: 'Vegetarian',
  5: 'Desserts',
  6: 'Crafted Drinks',
  7: 'Beverages & Water Bottles'
};

const getDishCategory = (dish) => {
  if (!dish) return 'Mains';
  if (typeof dish.category === 'string' && dish.category.trim()) {
    return dish.category.trim();
  }
  if (dish.category && typeof dish.category === 'object' && dish.category.name) {
    return String(dish.category.name).trim();
  }
  if (typeof dish.category_name === 'string' && dish.category_name.trim()) {
    return dish.category_name.trim();
  }
  if (dish.category_id && CATEGORY_MAP[Number(dish.category_id)]) {
    return CATEGORY_MAP[Number(dish.category_id)];
  }
  if (typeof dish.category === 'number' && CATEGORY_MAP[dish.category]) {
    return CATEGORY_MAP[dish.category];
  }
  return 'Mains';
};

export const isInventorySyncedItem = (dish) => {
  if (!dish) return false;
  if (dish.is_inventory_item === true || dish.is_inventory_synced === true) return true;
  if (dish.item_source === 'inventory' || dish.source === 'inventory') return true;
  const cat = String(dish.category_name || dish.category || '').toLowerCase();
  if (cat.includes('beverage') || cat.includes('water bottle') || String(dish.category_id) === '7') return true;
  return false;
};

export const MenuManagement = ({ onNotify }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState(['All', 'Mains', 'Seafood', 'Starters', 'Vegetarian', 'Desserts', 'Crafted Drinks', 'Beverages & Water Bottles']);

  // Reset pagination on category or search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, menuSearch]);

  // Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [localNotification, setLocalNotification] = useState(null);

  // Helper notification dispatcher
  const notify = useCallback((type, title, message) => {
    const notif = { type, title, message };
    if (onNotify) {
      onNotify(notif);
    } else {
      setLocalNotification(notif);
      setTimeout(() => setLocalNotification(null), 5000);
    }
  }, [onNotify]);

  // Fetch Menu Items from real database backend
  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        menuService.getMenuItems('All', ''),
        menuService.getCategories()
      ]);
      if (Array.isArray(items) && items.length > 0) {
        setMenuItems(items);
      } else {
        setMenuItems((prev) => (prev && prev.length > 0 ? prev : FALLBACK_MENU_ITEMS));
      }
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Could not load menu items from API, falling back:', err.message);
      setMenuItems((prev) => (prev && prev.length > 0 ? prev : FALLBACK_MENU_ITEMS));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Data Fetch and Real-Time Event Listeners
  useEffect(() => {
    fetchMenuItems();

    const handleSync = () => {
      fetchMenuItems();
    };

    window.addEventListener('ralahami_menu_updated', handleSync);
    window.addEventListener('ralahami_inventory_updated', handleSync);

    const handleStorage = (e) => {
      if (e.key === 'ralahami_menu_sync' || e.key === 'ralahami_inventory_sync') {
        fetchMenuItems();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('ralahami_menu_updated', handleSync);
      window.removeEventListener('ralahami_inventory_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchMenuItems]);

  // Open Modal for Create or Edit
  const handleOpenModal = (dish = null) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  // Handle creating a new dish
  const handleCreateDish = async (dishData) => {
    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      let response;
      try {
        response = await axios.post(`${apiBase}/menu`, dishData);
      } catch (err) {
        try {
          response = await axios.post('/api/menu', dishData);
        } catch {
          response = await apiClient.post('/menu', dishData);
        }
      }

      const createdItem = response?.data?.data || response?.data || {
        id: 'dish-' + Date.now(),
        ...dishData,
        imageUrl: dishData.image_url,
        price: Number(dishData.price),
        spiceLevel: Number(dishData.spice_level)
      };

      // 1. Immediately prepend the new dish to the local table state:
      if (createdItem) {
        setMenuItems((prev) => [createdItem, ...prev]);
      }

      // 2. Reset the category filter back to 'All' so the new dish is visible:
      setSelectedCategory('All');
      setSearchQuery('');
      setMenuSearch('');

      // 3. Close modal and show success toast
      setIsDishModalOpen(false);
      setSelectedDish(null);
      notify('success', 'Dish Created', 'New royal dish published successfully!');

      // 4. Fetch fresh items directly from the backend to ensure 100% DB sync:
      if (typeof fetchMenuItems === 'function') {
        try {
          await fetchMenuItems();
        } catch (fetchErr) {
          console.warn('Backend sync fetch warning:', fetchErr.message);
        }
      }
    } catch (err) {
      console.error('Failed to create dish:', err);
      notify('error', 'Error', err.response?.data?.message || err.message || 'Error creating dish');
      throw err;
    }
  };

  // Callback after Dish is saved (Create or Update)
  const handleDishSaved = async (savedPayload, isEdit, apiResponse) => {
    if (!isEdit) {
      const createdItem = apiResponse?.data?.data || apiResponse?.data || {
        id: 'dish-' + Date.now(),
        ...savedPayload,
        imageUrl: savedPayload.image_url,
        image_url: savedPayload.image_url,
        price: Number(savedPayload.price),
        spiceLevel: Number(savedPayload.spice_level)
      };

      // 1. Immediately prepend the new dish to the local table state:
      if (createdItem) {
        setMenuItems((prev) => [createdItem, ...prev]);
      }

      // 2. Reset category filter back to 'All' so the new dish is visible:
      setSelectedCategory('All');
      setSearchQuery('');
      setMenuSearch('');

      // 3. Close modal and show success toast:
      setIsDishModalOpen(false);
      setSelectedDish(null);
      notify('success', 'Dish Created', 'New royal dish published successfully!');

      // 4. Fetch fresh items directly from the backend to ensure 100% DB sync:
      if (typeof fetchMenuItems === 'function') {
        try {
          await fetchMenuItems();
        } catch (e) {
          console.warn('Backend sync fetch warning:', e.message);
        }
      }
      return;
    }

    // Update existing dish
    const selectedId = selectedDish?.id || selectedDish?.menu_item_id || selectedDish?._id;
    const responseData = apiResponse?.data?.data || apiResponse?.data;
    const updatedDish = {
      id: selectedId,
      ...savedPayload,
      ...(responseData || {}),
      imageUrl: savedPayload.image_url,
      image_url: savedPayload.image_url,
      price: Number(savedPayload.price),
      spiceLevel: Number(savedPayload.spice_level)
    };

    setMenuItems((prev) =>
      prev.map((item) => {
        const itemId = item.id || item.menu_item_id || item._id;
        return String(itemId) === String(selectedId) ? { ...item, ...updatedDish } : item;
      })
    );

    setSelectedCategory('All');
    setSearchQuery('');
    setMenuSearch('');
    setIsDishModalOpen(false);
    setSelectedDish(null);

    notify('success', 'Dish Updated', 'Dish changes updated successfully!');

    window.dispatchEvent(new CustomEvent('ralahami_menu_updated', { detail: { action: 'update', dishId: selectedId } }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ralahami_menu_sync', Date.now().toString());
    }

    try {
      await fetchMenuItems();
    } catch (e) {
      console.warn('Backend sync fetch warning:', e.message);
    }
  };

  // Toggle Availability status
  const handleToggleDishAvailability = async (dish) => {
    const dishId = dish.id || dish.menu_item_id || dish._id;
    const currentStatus = dish.available ?? dish.is_available ?? true;
    const newStatus = !currentStatus;

    // Optimistic UI toggle
    setMenuItems((prev) =>
      prev.map((item) => {
        const id = item.id || item.menu_item_id || item._id;
        return String(id) === String(dishId)
          ? { ...item, available: newStatus, is_available: newStatus }
          : item;
      })
    );

    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      await axios.patch(`${apiBase}/menu/${dishId}/availability`, { is_available: newStatus, available: newStatus }).catch(async () => {
        return await apiClient.patch(`/menu/${dishId}`, { is_available: newStatus, available: newStatus });
      });
    } catch (e) {
      console.warn('Availability status update backend fallback:', e.message);
    }

    notify(
      'info',
      'Menu Status Updated',
      `"${dish.name}" marked as ${newStatus ? 'Available' : '86-ed (Sold Out)'}.`
    );
  };

  // Delete Dish
  const handleDeleteDish = async (dish) => {
    if (isInventorySyncedItem(dish)) {
      notify(
        'warning',
        'Inventory-Synced Item',
        `"${dish.name}" is managed in the Inventory section. To prevent synchronization breaks, please delete it directly from the Inventory & Stock tab.`
      );
      return;
    }

    const dishId = dish.id || dish.menu_item_id || dish._id;
    if (!dishId) return;

    if (window.confirm(`Are you sure you want to remove "${dish.name}" from the active royal menu?`)) {
      try {
        await menuService.deleteMenuItem(dishId);

        setMenuItems((prev) =>
          prev.filter((item) => {
            const id = item.id || item.menu_item_id || item._id;
            return String(id) !== String(dishId);
          })
        );

        notify('success', 'Dish Deleted', `"${dish.name}" was removed from the royal menu.`);

        window.dispatchEvent(
          new CustomEvent('ralahami_menu_updated', {
            detail: { action: 'delete', dishId }
          })
        );
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ralahami_menu_sync', Date.now().toString());
        }
        await fetchMenuItems();
      } catch (e) {
        console.error('Delete dish error:', e);
        notify('error', 'Delete Failed', e.response?.data?.message || e.message || 'Could not delete dish.');
        await fetchMenuItems();
      }
    }
  };

  // Filter Dishes
  const filteredDishes = menuItems.filter((dish) => {
    const dishCategory = getDishCategory(dish);
    const selCat = String(selectedCategory || 'All').trim();

    // 1. Category Filter Matching
    let matchCat = false;
    if (selCat.toLowerCase() === 'all') {
      matchCat = true;
    } else if (dishCategory.toLowerCase() === selCat.toLowerCase()) {
      matchCat = true;
    } else if (String(dish.category_id) === selCat) {
      matchCat = true;
    } else if (CATEGORY_MAP[Number(dish.category_id)] && CATEGORY_MAP[Number(dish.category_id)].toLowerCase() === selCat.toLowerCase()) {
      matchCat = true;
    } else if (
      (selCat.toLowerCase() === 'crafted drinks' || selCat.toLowerCase() === 'hand crafted drinks') &&
      (dishCategory.toLowerCase() === 'crafted drinks' || dishCategory.toLowerCase() === 'hand crafted drinks' || Number(dish.category_id) === 6)
    ) {
      matchCat = true;
    } else if (
      (selCat.toLowerCase() === 'beverages & water bottles' || selCat.toLowerCase() === 'water bottles & beverages') &&
      (dishCategory.toLowerCase().includes('beverage') || dishCategory.toLowerCase().includes('water bottle') || Number(dish.category_id) === 7)
    ) {
      matchCat = true;
    }

    // 2. Search Filter Matching
    const query = (searchQuery || menuSearch || '').toLowerCase().trim();
    const matchSearch =
      !query ||
      (dish.name && String(dish.name).toLowerCase().includes(query)) ||
      (dish.description && String(dish.description).toLowerCase().includes(query)) ||
      dishCategory.toLowerCase().includes(query);

    return matchCat && matchSearch;
  });

  // Paginate filtered dishes
  const totalPages = Math.ceil(filteredDishes.length / DISHES_PER_PAGE);
  const paginatedDishes = filteredDishes.slice((currentPage - 1) * DISHES_PER_PAGE, currentPage * DISHES_PER_PAGE);

  return (
    <div className="menu-management-wrapper fade-in">
      {/* Local Alert Notification Banner */}
      {localNotification && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert
            type={localNotification.type}
            title={localNotification.title}
            message={localNotification.message}
            onDismiss={() => setLocalNotification(null)}
          />
        </div>
      )}

      {/* Toolbar: Search, Category Filter, Refresh & Add Dish CTA */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, maxWidth: '700px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search dishes by name or ingredients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMenuSearch(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {categories.map((cat) => {
              const catVal = typeof cat === 'string' ? cat : (cat.name || cat.id);
              const catLabel = typeof cat === 'string' ? cat : (cat.name || `Category ${cat.id}`);
              return (
                <option key={catVal} value={catVal}>
                  {catLabel}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={fetchMenuItems}
            disabled={loading}
            title="Reload dishes from database"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.55rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          <Plus size={16} style={{ marginRight: '0.4rem' }} />
          Add New Royal Dish
        </Button>
      </div>

      {/* Menu Dishes Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Dish & Image</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Spice</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      border: '2px solid var(--accent-gold)',
                      borderRightColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.75s linear infinite',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <div>Loading royal culinary items from server...</div>
                </td>
              </tr>
            ) : filteredDishes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UtensilsCrossed size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)', opacity: 0.5 }} />
                  <div>No culinary dishes matched your criteria.</div>
                </td>
              </tr>
            ) : (
              paginatedDishes.map((dish) => {
                const dishImg = dish.image_url || dish.image || dish.imageUrl || DEFAULT_DISH_IMAGE;
                const isAvailable = dish.is_available ?? dish.available ?? true;
                const spiceCount = dish.spice_level !== undefined ? Number(dish.spice_level) : (dish.spiceLevel !== undefined ? Number(dish.spiceLevel) : 0);
                const dietaryList = Array.isArray(dish.dietary_tags)
                  ? dish.dietary_tags
                  : Array.isArray(dish.dietary)
                  ? dish.dietary
                  : typeof dish.dietary === 'string'
                  ? dish.dietary.split(',').map((s) => s.trim())
                  : [];
                const isInventoryItem = isInventorySyncedItem(dish);

                return (
                  <tr
                    key={dish.id || dish.menu_item_id || dish._id}
                    style={{
                      borderBottom: '1px solid rgba(42, 48, 66, 0.4)',
                      opacity: isAvailable ? 1 : 0.65,
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    {/* Dish Name, Source Badge, Image Thumbnail & Dietary */}
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-secondary)',
                            flexShrink: 0,
                            border: '1px solid var(--border-subtle)',
                            position: 'relative'
                          }}
                        >
                          <img
                            src={dishImg}
                            alt={dish.name}
                            onError={(e) => {
                              e.target.src = DEFAULT_DISH_IMAGE;
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {dish.name}
                            </span>
                            {isInventoryItem ? (
                              <span
                                className="badge"
                                title="This product is dynamically synchronized from Inventory & Stock"
                                style={{
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  fontSize: '0.7rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Package size={11} /> Inventory Synced
                              </span>
                            ) : (
                              <span
                                className="badge"
                                title="Hand-crafted royal culinary dish managed directly from Menu Suite"
                                style={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                  color: '#60a5fa',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  fontSize: '0.7rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Sparkles size={11} /> Hand-Crafted
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {dietaryList.length > 0 ? dietaryList.join(' • ') : 'Standard Recipe'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-medium)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem'
                        }}
                      >
                        {getDishCategory(dish)}
                      </span>
                    </td>

                    {/* Price in LKR */}
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                      {formatCurrency(dish.price)}
                    </td>

                    {/* Spice Level Indicator */}
                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem' }}>
                      {(() => {
                        const catName = (getDishCategory(dish) || '').toLowerCase();
                        const isDrink =
                          catName.includes('drink') ||
                          catName.includes('beverage') ||
                          dish.category_id === 6 ||
                          dish.category_id === 7 ||
                          isInventoryItem;
                        if (isDrink) {
                          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                        }
                        return spiceCount > 0 ? (
                          <span title={`Spice Level ${spiceCount}/5`}>
                            {'🌶️'.repeat(spiceCount)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Mild</span>
                        );
                      })()}
                    </td>

                    {/* Status Pill Toggle */}
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleDishAvailability(dish)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: isAvailable
                            ? 'var(--accent-emerald-muted)'
                            : 'var(--accent-danger-muted)',
                          color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-danger)'
                        }}
                        title="Click to toggle availability"
                      >
                        {isAvailable ? '● Available' : '○ 86-ed (Sold Out)'}
                      </button>
                    </td>

                    {/* Edit & Role-Protected Delete Actions */}
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(dish)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Edit3 size={13} />
                          Edit
                        </button>
                        {isInventoryItem ? (
                          <button
                            type="button"
                            disabled
                            title="Managed in Inventory — Delete or modify this item from the Inventory & Stock section to prevent synchronization breaks"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px dashed rgba(255, 255, 255, 0.15)',
                              color: 'var(--text-muted)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'not-allowed',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              opacity: 0.6
                            }}
                          >
                            <Lock size={12} />
                            Inventory Locked
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteDish(dish)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--accent-danger)',
                              color: 'var(--accent-danger)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            title="Permanently remove this royal dish"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <RoyalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }}
        itemsPerPage={DISHES_PER_PAGE}
        totalItems={filteredDishes.length}
      />

      {/* ISOLATED DISH FORM MODAL (Prevents remounting and single-character typing bug) */}
      <CreateDishModal
        isOpen={isDishModalOpen}
        onClose={handleCloseModal}
        dish={selectedDish}
        categories={categories}
        onSaved={handleDishSaved}
        onSubmit={handleDishSaved}
      />
    </div>
  );
};

export default MenuManagement;
