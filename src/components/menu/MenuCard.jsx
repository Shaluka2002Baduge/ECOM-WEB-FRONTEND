import React, { useState } from 'react';
import DietaryBadges from './DietaryBadges';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

/**
 * Accessible Menu Item Card
 * WCAG 2.1 Compliant with rich descriptive image alternative texts
 */
export const MenuCard = ({ item }) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(item, 1, specialInstructions);
    setTimeout(() => {
      setIsAdding(false);
      setShowNotesInput(false);
      setSpecialInstructions('');
    }, 400);
  };

  return (
    <article
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
        height: '100%'
      }}
      aria-labelledby={`dish-title-${item.id}`}
    >
      {/* Image with explicit aspect ratio & descriptive alt text */}
      <div style={{ position: 'relative', height: '210px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <img
          src={item.imageUrl}
          alt={`Freshly prepared royal dish: ${item.name} with authentic Sri Lankan ingredients`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            // High-contrast fallback placeholder if external image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}
        >
          ⏱ {item.preparationTime || '20 mins'}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '0.65rem' }}>
          <DietaryBadges dietary={item.dietary} spiceLevel={item.spiceLevel} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3
            id={`dish-title-${item.id}`}
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              margin: 0
            }}
          >
            {item.name}
          </h3>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--accent-gold)',
              whiteSpace: 'nowrap'
            }}
          >
            {formatCurrency(item.price)}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            marginBottom: '1rem',
            flex: 1
          }}
        >
          {item.description}
        </p>

        {/* Optional dietary custom note toggle */}
        {showNotesInput && (
          <div style={{ marginBottom: '0.75rem' }}>
            <label
              htmlFor={`notes-${item.id}`}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}
            >
              Chef Instructions (e.g. less salt, extra mild):
            </label>
            <input
              id={`notes-${item.id}`}
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Allergy / preparation note"
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowNotesInput(!showNotesInput)}
            aria-expanded={showNotesInput ? 'true' : 'false'}
            aria-label={`Add special preparation note for ${item.name}`}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            title="Custom preparation note"
          >
            📝
          </button>

          <Button
            variant="primary"
            onClick={handleAddToCart}
            isLoading={isAdding}
            ariaLabel={`Add ${item.name} for ${formatCurrency(item.price)} to cart`}
            style={{ flex: 1 }}
          >
            Add to Royal Order
          </Button>
        </div>
      </div>
    </article>
  );
};

export default MenuCard;
