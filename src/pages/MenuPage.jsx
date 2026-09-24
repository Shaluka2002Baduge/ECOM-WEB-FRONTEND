import React, { useState, useEffect } from 'react';
import CategoryTabs from '../components/menu/CategoryTabs';
import MenuCard from '../components/menu/MenuCard';
import Input from '../components/common/Input';
import menuService from '../services/menuService';

/**
 * Accessible MenuPage
 * Filterable categories, accessible live search, and dietary criteria
 */
export const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, menuData] = await Promise.all([
          menuService.getCategories(),
          menuService.getMenuItems('All', '')
        ]);
        setCategories(cats);
        setItems(menuData);
      } catch (e) {
        console.error('Error loading menu:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items locally for responsive experience
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDietary =
      selectedDietary === 'All' ||
      (item.dietary && item.dietary.some((d) => d.toLowerCase() === selectedDietary.toLowerCase()));

    return matchesCategory && matchesSearch && matchesDietary;
  });

  return (
    <div className="menu-page fade-in" style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            ✦ Royal Culinary Offerings
          </span>
          <h1 style={{ marginBottom: '0.75rem', fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}>
            <span className="text-gradient-gold">Royal A La Carte Menu</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}
          >
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
