import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { FALLBACK_MENU_ITEMS } from '../services/menuService';
import MenuCard from '../components/menu/MenuCard';

/**
 * Accessible HomePage
 * Royal aesthetics, high contrast, semantic sections
 */
export const HomePage = () => {
  const signatureDishes = FALLBACK_MENU_ITEMS.slice(0, 3);

  return (
    <div className="home-page fade-in">
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 5.5rem 0',
          background: 'linear-gradient(180deg, rgba(20, 23, 31, 0.95) 0%, rgba(11, 13, 17, 1) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
        aria-labelledby="hero-heading"
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div className="badge badge-gold" style={{ marginBottom: '1.25rem' }}>
              ✦ Royal Sri Lankan Culinary Legacy
            </div>
            <h1
              id="hero-heading"
              style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}
            >
              Feast Like Royal Court at <span style={{ color: 'var(--accent-gold)' }}>Ralahami</span>
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '2.5rem',
                maxWidth: '650px'
              }}
            >
              Immerse yourself in authentic Dutch Burgher Lamprais, fiery Jaffna lagoon crab, and slow-braised spices wrapped in fragrant banana leaves. Delivered fresh or reserved exclusively for your court.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/menu" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" ariaLabel="Explore the royal culinary menu">
                  Explore Royal Menu ➔
                </Button>
              </Link>
              <Link to="/reservations" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg" ariaLabel="Reserve a table for your party">
                  Reserve a Table
                </Button>
              </Link>
              <Link to="/orders/track" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="lg" ariaLabel="Track an ongoing delivery">
                  Track Delivery
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Golden Ambient Blur */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />
      </section>

      {/* Signature Dishes Showcase */}
      <section style={{ padding: '4.5rem 0' }} aria-labelledby="signatures-heading">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                Handcrafted Daily
              </span>
              <h2 id="signatures-heading">Signature Royal Curations</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Finest selections crafted using heritage heirloom spices.
              </p>
            </div>
            <Link to="/menu">
              <Button variant="outline" size="sm">
                View Complete Menu ({FALLBACK_MENU_ITEMS.length}+ Dishes)
              </Button>
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}
          >
            {signatureDishes.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Narrative & EDI Commitment Section */}
      <section
        style={{
          padding: '4.5rem 0',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
        aria-labelledby="heritage-heading"
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
                The Ralahami Legacy
              </span>
              <h2 id="heritage-heading" style={{ marginBottom: '1.25rem' }}>
                Heirloom Recipes, Royal Hospitality
              </h2>
              <p>
                In the historic chieftain mansions of Sri Lanka, a "Ralahami" was revered as a guardian of regional culinary culture. Feasts were curated with unhurried devotion: roasted cinnamon bark from Negombo, fragrant cardamom from the central highlands, and pure virgin coconut milk.
              </p>
              <p>
                Every dish honors that legacy with zero compromises on quality, ethical local sourcing, and warm inclusivity for every guest.
              </p>
            </div>

            {/* EDI / Accessibility Feature Box */}
            <div
              className="glass-panel"
              style={{
                padding: '2rem',
                borderLeft: '4px solid var(--accent-gold)'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
                ♿ EDI & Accessible Dining
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                We believe exceptional cuisine must be universally accessible to everyone:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>✓</span> Full keyboard navigation & screen-reader optimized interfaces.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>✓</span> Explicit dietary transparency (Halal, Gluten-Free, Vegan, Allergen disclosures).
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>✓</span> WCAG 2.1 AA contrast compliance across all text and interactive elements.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
