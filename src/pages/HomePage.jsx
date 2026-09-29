import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, Compass, ShieldCheck, HeartHandshake, Flame, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import { menuService, FALLBACK_MENU_ITEMS } from '../services/menuService';
import MenuCard from '../components/menu/MenuCard';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

/**
 * Raalahami Royal Heritage HomePage
 * Cohesive Sri Lankan Royal Heritage Design System
 * Features:
 * - Animated luxury food video/GIF background in hero section with dark obsidian gradient overlay
 * - Clean original floating Ceylon signature dish with radial glow on right
 * - 3 horizontal promo tiles (Royal Heritage Recipes, Lagoon & Catch, Ayurvedic Herbal Infusions)
 * - Signature Royal Curations showcase with dynamic live API pricing
 * - The Raalahami Legacy & EDI Accessibility commitment
 */
export const HomePage = () => {
  const { addItem } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      try {
        const data = await menuService.getMenuItems('All', '');
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      } catch (err) {
        console.warn('Dynamic menu load error on HomePage:', err);
      } finally {
        if (isMounted) setIsLoadingMenu(false);
      }
    }
    loadMenu();
    return () => { isMounted = false; };
  }, []);

  // Dynamic signature dishes matching:
  // (Lamprais: Rs. 1,850, Jaffna Crab Curry: Rs. 3,800, Black Pork Curry: Rs. 2,200)
  const heroDish = useMemo(() => {
    const lamprais = menuItems.find((i) =>
      i.name.toLowerCase().includes('lamprais') || i.name.toLowerCase().includes('burgher')
    );
    return lamprais || FALLBACK_MENU_ITEMS[0];
  }, [menuItems]);

  const signatureDishes = useMemo(() => {
    // 1. Lamprais (Rs. 1,850)
    const lamprais =
      menuItems.find((i) => i.name.toLowerCase().includes('lamprais')) ||
      FALLBACK_MENU_ITEMS[0];

    // 2. Jaffna Crab Curry (Rs. 3,800)
    const crab =
      menuItems.find((i) => i.name.toLowerCase().includes('crab')) ||
      FALLBACK_MENU_ITEMS[1];

    // 3. Black Pork Curry (Rs. 2,200)
    const pork =
      menuItems.find((i) => i.name.toLowerCase().includes('pork')) ||
      FALLBACK_MENU_ITEMS[2];

    return [lamprais, crab, pork].filter(Boolean);
  }, [menuItems]);

  return (
    <div className="home-page fade-in">
      {/* 1. SPLIT-HERO SECTION WITH LUXURY FOOD VIDEO/GIF BACKGROUND */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 5.5rem 0',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          backgroundColor: '#0B0F19'
        }}
        aria-labelledby="hero-heading"
      >
        {/* Background Looping Food Video / GIF with Obsidian Glass Gradient Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.65,
              filter: 'brightness(0.98) contrast(1.08) saturate(1.15)'
            }}
          >
            <source src="/videos/hero-restaurant.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/31631562/13476222_3840_2160_25fps.mp4" type="video/mp4" />
          </video>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 175, 55, 0.14) 0%, transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(229, 169, 60, 0.08) 0%, transparent 50%), linear-gradient(180deg, rgba(11, 15, 25, 0.45) 0%, rgba(11, 15, 25, 0.62) 65%, #0B0F19 100%)'
            }}
          />
        </div>

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
                  letterSpacing: '0.08em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
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
                  letterSpacing: '0.02em',
                  textShadow: '0 3px 14px rgba(0, 0, 0, 0.85)'
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
                  maxWidth: '560px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.75)'
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

                <Link to="/orders/track" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="lg" ariaLabel="Track an ongoing delivery">
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
                      {formatPrice(heroDish?.price || 1850)}
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

      {/* 2. THREE HORIZONTAL PROMO TILES WITH LIVE BACKGROUND VIDEOS */}
      <section
        style={{
          padding: '3.5rem 0',
          backgroundColor: '#070B14',
          borderBottom: '1px solid var(--border-subtle)'
        }}
        aria-label="Culinary highlights"
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {/* Promo Tile 1: Royal Heritage Recipes (Browsing Recipe Book Video 5970015) */}
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                borderLeft: '4px solid var(--accent-gold)',
                borderTop: '1px solid rgba(212, 175, 55, 0.3)',
                borderRight: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                minHeight: '230px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.55)'
              }}
            >
              {/* Background Video */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.58,
                    filter: 'brightness(0.95) contrast(1.1) saturate(1.2)'
                  }}
                >
                  <source src="/videos/tile-recipes.mp4" type="video/mp4" />
                  <source src="https://videos.pexels.com/video-files/5970015/5970015-uhd_4096_2160_25fps.mp4" type="video/mp4" />
                </video>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(11, 15, 25, 0.5) 0%, rgba(11, 15, 25, 0.78) 70%, #0B0F19 100%)'
                  }}
                />
              </div>

              {/* Content on top */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '3.2rem',
                    height: '3.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(11, 15, 25, 0.85)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  🏺
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                    color: '#F8FAFC',
                    fontFamily: 'var(--font-serif)',
                    textShadow: '0 2px 12px rgba(0,0,0,0.9)'
                  }}
                >
                  Royal Heritage Recipes
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    textShadow: '0 2px 8px rgba(0,0,0,0.85)'
                  }}
                >
                  Slow-simmered in clay pots with Ceylon cinnamon bark, green cardamom, roasted coriander, and rich virgin coconut milk.
                </p>
              </div>
            </div>

            {/* Promo Tile 2: Lagoon & Spice Catch (Seafood Paella & Fresh Catch Video 32797269) */}
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                borderLeft: '4px solid var(--accent-amber)',
                borderTop: '1px solid rgba(229, 169, 60, 0.3)',
                borderRight: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                minHeight: '230px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.55)'
              }}
            >
              {/* Background Video */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.58,
                    filter: 'brightness(0.95) contrast(1.1) saturate(1.2)'
                  }}
                >
                  <source src="/videos/tile-seafood.mp4" type="video/mp4" />
                  <source src="https://videos.pexels.com/video-files/32797269/13981221_1080_1920_30fps.mp4" type="video/mp4" />
                </video>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 80% 20%, rgba(229, 169, 60, 0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(11, 15, 25, 0.5) 0%, rgba(11, 15, 25, 0.78) 70%, #0B0F19 100%)'
                  }}
                />
              </div>

              {/* Content on top */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '3.2rem',
                    height: '3.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(11, 15, 25, 0.85)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(229, 169, 60, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  🦀
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                    color: '#F8FAFC',
                    fontFamily: 'var(--font-serif)',
                    textShadow: '0 2px 12px rgba(0,0,0,0.9)'
                  }}
                >
                  Lagoon & Spice Catch
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    textShadow: '0 2px 8px rgba(0,0,0,0.85)'
                  }}
                >
                  Daily wild-caught Jaffna blue swimming crab, jumbo lagoon prawns, and yellowfin tuna tossed with toasted chili powder and murunga leaves.
                </p>
              </div>
            </div>

            {/* Promo Tile 3: Ayurvedic Herbal Infusions (Refreshing Tamarind Lime Juice Video 34381881) */}
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                borderLeft: '4px solid var(--accent-emerald)',
                borderTop: '1px solid rgba(16, 185, 129, 0.3)',
                borderRight: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                minHeight: '230px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.55)'
              }}
            >
              {/* Background Video */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.58,
                    filter: 'brightness(0.95) contrast(1.1) saturate(1.2)'
                  }}
                >
                  <source src="/videos/tile-herbal.mp4" type="video/mp4" />
                  <source src="https://videos.pexels.com/video-files/34381881/14565478_2160_3840_30fps.mp4" type="video/mp4" />
                </video>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(11, 15, 25, 0.5) 0%, rgba(11, 15, 25, 0.78) 70%, #0B0F19 100%)'
                  }}
                />
              </div>

              {/* Content on top */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '3.2rem',
                    height: '3.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(11, 15, 25, 0.85)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  🥥
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                    color: '#F8FAFC',
                    fontFamily: 'var(--font-serif)',
                    textShadow: '0 2px 12px rgba(0,0,0,0.9)'
                  }}
                >
                  Ayurvedic Herbal Infusions
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    textShadow: '0 2px 8px rgba(0,0,0,0.85)'
                  }}
                >
                  Spiced King Coconut (Thambili), chilled Ranawara herbal nectar, and Lemongrass-Cardamom elixirs brewed fresh each sunrise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE DISHES SHOWCASE (RED MARKED SECTION) */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 5.5rem 0',
          overflow: 'hidden',
          backgroundColor: '#0B0F19',
          borderBottom: '1px solid var(--border-subtle)'
        }}
        aria-labelledby="signatures-heading"
      >
        {/* Background Video: Cooking of Indian/Ceylon Food (9574814) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
              filter: 'brightness(0.95) contrast(1.1) saturate(1.2)'
            }}
          >
            <source src="/videos/curations-cooking.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/9574814/9574814-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 70% 30%, rgba(212, 175, 55, 0.14) 0%, transparent 60%), linear-gradient(180deg, rgba(11, 15, 25, 0.55) 0%, rgba(11, 15, 25, 0.72) 60%, #0B0F19 100%)'
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
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
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                Handcrafted Daily
              </span>
              <h2
                id="signatures-heading"
                style={{
                  fontSize: '2rem',
                  marginBottom: '0.25rem',
                  textShadow: '0 3px 12px rgba(0,0,0,0.85)'
                }}
              >
                Signature Royal Curations
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  margin: 0,
                  textShadow: '0 2px 8px rgba(0,0,0,0.75)'
                }}
              >
                Finest selections crafted using heirloom Ceylon spices and master culinary techniques.
              </p>
            </div>
            <Link to="/menu" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                View Complete Menu ({menuItems.length || FALLBACK_MENU_ITEMS.length}+ Dishes) ➔
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

      {/* 4. HERITAGE NARRATIVE & EDI COMMITMENT (YELLOW MARKED SECTION) */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 5.5rem 0',
          overflow: 'hidden',
          backgroundColor: '#0B0F19',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
        aria-labelledby="heritage-heading"
      >
        {/* Background Video: Putting Green Chili Pepper & Spices (9797433) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.82,
              filter: 'brightness(1.05) contrast(1.1) saturate(1.25)'
            }}
          >
            <source src="/videos/heritage-chili.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/9797433/9797433-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 30% 70%, rgba(229, 169, 60, 0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(11, 15, 25, 0.28) 0%, rgba(11, 15, 25, 0.45) 65%, rgba(11, 15, 25, 0.85) 100%)'
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge badge-gold" style={{ marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', display: 'inline-flex' }}>
              The Raalahami Legacy
            </span>
            <h2
              id="heritage-heading"
              style={{
                fontSize: '2.4rem',
                marginBottom: '1.25rem',
                textShadow: '0 3px 12px rgba(0,0,0,0.85)',
                color: 'var(--text-primary)'
              }}
            >
              Heirloom Recipes, Royal Hospitality
            </h2>
            <p style={{ textShadow: '0 2px 8px rgba(0,0,0,0.75)', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.25rem' }}>
              In the historic chieftain mansions of Sri Lanka, a "Raalahami" was revered as a guardian of regional culinary culture and noble hospitality. Feasts were curated with unhurried devotion: roasted cinnamon bark from Negombo, fragrant cardamom from the central highlands, and pure virgin coconut milk pressed at sunrise.
            </p>
            <p style={{ textShadow: '0 2px 8px rgba(0,0,0,0.75)', color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.7' }}>
              Every dish honors that legacy with zero compromises on quality, ethical local sourcing, and warm hospitality for every patron who crosses our threshold.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
