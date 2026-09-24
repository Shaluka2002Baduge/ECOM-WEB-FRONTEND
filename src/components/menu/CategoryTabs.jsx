import React from 'react';

/**
 * Accessible Category Tabs
 * Complies with WAI-ARIA Tab Panel Pattern
 */
export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      style={{
        display: 'flex',
        gap: '0.65rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        scrollbarWidth: 'thin'
      }}
    >
      {categories.map((category) => {
        const isSelected = activeCategory.toLowerCase() === category.toLowerCase();
        return (
          <button
            key={category}
            role="tab"
            type="button"
            id={`tab-${category.toLowerCase()}`}
            aria-selected={isSelected ? 'true' : 'false'}
            onClick={() => onSelectCategory(category)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
              backgroundColor: isSelected ? 'var(--accent-gold)' : 'var(--bg-surface)',
              color: isSelected ? '#0B0D11' : 'var(--text-secondary)',
              fontWeight: isSelected ? '700' : '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
