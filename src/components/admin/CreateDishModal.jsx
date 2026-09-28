import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../api/apiClient';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DEFAULT_DISH_IMAGE = '/images/default-dish.jpg';
const FALLBACK_PREVIEW = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Mains' },
  { id: 2, name: 'Seafood' },
  { id: 3, name: 'Starters' },
  { id: 4, name: 'Vegetarian' },
  { id: 5, name: 'Desserts' }
];

/**
 * Isolated Create / Edit Dish Modal Component
 * Completely extracted outside parent components with isolated internal state.
 * Manual keyboard typing only without any wheel event handlers.
 */
export const CreateDishModal = ({
  isOpen,
  onClose,
  dish = null,
  categories = DEFAULT_CATEGORIES,
  onSubmit,
  onSaved
}) => {
  // Normalize categories prop to array of { id, name }
  const normalizedCategories = (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES)
    .filter((c) => (typeof c === 'string' ? c !== 'All' : c.name !== 'All'))
    .map((c, idx) => {
      if (typeof c === 'string') {
        return { id: idx + 1, name: c };
      }
      return {
        id: Number(c.id || idx + 1),
        name: c.name || `Category ${idx + 1}`
      };
    });

  // Direct Standard Controlled State
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price: '',
    description: '',
    spice_level: 0,
    dietary_tags: '',
    image_url: DEFAULT_DISH_IMAGE,
    is_available: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [imagePreview, setImagePreview] = useState(DEFAULT_DISH_IMAGE);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Synchronize state once when modal opens or dish changes
  useEffect(() => {
    if (!isOpen) return;

    setFormErrors({});
    setImageLoadError(false);

    if (dish) {
      const initialImage =
        dish.image_url || dish.imageUrl || dish.image || DEFAULT_DISH_IMAGE;

      let catId = 1;
      if (dish.category_id !== undefined && !isNaN(Number(dish.category_id))) {
        catId = Number(dish.category_id);
      } else if (dish.category) {
        const found = normalizedCategories.find(
          (c) => c.name.toLowerCase() === String(dish.category).toLowerCase()
        );
        catId = found ? found.id : 1;
      }

      const dietaryStr = Array.isArray(dish.dietary_tags)
        ? dish.dietary_tags.join(', ')
        : Array.isArray(dish.dietary)
        ? dish.dietary.join(', ')
        : typeof dish.dietary === 'string'
        ? dish.dietary
        : (dish.dietary_tags || '');

      setFormData({
        name: dish.name || '',
        category_id: catId,
        price: dish.price !== undefined && dish.price !== null ? String(dish.price) : '',
        description: dish.description || '',
        spice_level: dish.spice_level !== undefined ? Number(dish.spice_level) : (dish.spiceLevel !== undefined ? Number(dish.spiceLevel) : 0),
        dietary_tags: dietaryStr,
        image_url: initialImage,
        is_available: dish.is_available ?? (dish.status ? dish.status === 'Available' : (dish.available ?? true))
      });

      setImagePreview(initialImage);
      setImageMode(initialImage && initialImage.startsWith('data:') ? 'upload' : 'url');
    } else {
      const defaultCatId = normalizedCategories[0]?.id || 1;
      setFormData({
        name: '',
        category_id: defaultCatId,
        price: '',
        description: '',
        spice_level: 0,
        dietary_tags: '',
        image_url: DEFAULT_DISH_IMAGE,
        is_available: true
      });
      setImagePreview(DEFAULT_DISH_IMAGE);
      setImageMode('url');
    }
  }, [isOpen, dish]);

  if (!isOpen) return null;

  // Client Validation Logic
  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Dish name must be at least 3 characters long.';
    }
    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      errors.price = 'Please enter a valid price in LKR (e.g., 650, 1550).';
    }
    if (!formData.category_id || isNaN(Number(formData.category_id))) {
      errors.category_id = 'Please select a menu category.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long.';
    }
    if (formData.spice_level < 0 || formData.spice_level > 5) {
      errors.spice_level = 'Spice level must be between 0 and 5.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Image Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, image_url: 'Image file size must be under 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image_url: dataUrl }));
      setImageLoadError(false);
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.image_url;
        return next;
      });
    };
    reader.onerror = () => {
      setFormErrors((prev) => ({ ...prev, image_url: 'Failed to read image file.' }));
    };
    reader.readAsDataURL(file);
  };

  // Direct Image URL change
  const handleImageUrlChange = (url) => {
    setImageLoadError(false);
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, image_url: url }));
    if (formErrors.image_url) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.image_url;
        return next;
      });
    }
  };

  // Reset to default photo
  const handleResetImage = () => {
    setImageLoadError(false);
    setImagePreview(DEFAULT_DISH_IMAGE);
    setFormData((prev) => ({ ...prev, image_url: DEFAULT_DISH_IMAGE }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    const finalImage = imagePreview || formData.image_url || DEFAULT_DISH_IMAGE;

    const dietaryArray = Array.isArray(formData.dietary_tags)
      ? formData.dietary_tags
      : typeof formData.dietary_tags === 'string'
      ? formData.dietary_tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const selectedCategoryObj = normalizedCategories.find(
      (c) => Number(c.id) === Number(formData.category_id)
    );

    const selectedDishId = dish ? (dish.id || dish.menu_item_id || dish._id) : null;

    // Strict payload matching backend specifications
    const payload = {
      name: formData.name.trim(),
      category_id: Number(formData.category_id),
      category: selectedCategoryObj?.name || 'Mains',
      price: Number(formData.price),
      description: formData.description.trim(),
      spice_level: Number(formData.spice_level),
      is_available: Boolean(formData.is_available),
      dietary_tags: dietaryArray,
      dietary: dietaryArray,
      image_url: finalImage,
      imageUrl: finalImage,
      image: finalImage
    };

    try {
      const apiBase = apiClient.baseUrl || 'http://localhost:5000/api';
      let apiResponse = null;

      if (dish && selectedDishId) {
        // PUT /api/menu/:id
        try {
          apiResponse = await axios.put(`${apiBase}/menu/${selectedDishId}`, payload);
        } catch (apiErr) {
          try {
            apiResponse = await apiClient.put(`/menu/${selectedDishId}`, payload);
          } catch (altErr) {
            try {
              apiResponse = await axios.put(`/api/menu/${selectedDishId}`, payload);
            } catch {
              apiResponse = await apiClient.put(`/menu-items/${selectedDishId}`, payload).catch(() => null);
            }
          }
        }
      } else {
        // POST /api/menu
        const newDishPayload = {
          id: 'dish-' + Date.now(),
          ...payload
        };
        try {
          apiResponse = await axios.post(`${apiBase}/menu`, newDishPayload);
        } catch (apiErr) {
          try {
            apiResponse = await apiClient.post('/menu', newDishPayload);
          } catch (altErr) {
            try {
              apiResponse = await axios.post('/api/menu', newDishPayload);
            } catch {
              apiResponse = await apiClient.post('/menu-items', newDishPayload).catch(() => null);
            }
          }
        }
      }

      if (typeof onSaved === 'function') {
        await onSaved(payload, !!dish, apiResponse);
      } else if (typeof onSubmit === 'function') {
        await onSubmit(payload, !!dish, apiResponse);
      }

      onClose();
    } catch (err) {
      console.error('Error saving dish:', err);
      setFormErrors((prev) => ({
        ...prev,
        general: err.response?.data?.message || err.message || 'Failed to save dish to database.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dish ? `Edit Dish: ${dish.name}` : 'Create New Menu Dish'}
      maxWidth="680px"
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
        {/* Inner Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.35rem',
            overscrollBehavior: 'contain'
          }}
        >
          {formErrors.general && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-sm, 6px)',
                color: '#ef4444',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              {formErrors.general}
            </div>
          )}

        {/* Dish Name & Category Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label
              htmlFor="dish-name-field"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Dish Name <span style={{ color: 'var(--accent-amber, #F59E0B)' }}>*</span>
            </label>
            <input
              id="dish-name-field"
              type="text"
              value={formData.name || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, name: val }));
                if (formErrors.name) {
                  setFormErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }
              }}
              placeholder="e.g. Royal Dutch Burgher Lamprais"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary, #131722)',
                border: formErrors.name ? '1px solid #ef4444' : '1px solid var(--border-medium, #2A3042)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--text-primary, #F8FAFC)',
                outline: 'none'
              }}
            />
            {formErrors.name && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="dish-category-field"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Category <span style={{ color: 'var(--accent-amber, #F59E0B)' }}>*</span>
            </label>
            <select
              id="dish-category-field"
              value={formData.category_id}
              onChange={(e) => {
                const numVal = Number(e.target.value);
                setFormData((prev) => ({ ...prev, category_id: numVal }));
                if (formErrors.category_id) {
                  setFormErrors((prev) => {
                    const next = { ...prev };
                    delete next.category_id;
                    return next;
                  });
                }
              }}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary, #131722)',
                border: formErrors.category_id ? '1px solid #ef4444' : '1px solid var(--border-medium, #2A3042)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--text-primary, #F8FAFC)',
                outline: 'none'
              }}
            >
              <option value="">-- Select Category --</option>
              {normalizedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.category_id && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.category_id}
              </span>
            )}
          </div>
        </div>

        {/* Image Handling Section */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(212, 175, 55, 0.04)',
            border: formErrors.image_url ? '1px solid #ef4444' : '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: 'var(--accent-gold, #D4AF37)'
              }}
            >
              <ImageIcon size={16} /> Dish Presentation Image
            </label>

            {/* Image Mode Buttons */}
            <div
              style={{
                display: 'inline-flex',
                gap: '0.35rem',
                backgroundColor: 'var(--bg-surface, #0F1219)',
                padding: '2px',
                borderRadius: 'var(--radius-sm, 4px)',
                border: '1px solid var(--border-subtle, #1E2330)'
              }}
            >
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs, 3px)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: imageMode === 'upload' ? 'var(--accent-gold, #D4AF37)' : 'transparent',
                  color: imageMode === 'upload' ? '#0B0D11' : 'var(--text-secondary, #94A3B8)',
                  fontWeight: imageMode === 'upload' ? '700' : '500'
                }}
              >
                <Upload size={12} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs, 3px)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: imageMode === 'url' ? 'var(--accent-gold, #D4AF37)' : 'transparent',
                  color: imageMode === 'url' ? '#0B0D11' : 'var(--text-secondary, #94A3B8)',
                  fontWeight: imageMode === 'url' ? '700' : '500'
                }}
              >
                <LinkIcon size={12} /> Image URL
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', alignItems: 'center' }}>
            {/* Image Preview Box */}
            <div
              style={{
                width: '110px',
                height: '85px',
                borderRadius: 'var(--radius-md, 8px)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary, #131722)',
                border: '1px solid var(--border-medium, #2A3042)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {imagePreview && !imageLoadError ? (
                <img
                  src={imagePreview}
                  alt="Dish preview"
                  onError={() => {
                    if (imagePreview !== FALLBACK_PREVIEW) {
                      setImagePreview(FALLBACK_PREVIEW);
                    } else {
                      setImageLoadError(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted, #94A3B8)', fontSize: '0.7rem', padding: '0.25rem' }}>
                  <AlertTriangle size={18} style={{ margin: '0 auto 2px auto', color: 'var(--accent-amber, #F59E0B)' }} />
                  Image Error
                </div>
              )}
            </div>

            {/* Input by Image Mode */}
            <div>
              {imageMode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{
                      display: 'block',
                      width: '100%',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #94A3B8)',
                      padding: '0.4rem 0'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)', marginTop: '0.2rem' }}>
                    Select PNG, JPG, WEBP or AVIF (Max 5MB).
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--bg-secondary, #131722)',
                      border: '1px solid var(--border-medium, #2A3042)',
                      borderRadius: 'var(--radius-sm, 4px)',
                      color: 'var(--text-primary, #F8FAFC)',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)', marginTop: '0.2rem' }}>
                    Direct image web address for real-time preview.
                  </div>
                </div>
              )}

              {/* Reset image button */}
              <div style={{ marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleResetImage}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94A3B8)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0
                  }}
                >
                  <RotateCcw size={11} /> Reset Image
                </button>
              </div>

              {formErrors.image_url && (
                <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.image_url}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price & Spice Level Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Price - Keyboard Typing Only without wheel handlers */}
          <div>
            <label
              htmlFor="dish-price-field"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Price (LKR) <span style={{ color: 'var(--accent-amber, #F59E0B)' }}>*</span>
            </label>
            <input
              id="dish-price-field"
              type="number"
              min="0"
              placeholder="e.g. 1550"
              value={formData.price || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, price: val }));
                if (formErrors.price) {
                  setFormErrors((prev) => {
                    const next = { ...prev };
                    delete next.price;
                    return next;
                  });
                }
              }}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary, #131722)',
                border: formErrors.price ? '1px solid #ef4444' : '1px solid var(--border-medium, #2A3042)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--text-primary, #F8FAFC)',
                outline: 'none'
              }}
            />
            {formErrors.price && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.price}
              </span>
            )}
          </div>

          {/* Spice Level (0 to 5) */}
          <div>
            <label
              htmlFor="dish-spice-field"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Spice Level (0 to 5)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '42px' }}>
              <input
                id="dish-spice-field"
                type="range"
                min="0"
                max="5"
                value={formData.spice_level}
                onChange={(e) => setFormData((prev) => ({ ...prev, spice_level: Number(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--accent-gold, #D4AF37)', cursor: 'pointer' }}
              />
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--accent-gold, #D4AF37)',
                  minWidth: '55px',
                  textAlign: 'right'
                }}
              >
                {formData.spice_level > 0 ? `${'🌶️'.repeat(formData.spice_level)} (${formData.spice_level})` : 'Mild (0)'}
              </span>
            </div>
            {formErrors.spice_level && (
              <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {formErrors.spice_level}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="dish-desc-field"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary, #94A3B8)',
              marginBottom: '0.35rem'
            }}
          >
            Description <span style={{ color: 'var(--accent-amber, #F59E0B)' }}>*</span>
          </label>
          <textarea
            id="dish-desc-field"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, description: val }));
              if (formErrors.description) {
                setFormErrors((prev) => {
                  const next = { ...prev };
                  delete next.description;
                  return next;
                });
              }
            }}
            placeholder="Aromatic spices, slow-cooked meat or vegetables, authentic Ceylon recipe..."
            style={{
              width: '100%',
              padding: '0.7rem 0.9rem',
              fontSize: '0.95rem',
              backgroundColor: 'var(--bg-secondary, #131722)',
              border: formErrors.description ? '1px solid #ef4444' : '1px solid var(--border-medium, #2A3042)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--text-primary, #F8FAFC)',
              outline: 'none',
              resize: 'vertical'
            }}
          />
          {formErrors.description && (
            <span className="text-red-400 text-xs mt-1" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {formErrors.description}
            </span>
          )}
        </div>

        {/* Dietary Tags & Availability Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <label
              htmlFor="dish-dietary-field"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Dietary Tags (comma-separated)
            </label>
            <input
              id="dish-dietary-field"
              type="text"
              value={formData.dietary_tags || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, dietary_tags: val }));
              }}
              placeholder="Halal, Gluten-Free, Chef Special"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary, #131722)',
                border: '1px solid var(--border-medium, #2A3042)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--text-primary, #F8FAFC)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #94A3B8)',
                marginBottom: '0.35rem'
              }}
            >
              Kitchen Availability
            </label>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, is_available: !prev.is_available }))}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-medium, #2A3042)',
                cursor: 'pointer',
                backgroundColor: formData.is_available
                  ? 'var(--accent-emerald-muted, rgba(16, 185, 129, 0.15))'
                  : 'var(--accent-danger-muted, rgba(239, 68, 68, 0.15))',
                color: formData.is_available ? 'var(--accent-emerald, #10B981)' : 'var(--accent-danger, #EF4444)'
              }}
            >
              {formData.is_available ? '● In Stock (Available)' : '○ 86-ed (Sold Out)'}
            </button>
          </div>
        </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0 mt-auto"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle, #1E2330)',
            paddingTop: '0.85rem',
            marginTop: 'auto',
            flexShrink: 0
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving Dish...' : dish ? 'Save Changes' : 'Publish Dish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const EditDishModal = CreateDishModal;
export const DishFormModal = CreateDishModal;

export default CreateDishModal;
