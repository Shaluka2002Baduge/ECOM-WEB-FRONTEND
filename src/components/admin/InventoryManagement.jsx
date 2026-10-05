import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Button from '../common/Button';
import RoyalPagination from '../common/RoyalPagination';
import InventoryModal from './InventoryModal';
import inventoryService, { FALLBACK_INVENTORY_ITEMS } from '../../services/inventoryService';

const INVENTORY_PER_PAGE = 8;

export const InventoryManagement = ({ onNotify }) => {
  const [inventoryItems, setInventoryItems] = useState(FALLBACK_INVENTORY_ITEMS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Inventory from Backend Database
  const fetchInventory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      const data = await inventoryService.getInventory();
      if (Array.isArray(data) && data.length > 0) {
        setInventoryItems(data);
      }
    } catch (err) {
      console.error('[Inventory]: Failed to fetch from database:', err);
      if (typeof onNotify === 'function') {
        onNotify({ type: 'warning', title: 'Offline Mode', message: 'Could not reach backend database; showing local inventory.' });
      }
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [onNotify]);

  useEffect(() => {
    fetchInventory();

    // Auto-sync inventory data in real-time
    const interval = setInterval(() => {
      fetchInventory(true);
    }, 5000);

    const handleFocus = () => fetchInventory(true);
    const handleUpdate = () => fetchInventory(true);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('inventory-updated', handleUpdate);
    window.addEventListener('order-placed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('inventory-updated', handleUpdate);
      window.removeEventListener('order-placed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchInventory]);

  // Reset page to 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery]);

  const categories = [
    'All',
    'Coconuts & Produce',
    'Beverages & Water Bottles',
    'Packaging & Containers',
    'Grains & Rice',
    'Seafood',
    'Meat & Poultry',
    'Spices & Seasoning',
    'Sweeteners & Treacle',
    'Dairy & Oils',
    'Nuts & Seeds',
    'General'
  ];

  // Handle Quick Adjust / Restock
  const handleAdjustStock = async (itemId, delta) => {
    try {
      if (!itemId) return;

      // Optimistic UI update
      setInventoryItems((prev) =>
        (prev || []).map((item) => {
          if (item?.id === itemId) {
            const currentStock = Number(item.stock) || 0;
            const newStock = Math.max(0, currentStock + delta);
            return { ...item, stock: newStock };
          }
          return item;
        })
      );

      // Backend Database Persistence
      const result = await inventoryService.restock(itemId, delta, false);
      if (result && result.data) {
        const updated = result.data;
        setInventoryItems((prev) =>
          (prev || []).map((item) =>
            item?.id === itemId ? { ...item, stock: Number(updated.stock ?? updated.current_stock ?? item.stock) } : item
          )
        );
      }

      if (typeof onNotify === 'function') {
        onNotify({
          type: 'success',
          title: 'Stock Updated',
          message: `Stock level adjusted by ${delta > 0 ? `+${delta}` : delta} units in database.`
        });
      }
    } catch (err) {
      console.error('[Inventory]: Error adjusting stock:', err);
      if (typeof onNotify === 'function') {
        onNotify({ type: 'error', title: 'Restock Failed', message: err.message || 'Could not persist stock update.' });
      }
      fetchInventory(true);
    }
  };

  const handleOpenModal = (item = null) => {
    try {
      setSelectedItem(item ? { ...item } : null);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error opening inventory modal:', err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveInventory = async (savedData, id) => {
    try {
      if (!savedData) return;

      if (id) {
        // Optimistic UI update
        setInventoryItems((prev) =>
          (prev || []).map((item) => (item?.id === id ? { ...item, ...savedData, id } : item))
        );

        // Backend persistence
        const result = await inventoryService.updateInventoryItem(id, savedData);
        if (result && result.data) {
          const updated = result.data;
          setInventoryItems((prev) =>
            (prev || []).map((item) => (item?.id === id ? { ...item, ...updated, id } : item))
          );
        }

        if (typeof onNotify === 'function') {
          onNotify({
            type: 'success',
            title: 'Inventory Updated',
            message: `${savedData.name || 'Item'} updated permanently in database.`
          });
        }
      } else {
        // Backend persistence for new item
        const result = await inventoryService.addInventoryItem(savedData);
        const newItem = result || {
          id: 'inv-' + Date.now(),
          ...savedData
        };

        setInventoryItems((prev) => [newItem, ...(prev || [])]);

        if (typeof onNotify === 'function') {
          onNotify({
            type: 'success',
            title: 'Material Registered',
            message: `${savedData.name || 'Item'} added to database inventory.`
          });
        }
      }

      // Broadcast real-time inventory update event to user menu and across tabs
      window.dispatchEvent(new CustomEvent('ralahami_inventory_updated', { detail: { action: 'save', item: savedData, id } }));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ralahami_inventory_sync', Date.now().toString());
      }

      // Re-sync with backend database
      await fetchInventory(true);
    } catch (err) {
      console.error('[Inventory]: Error saving inventory item:', err);
      if (typeof onNotify === 'function') {
        onNotify({ type: 'error', title: 'Save Failed', message: err.message || 'Could not save inventory item to database.' });
      }
      fetchInventory(true);
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      if (!item?.id) return;
      if (window.confirm(`Are you sure you want to remove "${item.name || 'this item'}" from inventory tracking permanently?`)) {
        // Optimistic UI update
        setInventoryItems((prev) => (prev || []).filter((i) => i?.id !== item.id));

        // Backend Database Deletion
        await inventoryService.deleteInventoryItem(item.id);

        // Broadcast real-time inventory deletion event to user menu and across tabs
        window.dispatchEvent(new CustomEvent('ralahami_inventory_updated', { detail: { action: 'delete', itemId: item.id } }));
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ralahami_inventory_sync', Date.now().toString());
        }

        if (typeof onNotify === 'function') {
          onNotify({
            type: 'info',
            title: 'Item Removed',
            message: `${item.name || 'Item'} permanently deleted from database.`
          });
        }

        // Re-sync with database
        await fetchInventory(true);
      }
    } catch (err) {
      console.error('[Inventory]: Error deleting inventory item:', err);
      if (typeof onNotify === 'function') {
        onNotify({ type: 'error', title: 'Delete Failed', message: err.message || 'Could not delete item from database.' });
      }
      fetchInventory(true);
    }
  };

  const safeInventoryList = Array.isArray(inventoryItems) ? inventoryItems : [];

  const filteredItems = safeInventoryList.filter((item) => {
    if (!item) return false;
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const searchLower = (searchQuery || '').toLowerCase();
    const matchSearch =
      !searchLower ||
      (item.name || '').toLowerCase().includes(searchLower) ||
      (item.supplier || '').toLowerCase().includes(searchLower);
    return matchCat && matchSearch;
  });

  const totalInventoryPages = Math.max(1, Math.ceil(filteredItems.length / INVENTORY_PER_PAGE));
  const paginatedItems = filteredItems.slice((currentPage - 1) * INVENTORY_PER_PAGE, currentPage * INVENTORY_PER_PAGE);

  const lowStockCount = safeInventoryList.filter((i) => (Number(i?.stock) || 0) <= (Number(i?.threshold) || 0)).length;

  return (
    <section aria-label="Inventory Management" className="fade-in">
      {lowStockCount > 0 && (
        <div
          style={{
            backgroundColor: 'var(--accent-danger-muted)',
            border: '1px solid var(--accent-danger)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-primary)'
          }}
        >
          <AlertTriangle size={24} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
          <div>
            <strong>Low Inventory Warning:</strong> {lowStockCount} raw kitchen ingredients are below minimum threshold levels. Immediate restocking recommended.
          </div>
        </div>
      )}

      {/* Toolbar */}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, maxWidth: '650px' }}>
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
              placeholder="Search pantry by name or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => fetchInventory(false)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              cursor: isRefreshing ? 'wait' : 'pointer',
              fontSize: '0.85rem'
            }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <Button variant="primary" onClick={() => handleOpenModal(null)}>
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            Register Raw Material
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Raw Ingredient</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Current Stock</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Threshold</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Quick Adjust</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => {
              const isLow = (Number(item.stock) || 0) <= (Number(item.threshold) || 0);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.image || item.image_url ? (
                        <img
                          src={item.image || item.image_url}
                          alt={item.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-sm, 6px)',
                            objectFit: 'cover',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-sm, 6px)',
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold, #D4AF37)',
                            fontSize: '1.1rem',
                            flexShrink: 0
                          }}
                        >
                          📦
                        </div>
                      )}
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: item.variants?.length ? '0.35rem' : 0 }}>
                          Supplier: <span style={{ color: 'var(--text-secondary)' }}>{item.supplier || 'Local Supplier'}</span>
                        </div>
                        {Array.isArray(item.variants) && item.variants.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                            {item.variants.map((v, vIdx) => (
                              <span
                                key={vIdx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.15rem 0.45rem',
                                  fontSize: '0.7rem',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                  border: '1px solid rgba(212, 175, 55, 0.25)',
                                  color: 'var(--text-primary)'
                                }}
                              >
                                <strong style={{ color: 'var(--accent-gold, #D4AF37)' }}>{v.size}:</strong>
                                <span>{v.stock} qty</span>
                                {v.price ? <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>@ Rs.{v.price}</span> : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.category || 'General'}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: '700', color: isLow ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                    <div>{item.stock} {item.unit || 'kg'}</div>
                    {Array.isArray(item.variants) && item.variants.length > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--accent-gold, #D4AF37)', display: 'block' }}>
                        ({item.variants.length} size variants)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Min {item.threshold} {item.unit || 'kg'}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isLow ? 'var(--accent-danger-muted)' : 'var(--accent-emerald-muted)',
                        color: isLow ? 'var(--accent-danger)' : 'var(--accent-emerald)',
                        border: `1px solid ${isLow ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}
                    >
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item.id, -5)}
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                        title="Decrease 5 units"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item.id, 10)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--accent-gold)',
                          color: 'var(--accent-gold)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                        title="Restock +10 units"
                      >
                        +10 Restock
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--accent-danger)',
                          color: 'var(--accent-danger)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RoyalPagination
        currentPage={currentPage}
        totalPages={totalInventoryPages}
        onPageChange={setCurrentPage}
        itemsPerPage={INVENTORY_PER_PAGE}
        totalItems={filteredItems.length}
      />

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        categories={categories.filter((c) => c !== 'All')}
        onSaved={handleSaveInventory}
      />
    </section>
  );
};

export default InventoryManagement;
