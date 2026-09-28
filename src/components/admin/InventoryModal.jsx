import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Isolated Inventory Item Modal Component
 * Clean controlled inputs with manual keyboard typing only (no wheel handlers).
 */
export const InventoryModal = ({
  isOpen,
  onClose,
  item,
  categories = ['Grains', 'Seafood', 'Meat', 'Nuts & Seeds', 'Packaging', 'Sweeteners', 'Dairy/Oils', 'Spices', 'Vegetables'],
  onSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    stock: 0,
    unit: 'kg',
    threshold: 10,
    supplier: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormErrors({});

    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Grains',
        stock: item.stock !== undefined ? item.stock : 0,
        unit: item.unit || 'kg',
        threshold: item.threshold !== undefined ? item.threshold : 10,
        supplier: item.supplier || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Grains',
        stock: 10,
        unit: 'kg',
        threshold: 5,
        supplier: ''
      });
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Item name must be at least 2 characters.';
    }
    const numStock = Number(formData.stock);
    if (isNaN(numStock) || numStock < 0) {
      errors.stock = 'Stock must be 0 or greater.';
    }
    const numThreshold = Number(formData.threshold);
    if (isNaN(numThreshold) || numThreshold < 0) {
      errors.threshold = 'Minimum threshold must be 0 or greater.';
    }
    if (!formData.supplier || formData.supplier.trim().length < 2) {
      errors.supplier = 'Please specify an active supplier.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      ...formData,
      name: formData.name.trim(),
      stock: Number(formData.stock),
      threshold: Number(formData.threshold),
      supplier: formData.supplier.trim()
    };

    try {
      if (onSaved) {
        await onSaved(payload, item?.id);
      }
      onClose();
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: err.message || 'Failed to save inventory.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Adjust Stock: ${item.name}` : 'Register New Raw Material'}
      maxWidth="600px"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.35rem',
            overscrollBehavior: 'contain'
          }}
        >
          {formErrors.general && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {formErrors.general}
            </div>
          )}

          {/* Item Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="inv-name-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Ingredient / Material Name <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="inv-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus={false}
              placeholder="e.g. Fragrant Samba Heritage Rice"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.name ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.name && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          {/* Category & Unit Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="inv-cat-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Inventory Category
              </label>
              <select
                id="inv-cat-select"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inv-unit-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Unit of Measure
              </label>
              <select
                id="inv-unit-select"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {['kg', 'g', 'liters', 'ml', 'bottles', 'leaves', 'packets', 'units'].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock & Low Stock Threshold */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="inv-stock-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Current Available Stock ({formData.unit}) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="inv-stock-input"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                autoFocus={false}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.stock ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.stock && (
                <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.stock}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="inv-threshold-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Low-Stock Alert Threshold ({formData.unit}) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="inv-threshold-input"
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => handleChange('threshold', e.target.value)}
                autoFocus={false}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.threshold ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.threshold && (
                <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.threshold}
                </span>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="inv-supplier-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Primary Estate or Certified Supplier <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="inv-supplier-input"
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              autoFocus={false}
              placeholder="e.g. Polonnaruwa Organic Mills"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.supplier ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.supplier && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.supplier}
              </span>
            )}
          </div>
        </div>

        {/* Modal Action Controls */}
        <div
          className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0 mt-auto"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            marginTop: 'auto',
            flexShrink: 0
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Updating...' : item ? 'Save Stock Changes' : 'Register Material'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryModal;
