import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Layers, UploadCloud, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import ModalWrapper from '../common/ModalWrapper';
import Button from '../common/Button';
import { isValidTextLength, sanitizeInput } from '../../utils/validators';

/**
 * Isolated Inventory Item Modal Component with Conditional Parent-Child Nested Variant Support
 * Fully responsive, conditionally draggable when 'Beverages & Water Bottles' is active,
 * with direct image file upload (<input type="file" accept="image/*" />), live preview,
 * guaranteed pinned action buttons and internal scrolling.
 */
export const InventoryModal = ({
  isOpen,
  onClose,
  item,
  categories = [
    'Grains & Rice',
    'Seafood',
    'Meat & Poultry',
    'Coconuts & Produce',
    'Beverages & Water Bottles',
    'Packaging & Containers',
    'Spices & Seasoning',
    'Sweeteners & Treacle',
    'Dairy & Oils',
    'Nuts & Seeds',
    'General'
  ],
  onSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Beverages & Water Bottles',
    stock: 0,
    unit: 'bottles',
    threshold: 10,
    supplier: '',
    image: '',
    variants: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const isBeveragesCategory = formData.category === 'Beverages & Water Bottles';

  const totalVariantStock = (formData.variants || []).reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0
  );

  useEffect(() => {
    if (!isOpen) return;
    setFormErrors({});
    setImageError('');
    setImageFile(null);

    if (item) {
      const parsedVariants = Array.isArray(item.variants)
        ? item.variants.map((v) => ({
            size: v.size || '',
            stock: Number(v.stock) || 0,
            price: Number(v.price) || 0
          }))
        : [];

      const existingImg = item.image || item.imageUrl || item.image_url || '';
      setImagePreview(existingImg);

      setFormData({
        name: item.name || '',
        category: item.category || 'Grains & Rice',
        stock: item.stock !== undefined ? item.stock : 0,
        unit: item.unit || 'bottles',
        threshold: item.threshold !== undefined ? item.threshold : 10,
        supplier: item.supplier || '',
        image: existingImg,
        variants: parsedVariants
      });
    } else {
      setImagePreview('');
      setFormData({
        name: '',
        category: 'Beverages & Water Bottles',
        stock: 50,
        unit: 'bottles',
        threshold: 10,
        supplier: '',
        image: '',
        variants: [
          { size: '500ml', stock: 20, price: 150 },
          { size: '1L', stock: 15, price: 250 },
          { size: '1.5L', stock: 10, price: 350 },
          { size: '2L', stock: 5, price: 450 }
        ]
      });
    }
  }, [isOpen, item]);

  // Clean up blob preview URL on unmount or file reset
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!isValidTextLength(formData.name, 2, 100)) {
      errors.name = 'Item name must be between 2 and 100 characters.';
    }
    const numStock = Number(formData.stock);
    if (isNaN(numStock) || numStock < 0 || numStock > 100000) {
      errors.stock = 'Stock must be between 0 and 100,000.';
    }
    const numThreshold = Number(formData.threshold);
    if (isNaN(numThreshold) || numThreshold < 0 || numThreshold > 10000) {
      errors.threshold = 'Minimum threshold must be between 0 and 10,000.';
    }
    if (!isValidTextLength(formData.supplier, 2, 100)) {
      errors.supplier = 'Please specify an active supplier (min 2 characters).';
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

  // Variant Management Helpers
  const handleAddVariant = (presetSize = '') => {
    setFormData((prev) => {
      const nextVariants = [
        ...prev.variants,
        { size: presetSize || '', stock: 10, price: 200 }
      ];
      const newStock = nextVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        variants: nextVariants,
        stock: newStock > 0 ? newStock : prev.stock
      };
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedVariants = prev.variants.map((v, i) => {
        if (i !== index) return v;
        return {
          ...v,
          [field]: field === 'size' ? value : Number(value) || 0
        };
      });
      const newStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        variants: updatedVariants,
        stock: newStock
      };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => {
      const filtered = prev.variants.filter((_, i) => i !== index);
      const newStock = filtered.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        variants: filtered,
        stock: filtered.length > 0 ? newStock : prev.stock
      };
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    setImageError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file size must be less than 10MB.');
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    handleChange('image', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const cleanedVariants = isBeveragesCategory
      ? (formData.variants || [])
          .filter((v) => v.size && String(v.size).trim().length > 0)
          .map((v) => ({
            size: String(v.size).trim(),
            stock: Math.max(0, Number(v.stock) || 0),
            price: Math.max(0, Number(v.price) || 0)
          }))
      : [];

    const calculatedStock = isBeveragesCategory && cleanedVariants.length > 0
      ? cleanedVariants.reduce((sum, v) => sum + v.stock, 0)
      : Number(formData.stock);

    const payload = {
      ...formData,
      name: sanitizeInput(formData.name),
      stock: calculatedStock,
      currentStock: calculatedStock,
      threshold: Number(formData.threshold),
      minimumThreshold: Number(formData.threshold),
      supplier: sanitizeInput(formData.supplier),
      variants: cleanedVariants,
      image: imageFile ? '' : (imagePreview || formData.image || ''),
      imageFile: imageFile || undefined
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
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Manage Parent Item: ${item.name}` : 'Register Parent Inventory Item'}
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col flex-1 min-h-0 h-full overflow-hidden"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Scrollable Inner Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-0 overscroll-contain"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {formErrors.general && (
            <div style={{ padding: '0.55rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontSize: '0.8rem' }}>
              {formErrors.general}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label htmlFor="inv-name-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Parent Brand / Product Name <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="inv-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ceylon Artisan Craft Ginger Beer"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.name ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.name && (
              <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          {/* Category & Unit Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label htmlFor="inv-cat-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Inventory Category
              </label>
              <select
                id="inv-cat-select"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.875rem',
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
              <label htmlFor="inv-unit-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Unit of Measure
              </label>
              <select
                id="inv-unit-select"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {['bottles', 'units', 'liters', 'ml', 'kg', 'g', 'leaves', 'packets', 'pieces', 'crates'].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label htmlFor="inv-supplier-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Primary Certified Estate / Supplier <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <input
              id="inv-supplier-input"
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="e.g. Ceylon Craft Brews or Knuckles Mountain Springs"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-secondary)',
                border: formErrors.supplier ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {formErrors.supplier && (
              <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
                {formErrors.supplier}
              </span>
            )}
          </div>

          {/* NESTED SIZE VARIANTS SECTION (Only for Beverages & Water Bottles) */}
          {isBeveragesCategory && (
            <div
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={15} style={{ color: 'var(--accent-gold, #D4AF37)' }} />
                  <label style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--accent-gold, #D4AF37)', margin: 0 }}>
                    Size Variants & Independent Pricing ({formData.variants?.length || 0})
                  </label>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Total: <strong style={{ color: 'var(--text-primary)' }}>{formData.variants?.length > 0 ? totalVariantStock : formData.stock} {formData.unit}</strong>
                </span>
              </div>

              {/* Scrollable Variant Rows if multiple */}
              {formData.variants && formData.variants.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    marginBottom: '0.6rem',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem'
                  }}
                >
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr 1.1fr 32px',
                        gap: '0.45rem',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-surface, #1e222d)',
                        padding: '0.4rem 0.55rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        border: '1px solid rgba(255, 255, 255, 0.07)'
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="Size (e.g. 500ml)"
                          value={v.size}
                          onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.8rem',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontWeight: '600'
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)'
                            }}
                          />
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>qty</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold, #D4AF37)', fontWeight: '600' }}>Rs.</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Price"
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        title="Remove size variant"
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          color: 'var(--accent-danger, #ef4444)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  No nested variants configured yet. Item will use single parent stock tracking.
                </div>
              )}

              {/* Quick Add Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Quick Add:</span>
                {['500ml', '1L', '1.5L', '2L'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleAddVariant(sz)}
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--accent-gold, #D4AF37)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    + {sz}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddVariant('')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  <Plus size={10} /> Custom
                </button>
              </div>
            </div>
          )}

          {/* Current Stock & Low Stock Threshold */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label htmlFor="inv-stock-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Total Available Stock ({formData.unit}) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="inv-stock-input"
                type="number"
                min="0"
                value={isBeveragesCategory && formData.variants?.length > 0 ? totalVariantStock : formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                disabled={isBeveragesCategory && formData.variants?.length > 0}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: isBeveragesCategory && formData.variants?.length > 0 ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-secondary)',
                  border: formErrors.stock ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: isBeveragesCategory && formData.variants?.length > 0 ? 'not-allowed' : 'text'
                }}
              />
              {isBeveragesCategory && formData.variants?.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold, #D4AF37)', marginTop: '0.15rem', display: 'block' }}>
                  Auto-calculated from {formData.variants.length} size variants
                </span>
              )}
              {formErrors.stock && (
                <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
                  {formErrors.stock}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="inv-threshold-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Low-Stock Threshold ({formData.unit}) <span style={{ color: 'var(--accent-amber)' }}>*</span>
              </label>
              <input
                id="inv-threshold-input"
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => handleChange('threshold', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: formErrors.threshold ? '1px solid #ef4444' : '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {formErrors.threshold && (
                <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>
                  {formErrors.threshold}
                </span>
              )}
            </div>
          </div>

          {/* Product Image File Upload & Live Preview */}
          <div>
            <label
              htmlFor="inv-image-file-input"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Product Image Upload
            </label>

            {/* Hidden native file input */}
            <input
              id="inv-image-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              /* Live Preview Card */
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      overflow: 'hidden',
                      border: '1px solid var(--accent-gold, #D4AF37)',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {imageFile ? imageFile.name : (formData.name ? `${formData.name} Photo` : 'Item Image')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)', marginTop: '0.15rem' }}>
                      {imageFile
                        ? `${(imageFile.size / 1024).toFixed(1)} KB • Ready to upload`
                        : 'Image loaded'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: 'var(--radius-sm, 4px)',
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--accent-gold, #D4AF37)',
                      cursor: 'pointer'
                    }}
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove image"
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm, 4px)',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone Input */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 1rem',
                  border: isDragging
                    ? '2px dashed var(--accent-gold, #D4AF37)'
                    : '1px dashed rgba(212, 175, 55, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDragging
                    ? 'rgba(212, 175, 55, 0.12)'
                    : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <UploadCloud
                  size={26}
                  style={{
                    color: isDragging ? 'var(--accent-gold, #D4AF37)' : 'var(--text-secondary)',
                    marginBottom: '0.35rem'
                  }}
                />
                <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Click or drag & drop product photo to upload
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                </div>
              </div>
            )}

            {imageError && (
              <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'block' }}>
                {imageError}
              </span>
            )}
          </div>
        </div>

        {/* Modal Action Controls (Pinned Sticky Footer) */}
        <div
          className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800/80 flex-shrink-0 mt-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 bg-[#0b0c10] sticky bottom-0 z-10"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid rgba(42, 48, 66, 0.8)',
            padding: '0.75rem 1.25rem',
            marginTop: 'auto',
            flexShrink: 0,
            backgroundColor: '#0b0c10'
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : item ? 'Save Parent & Variants' : 'Register Parent Item'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default InventoryModal;
