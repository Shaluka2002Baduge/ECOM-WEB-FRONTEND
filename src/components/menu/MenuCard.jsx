import React, { useState } from 'react';
import { Flame, Clock, Plus, Check, MessageSquare, Ban } from 'lucide-react';
import DietaryBadges from './DietaryBadges';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

/**
 * Accessible Raalahami Menu Item Card
 * Ultra-Luxury Sri Lankan Royal Design System
 * Enforces User-Side Availability Lock when a dish is 86-ed / Sold out.
 */
export const MenuCard = ({ item, dish: dishProp }) => {
  const dish = item || dishProp || {};
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Check Availability Status
  const isAvailable =
    dish.is_available === false ||
    dish.isAvailable === false ||
    dish.available === false ||
    (dish.status && (String(dish.status).toLowerCase() === 'unavailable' || String(dish.status).toLowerCase() === 'sold out' || String(dish.status).toLowerCase() === '86-ed'))
      ? false
      : (
          dish.is_available === true ||
          dish.isAvailable === true ||
          dish.available === true ||
          String(dish.status).toLowerCase() === 'available' ||
          (dish.is_available === undefined && dish.isAvailable === undefined && dish.available === undefined && dish.status === undefined)
        );

  const handleAddToCart = () => {
    if (!isAvailable) return;

    setIsAdding(true);
    addItem(dish, 1, specialInstructions);

    setTimeout(() => {
      setIsAdding(false);
      setAddedRecently(true);
      setShowNotesInput(false);
      setSpecialInstructions('');

      setTimeout(() => {
        setAddedRecently(false);
      }, 1500);
    }, 300);
  };

  // Convert spiceLevel number (0-5) to chili icons
  const spiceCount = typeof dish.spiceLevel === 'number' ? dish.spiceLevel : (typeof dish.spice_level === 'number' ? dish.spice_level : 0);
  const spiceLabels = ['Mild', 'Gently Spiced', 'Medium Heat', 'Fiery Heat', 'Royal Spicy', 'Ceylon Volcanic'];

  return (
    <article
      className="glass-panel"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
        border: isAvailable ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.35)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: isAvailable ? 'var(--bg-surface)' : 'var(--bg-secondary)',
        height: '100%',
        boxShadow: 'var(--shadow-md)',
        opacity: isAvailable ? 1 : 0.65,
        filter: isAvailable ? 'none' : 'grayscale(40%)'
      }}
      aria-labelledby={`dish-title-${dish.id}`}
      onMouseEnter={(e) => {
        if (isAvailable) {
          e.currentTarget.style.borderColor = 'var(--accent-gold)';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow-gold)';
        }
      }}
      onMouseLeave={(e) => {
        if (isAvailable) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
    >
      {/* FULL CARD WHITE TRANSPARENT OVERLAY (Dims whole container when Unavailable) */}
      {!isAvailable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            borderRadius: '1rem',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              backgroundColor: 'rgba(15, 18, 25, 0.92)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-full, 9999px)',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
          >
            <Ban size={15} /> Currently Unavailable
          </span>
        </div>
      )}

      {/* Dish Image with Prep Time, Spice Badge */}
      <div
        style={{
          position: 'relative',
          height: '215px',
          backgroundColor: 'var(--bg-secondary, #131722)',
          overflow: 'hidden'
        }}
      >
        <img
          src={dish.imageUrl || dish.image_url || dish.image}
          alt={`Authentic royal dish: ${dish.name}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isAvailable ? 'none' : 'grayscale(60%)',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.currentTarget.src = '/images/default-dish.jpg';
          }}
        />

        {/* Preparation Time Pill */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            backgroundColor: 'rgba(11, 15, 25, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-full, 9999px)',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary, #94A3B8)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            zIndex: 4
          }}
        >
          <Clock size={12} style={{ color: 'var(--accent-amber, #F59E0B)' }} />
          {dish.preparationTime || dish.preparation_time || '20 mins'}
        </div>

        {/* Spice Level Overlay */}
        {spiceCount > 0 && isAvailable && (
          <div
            title={`Spice Level: ${spiceLabels[spiceCount] || 'Spicy'}`}
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              backgroundColor: 'rgba(11, 15, 25, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-full, 9999px)',
              padding: '0.2rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.15rem',
              zIndex: 4
            }}
          >
            {Array.from({ length: Math.min(spiceCount, 5) }).map((_, idx) => (
              <Flame key={idx} size={12} style={{ color: 'var(--accent-danger, #EF4444)' }} />
            ))}
            <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: '700', marginLeft: '0.25rem' }}>
              {spiceLabels[spiceCount] || 'Spicy'}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Dietary Badges */}
        <div style={{ marginBottom: '0.65rem' }}>
          <DietaryBadges dietary={dish.dietary || dish.dietary_tags} />
        </div>

        {/* Title and Bold Gold Price */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}
        >
          <h3
            id={`dish-title-${dish.id}`}
            style={{
              fontSize: '1.2rem',
              color: isAvailable ? 'var(--text-primary, #F8FAFC)' : 'var(--text-muted, #94A3B8)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.01em',
              margin: 0
            }}
          >
            {dish.name}
          </h3>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: isAvailable ? 'var(--accent-gold, #D4AF37)' : 'var(--text-muted, #64748B)',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap'
            }}
          >
            {formatPrice(dish.price)}
          </span>
        </div>

        {/* Dish Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #94A3B8)',
            lineHeight: '1.55',
            marginBottom: '1rem',
            flex: 1
          }}
        >
          {dish.description}
        </p>

        {/* Optional Custom Instructions Input */}
        {showNotesInput && isAvailable && (
          <div style={{ marginBottom: '0.85rem' }}>
            <label
              htmlFor={`notes-${dish.id}`}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted, #94A3B8)',
                display: 'block',
                marginBottom: '0.25rem'
              }}
            >
              Chef Instructions (e.g. less spice, extra lime):
            </label>
            <input
              id={`notes-${dish.id}`}
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Custom culinary note"
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-secondary, #131722)',
                color: 'var(--text-primary, #F8FAFC)',
                border: '1px solid var(--border-medium, #2A3042)',
                borderRadius: 'var(--radius-sm, 4px)',
                outline: 'none'
              }}
            />
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center' }}>
          {isAvailable && (
            <button
              type="button"
              onClick={() => setShowNotesInput(!showNotesInput)}
              aria-expanded={showNotesInput ? 'true' : 'false'}
              aria-label={`Add preparation note for ${dish.name}`}
              title="Add special chef note"
              style={{
                background: showNotesInput ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                border: `1px solid ${showNotesInput ? 'var(--accent-gold)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md, 8px)',
                color: showNotesInput ? 'var(--accent-gold)' : 'var(--text-muted)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={16} />
            </button>
          )}

          {isAvailable ? (
            <Button
              variant={addedRecently ? 'secondary' : 'primary'}
              onClick={handleAddToCart}
              isLoading={isAdding}
              ariaLabel={`Add ${dish.name} for ${formatPrice(dish.price)} to royal order`}
              style={{
                flex: 1,
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: '700'
              }}
            >
              {addedRecently ? (
                <>
                  <Check size={16} style={{ color: 'var(--accent-emerald, #10B981)' }} />
                  Added to Feast
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add to Feast
                </>
              )}
            </Button>
          ) : (
            <button
              type="button"
              disabled={true}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                opacity: 0.5,
                cursor: 'not-allowed',
                backgroundColor: 'var(--bg-secondary, #131722)',
                color: 'var(--text-muted, #94A3B8)',
                border: '1px solid var(--border-subtle, #1E2330)'
              }}
            >
              <Ban size={15} /> Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MenuCard;
