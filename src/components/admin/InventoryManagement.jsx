import React, { useState, useCallback } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2
} from 'lucide-react';
import Button from '../common/Button';
import InventoryModal from './InventoryModal';

const INITIAL_INVENTORY = [
  { id: 'inv-1', name: 'Fragrant Samba Heritage Rice', category: 'Grains', stock: 120, unit: 'kg', threshold: 40, supplier: 'Polonnaruwa Organic Mills' },
  { id: 'inv-2', name: 'Fresh Blue Swimmer Lagoon Mud Crab', category: 'Seafood', stock: 18, unit: 'kg', threshold: 25, supplier: 'Negombo Coastal Co-op' },
  { id: 'inv-3', name: 'Pasture-Raised Black Pork Belly', category: 'Meat', stock: 45, unit: 'kg', threshold: 20, supplier: 'Central Highlands Farm' },
  { id: 'inv-4', name: 'Raw Sri Lankan Whole Cashew Nuts', category: 'Nuts & Seeds', stock: 12, unit: 'kg', threshold: 15, supplier: 'Puttalam Estate' },
  { id: 'inv-5', name: 'Charred & Cured Banana Leaves', category: 'Packaging', stock: 350, unit: 'leaves', threshold: 100, supplier: 'Gampaha Growers' },
  { id: 'inv-6', name: 'Pure Kitul Treacle & Jaggery', category: 'Sweeteners', stock: 28, unit: 'bottles', threshold: 10, supplier: 'Sinharaja Rainforest Guild' },
  { id: 'inv-7', name: 'Fresh Coconut Cream (Fresh Cold Pressed)', category: 'Dairy/Oils', stock: 65, unit: 'liters', threshold: 30, supplier: 'Kurunegala Coconut Triangle' },
  { id: 'inv-8', name: 'Traditional Roasted Jaffna Curry Blend', category: 'Spices', stock: 8, unit: 'kg', threshold: 10, supplier: 'Jaffna Heritage Spices' }
];

export const InventoryManagement = ({ onNotify }) => {
  const [inventoryItems, setInventoryItems] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', 'Grains', 'Seafood', 'Meat', 'Nuts & Seeds', 'Packaging', 'Sweeteners', 'Dairy/Oils', 'Spices', 'Vegetables'];

  const handleAdjustStock = (itemId, delta) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stock + delta);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveInventory = async (savedData, id) => {
    if (id) {
      setInventoryItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...savedData, id } : item))
      );
      if (onNotify) {
        onNotify({ type: 'success', title: 'Inventory Updated', message: `${savedData.name} updated successfully.` });
      }
    } else {
      const newItem = {
        id: 'inv-' + Date.now(),
        ...savedData
      };
      setInventoryItems((prev) => [newItem, ...prev]);
      if (onNotify) {
        onNotify({ type: 'success', title: 'Material Registered', message: `${savedData.name} added to pantry list.` });
      }
    }
  };

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from inventory tracking?`)) {
      setInventoryItems((prev) => prev.filter((i) => i.id !== item.id));
      if (onNotify) {
        onNotify({ type: 'info', title: 'Item Removed', message: `${item.name} removed from inventory records.` });
      }
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockCount = inventoryItems.filter((i) => i.stock <= i.threshold).length;

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

        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          <Plus size={16} style={{ marginRight: '0.4rem' }} />
          Register Raw Material
        </Button>
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
            {filteredItems.map((item) => {
              const isLow = item.stock <= item.threshold;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier: {item.supplier}</span>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.category}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: '700', color: isLow ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                    {item.stock} {item.unit}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Min {item.threshold} {item.unit}
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
