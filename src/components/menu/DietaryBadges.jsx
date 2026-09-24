import React from 'react';

/**
 * Accessible Dietary and Spice Badges
 * Provides both visual indicators and screen-reader accessible descriptions
 */
export const DietaryBadges = ({ dietary = [], spiceLevel = 0 }) => {
  const getBadgeStyle = (tag) => {
    switch (tag.toLowerCase()) {
      case 'halal':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'vegetarian':
      case 'vegan':
        return { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399', border: 'rgba(52, 211, 153, 0.3)' };
      case 'gluten-free':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' };
      case 'chef special':
        return { bg: 'rgba(212, 175, 55, 0.15)', text: '#D4AF37', border: 'rgba(212, 175, 55, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const getSpiceDescription = (level) => {
    switch (level) {
      case 0: return 'Mild / No Spice';
      case 1: return 'Gentle Warmth';
      case 2: return 'Medium Sri Lankan Spice';
      case 3: return 'Spicy';
      case 4: return 'Fiery Traditional Heat';
      default: return `${level} chili heat`;
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
      {/* Spice Indicator */}
      {spiceLevel > 0 && (
        <span
          className="badge"
          title={`Spice Level: ${getSpiceDescription(spiceLevel)}`}
          aria-label={`Spice level ${spiceLevel} out of 4: ${getSpiceDescription(spiceLevel)}`}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <span aria-hidden="true">{'🌶️'.repeat(spiceLevel)}</span>
          <span style={{ fontSize: '0.7rem', marginLeft: '0.2rem' }}>Lvl {spiceLevel}</span>
        </span>
      )}

      {/* Dietary Tags */}
      {dietary.map((tag) => {
        const style = getBadgeStyle(tag);
        return (
          <span
            key={tag}
            className="badge"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              border: `1px solid ${style.border}`
            }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default DietaryBadges;
