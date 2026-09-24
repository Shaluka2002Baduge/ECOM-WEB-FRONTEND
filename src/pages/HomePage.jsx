import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, Calendar, Compass, ShieldCheck, HeartHandshake, Flame, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import { FALLBACK_MENU_ITEMS } from '../services/menuService';
import MenuCard from '../components/menu/MenuCard';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

/**
 * Raalahami Royal Heritage HomePage
 * Cohesive Sri Lankan Royal Heritage Design System
 * Features:
 * - Modern split-hero section (headline + storytelling on left, floating Ceylon signature dish with radial glow on right)
 * - 3 horizontal promo tiles (Royal Heritage Recipes, Lagoon & Catch, Ayurvedic Herbal Infusions)
 * - Signature Royal Curations showcase
 * - The Raalahami Legacy & EDI Accessibility commitment
 */
export const HomePage = () => {
  const { addItem } = useCart();
  const signatureDishes = FALLBACK_MENU_ITEMS.slice(0, 3);
  const heroDish = FALLBACK_MENU_ITEMS[0]; // Royal Dutch Burgher Lamprais

  return (
    <div className="home-page fade-in">
      {/* 1. SPLIT-HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 0 5.5rem 0',
          background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 175, 55, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(229, 169, 60, 0.08) 0%, transparent 50%), linear-gradient(180deg, rgba(17, 23, 38, 0.8) 0%, #0B0F19 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
        aria-labelledby="hero-heading"
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Headline, Storytelling & CTAs */}
            <div>
              <div
                className="badge badge-gold"
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em'
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                ROYAL SRI LANKAN CULINARY LEGACY
              </div>

              <h1
                id="hero-heading"
                style={{
                  fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em'
                }}
              >
                Feast Like Royal Court at{' '}
                <span className="text-gradient-gold">Raalahami</span>
              </h1>

              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  marginBottom: '2.25rem',
                  maxWidth: '560px'
                }}
              >
                Immerse yourself in authentic Dutch Burgher Lamprais, fiery Jaffna lagoon crab, and slow-braised heirloom curries wrapped in fragrant banana leaves. Delivered fresh to your residence or reserved exclusively for your court.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'center',
                  marginBottom: '2.5rem'
                }}
              >
                <Link to="/menu" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" ariaLabel="Explore the royal culinary menu">
                    <UtensilsCrossed size={18} style={{ marginRight: '0.5rem' }} />
                    Explore Royal Menu ➔
                  </Button>
                </Link>

                <Link to="/reservations" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="lg" ariaLabel="Reserve a table for your party">
                    <Calendar size={18} style={{ marginRight: '0.5rem' }} />
                    Reserve a Table
                  </Button>
                </Link>

                <Link to="/orders/track" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="lg" ariaLabel="Track an ongoing delivery">
                    <Compass size={18} style={{ marginRight: '0.5rem' }} />
                    Track Delivery
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>★</span>
                  <span><strong>4.9 / 5</strong> Royal Dining Rating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>100% Authentic Heirloom Spices</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <HeartHandshake size={16} style={{ color: 'var(--accent-amber)' }} />
                  <span>Halal & Allergy-Conscious Kitchens</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Ceylon Signature Dish with Radial Glow */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {/* Radial Amber Glow */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '360px',
                  height: '360px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(229, 169, 60, 0.12) 50%, transparent 75%)',
                  filter: 'blur(35px)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />

              {/* Floating Featured Dish Card */}
              <div
                className="glass-panel"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  maxWidth: '430px',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2)'
                }}
              >
                {/* Crown Jewel Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 3,
                    background: 'rgba(11, 15, 25, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    letterSpacing: '0.05em'
                  }}
                >
                  <Sparkles size={12} /> CROWN SIGNATURE DISH
                </div>

                {/* Dish Image */}
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={heroDish?.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'}
                    alt="Royal Dutch Burgher Lamprais"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(11, 15, 25, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Clock size={12} style={{ color: 'var(--accent-amber)' }} />
                    45 mins slow bake
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h2
                        style={{
                          fontSize: '1.35rem',
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--text-primary)',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}
                      >
                        {heroDish?.name || 'Royal Dutch Burgher Lamprais'}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-danger)' }}>
                          <Flame size={13} />
                          <Flame size={13} />
                          <span style={{ marginLeft: '0.2rem', color: 'var(--text-muted)' }}>Medium Spiced</span>
                        </span>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-emerald)' }}>Banana Leaf Steamed</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: '800',
                        color: 'var(--accent-gold)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {formatCurrency(heroDish?.price || 1850)}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Fragrant samba rice simmered in rich stock, mixed-meat curry, frikkadels, blachan, and seeni sambol, slow-baked within a scorched banana leaf parcel.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => heroDish && addItem(heroDish, 1)}
                      style={{ flex: 1 }}
                      ariaLabel="Order Royal Dutch Burgher Lamprais"
                    >
                      + Order Signature Dish
                    </Button>
                    <Link to="/menu" style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="md">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE HORIZONTAL PROMO TILES */}
      <section
        style={{
          padding: '3.5rem 0',
          backgroundColor: 'rgba(17, 23, 38, 0.65)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
        aria-label="Culinary highlights"
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Promo Tile 1: Royal Heritage Recipes */}
            <div
              className="luxury-card"
              style={{
                padding: '1.75rem',
                borderLeft: '4px solid var(--accent-gold)'
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)'
                }}
              >
                🏺
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Royal Heritage Recipes
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Slow-simmered in clay pots with Ceylon cinnamon bark, green cardamom, roasted coriander, and rich virgin coconut milk.
              </p>
            </div>

            {/* Promo Tile 2: Lagoon & Ocean Catch */}
            <div
              className="luxury-card"
              style={{
                padding: '1.75rem',
                borderLeft: '4px solid var(--accent-amber)'
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(229, 169, 60, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(229, 169, 60, 0.25)'
                }}
              >
                🦀
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Lagoon & Spice Catch
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Daily wild-caught Jaffna blue swimming crab, jumbo lagoon prawns, and yellowfin tuna tossed with toasted chili powder and murunga leaves.
              </p>
            </div>

            {/* Promo Tile 3: Ayurvedic Herbal Infusions */}
            <div
              className="luxury-card"
              style={{
                padding: '1.75rem',
                borderLeft: '4px solid var(--accent-emerald)'
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                🥥
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Ayurvedic Herbal Infusions
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Spiced King Coconut (Thambili), chilled Ranawara herbal nectar, and Lemongrass-Cardamom elixirs brewed fresh each sunrise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE DISHES SHOWCASE */}
      <section style={{ padding: '4.5rem 0' }} aria-labelledby="signatures-heading">
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                Handcrafted Daily
              </span>
              <h2 id="signatures-heading" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                Signature Royal Curations
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Finest selections crafted using heirloom Ceylon spices and master culinary techniques.
              </p>
            </div>
            <Link to="/menu" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                View Complete Menu ({FALLBACK_MENU_ITEMS.length}+ Dishes) ➔
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

      {/* 4. HERITAGE NARRATIVE & EDI COMMITMENT */}
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
                The Raalahami Legacy
              </span>
              <h2 id="heritage-heading" style={{ marginBottom: '1.25rem' }}>
                Heirloom Recipes, Royal Hospitality
              </h2>
              <p>
                In the historic chieftain mansions of Sri Lanka, a "Raalahami" was revered as a guardian of regional culinary culture and noble hospitality. Feasts were curated with unhurried devotion: roasted cinnamon bark from Negombo, fragrant cardamom from the central highlands, and pure virgin coconut milk pressed at sunrise.
              </p>
              <p>
                Every dish honors that legacy with zero compromises on quality, ethical local sourcing, and warm inclusivity for every patron who crosses our threshold.
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
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  fontSize: '0.875rem'
                }}
              >
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
                  Full keyboard navigation & screen-reader optimized interfaces.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
                  Explicit dietary transparency (Halal, Gluten-Free, Vegan, Allergen disclosures).
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
                  WCAG 2.1 AA contrast compliance across all text and interactive elements.
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
