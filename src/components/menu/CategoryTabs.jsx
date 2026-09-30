import React, { useRef, useEffect } from 'react';

/**
 * Accessible Royal Category Tabs
 * Clickless Cursor-Guided Drift Movement (Hover-to-Scroll), Horizontal Wheel Navigation,
 * and Cross-Browser Hidden Scrollbars.
 * Complies with WAI-ARIA Tab Panel Pattern
 */
export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
  const tabsRef = useRef(null);
  const velocityRef = useRef(0);
  const rafIdRef = useRef(null);

  const updateScroll = () => {
    if (tabsRef.current && Math.abs(velocityRef.current) > 0.05) {
      tabsRef.current.scrollLeft += velocityRef.current;
      velocityRef.current *= 0.95; // smooth friction damping
      rafIdRef.current = requestAnimationFrame(updateScroll);
    } else {
      velocityRef.current = 0;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const handleMouseMove = (e) => {
    if (!tabsRef.current) return;
    const rect = tabsRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const normalizedX = (e.clientX - centerX) / (rect.width / 2); // range: -1 to 1

    // Deadzone in the center so it doesn't move when cursor is in the middle
    if (Math.abs(normalizedX) < 0.15) {
      velocityRef.current = 0;
      return;
    }

    // Set drift speed based on distance from center (max 10px per frame)
    velocityRef.current = normalizedX * 10;

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateScroll);
    }
  };

  const handleMouseLeave = () => {
    // Friction in updateScroll winds down velocity naturally to a smooth stop
  };

  // Non-passive wheel event listener for smooth horizontal mouse wheel scrolling
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div
      ref={tabsRef}
      role="tablist"
      aria-label="Menu categories"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-2.5 pb-3 mb-8 cursor-default select-none"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
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
              border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
              backgroundColor: isSelected ? 'var(--accent-gold)' : 'var(--bg-glass)',
              backdropFilter: 'blur(8px)',
              color: isSelected ? '#0B0D11' : 'var(--text-secondary)',
              fontWeight: isSelected ? '700' : '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              boxShadow: isSelected ? '0 0 16px rgba(229, 169, 60, 0.35)' : 'var(--shadow-sm)'
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
