import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from '../components/menu/CategoryTabs';
import MenuCard from '../components/menu/MenuCard';
import Input from '../components/common/Input';
import RoyalPagination from '../components/common/RoyalPagination';
import menuService from '../services/menuService';

const ITEMS_PER_PAGE = 6;

/**
 * Accessible MenuPage
 * Filterable categories, accessible live search, dietary criteria, and RoyalPagination
 */
export const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData(showLoader = true) {
      if (showLoader) setIsLoading(true);
      try {
        const [cats, menuData] = await Promise.all([
          menuService.getCategories(),
          menuService.getMenuItems('All', '')
        ]);
        if (isMounted) {
          if (Array.isArray(cats) && cats.length > 0) {
            setCategories(cats);
          }
          if (Array.isArray(menuData)) {
            setItems(menuData);
          }
        }
      } catch (e) {
        console.error('Error loading menu:', e);
      } finally {
        if (isMounted && showLoader) {
          setIsLoading(false);
        }
      }
    }

    // Initial mount load
    loadData(true);

    // Event handlers for real-time inventory and menu updates across the app
    const handleSyncEvent = () => {
      loadData(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'ralahami_inventory_sync' || e.key === 'ralahami_menu_sync') {
        loadData(false);
      }
    };

    window.addEventListener('ralahami_inventory_updated', handleSyncEvent);
    window.addEventListener('ralahami_menu_updated', handleSyncEvent);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleSyncEvent);

    // Light periodic polling (every 3.5s) to guarantee real-time reflection
    const pollInterval = setInterval(() => {
      loadData(false);
    }, 3500);

    return () => {
      isMounted = false;
      window.removeEventListener('ralahami_inventory_updated', handleSyncEvent);
      window.removeEventListener('ralahami_menu_updated', handleSyncEvent);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleSyncEvent);
      clearInterval(pollInterval);
    };
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, selectedDietary]);

  // Filter items locally for responsive experience
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemCat = (item.category || '').toLowerCase().trim();
      const activeCat = activeCategory.toLowerCase().trim();

      let matchesCategory = false;
      if (activeCat === 'all') {
        matchesCategory = true;
      } else if (
        activeCat === 'crafted drinks' ||
        activeCat === 'hand crafted drinks' ||
        activeCat === 'crafted-drinks' ||
        activeCat === 'hand-crafted-drinks'
      ) {
        matchesCategory =
          itemCat === 'crafted drinks' ||
          itemCat === 'hand crafted drinks' ||
          itemCat === 'craft beverages' ||
          (!item.is_inventory_item && (itemCat.includes('crafted') || (itemCat.includes('drink') && !itemCat.includes('bottle'))));
      } else if (
        activeCat === 'beverages & water bottles' ||
        activeCat === 'water bottles & beverages' ||
        activeCat === 'beverages-water-bottles'
      ) {
        matchesCategory =
          itemCat === 'beverages & water bottles' ||
          itemCat === 'water bottles & beverages' ||
          item.is_inventory_item === true;
      } else if (itemCat === activeCat) {
        matchesCategory = true;
      } else if (item.originalCategory && item.originalCategory.toLowerCase().trim() === activeCat) {
        matchesCategory = true;
      } else if (itemCat.includes(activeCat) || activeCat.includes(itemCat)) {
        matchesCategory = true;
      }

      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDietary =
        selectedDietary === 'All' ||
        (item.dietary && item.dietary.some((d) => d.toLowerCase() === selectedDietary.toLowerCase()));

      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [items, activeCategory, searchQuery, selectedDietary]);

  // Paginate filtered items
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <div className="menu-page fade-in relative min-h-screen" style={{ padding: '3.5rem 0 5.5rem 0' }}>
      {/* Royal Atmospheric Feast Background Image (Ultra-Vivid Visibility) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/royal-menu-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.92,
          filter: 'saturate(1.2) brightness(1.02) contrast(1.05)'
        }}
        aria-hidden="true"
      />
      {/* Light Translucent Veil to Keep Image Crystal Clear & Food Vibrant */}
      <div
        className="fixed inset-0 pointer-events-none z-0 menu-veil-overlay"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            ✦ Royal Culinary Offerings
          </span>
          <h1
            style={{
              marginBottom: '0.75rem',
              fontSize: 'clamp(2.2rem, 4.5vw, 3rem)',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <span className="text-gradient-gold">Royal Menu</span>
          </h1>
          <p
            style={{
              color: '#F4EDE4',
              maxWidth: '680px',
              margin: 0,
              fontSize: '1.05rem',
              lineHeight: '1.6',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)'
            }}
          >
            Indulge in time-honored recipes simmered in stone claypots and seasoned with authentic Ceylon spices at Raalahami.
          </p>
        </div>

        {/* Filter Bar: Search & Dietary */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Live Search Input */}
          <div style={{ flex: '1 1 300px' }}>
            <Input
              label="Search Dishes or Spices"
              placeholder="e.g. Lamprais, Crab, Coconut, Cashew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="m-0"
            />
          </div>

          {/* Dietary Select Filter */}
          <div style={{ flex: '0 1 220px' }}>
            <label
              htmlFor="dietary-filter"
              style={{
                display: 'block',
                marginBottom: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}
            >
              Dietary Preference
            </label>
            <select
              id="dietary-filter"
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                outline: 'none'
              }}
            >
              <option value="All">All Dietary Choices</option>
              <option value="Halal">Halal</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Chef Special">Chef Specials</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Live Filter Results Announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          Showing {filteredItems.length} dishes for category {activeCategory}
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                border: '3px solid var(--accent-gold)',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.75s linear infinite'
              }}
              aria-hidden="true"
            />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Preparing royal menu...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No royal dishes matched your criteria.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your search terms or dietary filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setSelectedDietary('All');
              }}
              style={{
                background: 'none',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem'
              }}
            >
              {paginatedItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            <RoyalPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredItems.length}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
