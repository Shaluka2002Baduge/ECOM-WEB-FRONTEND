import React, { useState } from 'react';
import { Flame, Clock, Plus, Check, MessageSquare } from 'lucide-react';
import DietaryBadges from './DietaryBadges';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible Raalahami Menu Item Card
 * Ultra-Luxury Sri Lankan Royal Design System
 * Features:
 * - Rounded-2xl card with subtle amber borders & gold hover glow
 * - Spicy chili icons with explicit heat level indication
 * - Prominent prep times badge
 * - Bold Ceylon Royal Gold price
 * - Single-click "+ Add" button with quick feedback animation
 * - WCAG 2.1 AA/AAA Compliant with rich descriptive alt text
 */
export const MenuCard = ({ item }) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(item, 1, specialInstructions);

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

  // Convert spiceLevel number (0-3) to chili icons array
  const spiceCount = typeof item.spiceLevel === 'number' ? item.spiceLevel : 0;
  const spiceLabels = ['Mild / Non-Spicy', 'Gently Spiced', 'Medium Heat', 'Fiery Sri Lankan Heat'];

  return (
    <article
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem', // rounded-2xl
        border: '1px solid rgba(229, 169, 60, 0.22)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: 'var(--bg-surface)',
        height: '100%',
        boxShadow: 'var(--shadow-md)'
      }}
      aria-labelledby={`dish-title-${item.id}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.55)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(229, 169, 60, 0.22)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Dish Image with Prep Time & Spice Badge Overlays */}
      <div
        style={{
          position: 'relative',
          height: '215px',
          backgroundColor: 'var(--bg-secondary)',
          overflow: 'hidden'
        }}
      >
        <img
          src={item.imageUrl}
          alt={`Authentic royal dish: ${item.name}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
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
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}
        >
          <Clock size={12} style={{ color: 'var(--accent-amber)' }} />
          {item.preparationTime || '20 mins'}
        </div>

        {/* Spice Level Indicator Overlay */}
        {spiceCount > 0 && (
          <div
            title={`Spice Level: ${spiceLabels[spiceCount] || 'Spicy'}`}
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              backgroundColor: 'rgba(11, 15, 25, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-full)',
              padding: '0.2rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.15rem'
            }}
          >
            {Array.from({ length: spiceCount }).map((_, idx) => (
              <Flame key={idx} size={12} style={{ color: 'var(--accent-danger)' }} />
            ))}
            <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: '700', marginLeft: '0.25rem' }}>
              {spiceLabels[spiceCount]}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Dietary Badges (Halal, Gluten-Free, Vegan, etc.) */}
        <div style={{ marginBottom: '0.65rem' }}>
          <DietaryBadges dietary={item.dietary} />
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
            id={`dish-title-${item.id}`}
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.01em',
              margin: 0
            }}
          >
            {item.name}
          </h3>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: 'var(--accent-gold)',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap'
            }}
          >
            {formatCurrency(item.price)}
          </span>
        </div>

        {/* Dish Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.55',
            marginBottom: '1rem',
            flex: 1
          }}
        >
          {item.description}
        </p>

        {/* Optional Custom Instructions Input */}
        {showNotesInput && (
          <div style={{ marginBottom: '0.85rem' }}>
            <label
              htmlFor={`notes-${item.id}`}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.25rem'
              }}
            >
              Chef Instructions (e.g. less spice, extra lime):
            </label>
            <input
              id={`notes-${item.id}`}
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Custom culinary note"
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            />
          </div>
        )}

        {/* Action Controls: Quick Notes Toggle & Single-Click "+ Add" CTA */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowNotesInput(!showNotesInput)}
            aria-expanded={showNotesInput ? 'true' : 'false'}
            aria-label={`Add preparation note for ${item.name}`}
            title="Add special chef note"
            style={{
              background: showNotesInput ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              border: `1px solid ${showNotesInput ? 'var(--accent-gold)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-md)',
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

          <Button
            variant={addedRecently ? 'secondary' : 'primary'}
            onClick={handleAddToCart}
            isLoading={isAdding}
            ariaLabel={`Add ${item.name} for ${formatCurrency(item.price)} to royal order`}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontWeight: '700'
            }}
          >
            {addedRecently ? (
              <>
                <Check size={16} style={{ color: 'var(--accent-emerald)' }} />
                Added to Feast
              </>
            ) : (
              <>
                <Plus size={16} />
                + Add to Feast
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default MenuCard;
