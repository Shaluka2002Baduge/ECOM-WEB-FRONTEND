import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, Compass, ShieldCheck, HeartHandshake, Flame, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import { menuService, FALLBACK_MENU_ITEMS } from '../services/menuService';
import MenuCard from '../components/menu/MenuCard';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

const NOBLE_CURATIONS = [
  {
    id: 'recipes',
    icon: '🏺',
    title: 'Royal Heritage Recipes',
    description: 'Slow-simmered in clay pots with Ceylon cinnamon bark, green cardamom, roasted coriander, and rich virgin coconut milk.',
    videoSrc: '/videos/tile-recipes.mp4',
    videoFallback: 'https://videos.pexels.com/video-files/5970015/5970015-uhd_4096_2160_25fps.mp4'
  },
  {
    id: 'lagoon',
    icon: '🦀',
    title: 'Lagoon & Spice Catch',
    description: 'Daily wild-caught Jaffna blue swimming crab, jumbo lagoon prawns, and yellowfin tuna tossed with toasted chili powder and murunga leaves.',
    videoSrc: '/videos/tile-seafood.mp4',
    videoFallback: 'https://videos.pexels.com/video-files/32797269/13981221_1080_1920_30fps.mp4'
  },
  {
    id: 'herbal',
    icon: '🥥',
    title: 'Ayurvedic Herbal Infusions',
    description: 'Spiced King Coconut (Thambili), chilled Ranawara herbal nectar, and Lemongrass-Cardamom elixirs brewed fresh each sunrise.',
    videoSrc: '/videos/tile-herbal.mp4',
    videoFallback: 'https://videos.pexels.com/video-files/34381881/14565478_2160_3840_30fps.mp4'
  },
  {
    id: 'claypot',
    icon: '🍲',
    title: 'TRADITIONAL CLAYPOT RICE & CURRY',
    description: 'Fragrant village red rice served with woodfire-simmered dhal, fiery coconut pol sambol, tempered heirloom vegetable curries, and crispy papadam in earthen clay pots.',
    videoSrc: '/videos/habarana-curry.mp4',
    videoFallback: 'https://ak.picdn.net/shutterstock/videos/4154466209/preview/stock-footage-habarana-north-central-province-sri-lanka.mp4'
  },
  {
    id: 'watalappan',
    icon: '🍮',
    title: 'ROYAL WATALAPPAN & CONFECTIONS',
    description: 'Authentic slow-steamed spiced coconut custard infused with pure Kitul jaggery, thick coconut cream, roasted cashews, and crushed green cardamom.',
    videoSrc: '/videos/gemini_generated_video_d8fad616.mp4',
    videoFallback: '/videos/tile-watalappan.mp4'
  }
];

// Triplicated for a true continuous seamless infinite wrap without boundaries
const INFINITE_CURATIONS = [
  ...NOBLE_CURATIONS,
  ...NOBLE_CURATIONS,
  ...NOBLE_CURATIONS
];

// Memoized individual carousel card component with GPU hardware-accelerated transitions
const NobleCurationCard = React.memo(
  React.forwardRef(({ item, index, onClick }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className="group flex-none w-[360px] sm:w-[420px] md:w-[460px] h-[280px] relative rounded-2xl overflow-hidden bg-neutral-950/85 p-7 flex flex-col justify-between select-none will-change-transform transform-gpu backface-hidden scale-90 md:scale-95 z-10 opacity-65 border border-amber-500/20 shadow-md transition-all duration-300 hover:opacity-85 [&.is-active]:scale-105 [&.is-active]:md:scale-110 [&.is-active]:z-20 [&.is-active]:opacity-100 [&.is-active]:border-amber-400/90 cursor-pointer"
      >
        {/* Pre-rendered GPU Hardware-Accelerated Golden Glow Overlay (Zero Dynamic Repaints) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.35)] pointer-events-none transition-opacity duration-300 opacity-0 group-[.is-active]:opacity-100 z-10"
        />

        {/* Background Looping Video with Lightweight Metadata Preload */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
            backgroundColor: '#070B14'
          }}
        >
          <video
            key={`${item.id}-${item.videoSrc}`}
            src={item.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-40 filter brightness-95 contrast-110 saturate-120 transition-transform duration-700 group-[.is-active]:scale-105"
          >
            <source src={item.videoSrc} type="video/mp4" />
            {item.videoFallback && <source src={item.videoFallback} type="video/mp4" />}
          </video>
        </div>

        {/* Bottom Dark Scrim for Crisp Readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-[1] pointer-events-none"
        />

        {/* Icon Badge */}
        <div
          className="p-3 w-fit rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/10 border border-amber-500/30 text-amber-300 shadow-inner transition-transform duration-300 flex items-center justify-center text-2xl relative z-[2] group-[.is-active]:border-amber-400 group-[.is-active]:scale-110"
        >
          {item.icon}
        </div>

        {/* Typography Content */}
        <div className="relative z-[2] mt-auto">
          <h3
            className="text-xl font-serif font-bold drop-shadow-md tracking-wide mb-1.5 transition-colors duration-300 text-amber-200 group-[.is-active]:text-amber-300"
          >
            {item.title}
          </h3>
          <p className="text-neutral-200 text-sm leading-relaxed font-sans drop-shadow-sm font-normal m-0">
            {item.description}
          </p>
        </div>
      </div>
    );
  })
);
NobleCurationCard.displayName = 'NobleCurationCard';

export const HomePage = () => {
  const { addItem } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const activeCardIndexRef = useRef(7);
  const collectionScrollRef = useRef(null);
  const cardElementsRef = useRef([]);

  // Clickless Cursor-Guided Inertia Velocity & Animation Loop Refs
  const targetVelocityRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastSpotlightCheckRef = useRef(0);

  // Seamless Infinite Virtual Wrap
  const handleInfiniteWrap = useCallback(() => {
    const container = collectionScrollRef.current;
    if (!container) return;
    const setWidth = container.scrollWidth / 3;
    if (setWidth <= 0) return;

    if (container.scrollLeft >= setWidth * 2) {
      container.scrollLeft -= setWidth;
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += setWidth;
    }
  }, []);

  // Center Spotlight Detection: Direct DOM classList manipulation with ZERO React re-renders
  const updateCenterCard = useCallback(() => {
    const container = collectionScrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cardElementsRef.current.forEach((el, index) => {
      if (!el) return;
      const cardRect = el.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (activeCardIndexRef.current !== closestIndex) {
      activeCardIndexRef.current = closestIndex;
      cardElementsRef.current.forEach((el, index) => {
        if (!el) return;
        if (index === closestIndex) {
          el.classList.add('is-active');
        } else {
          el.classList.remove('is-active');
        }
      });
    }
  }, []);

  // Hover-to-Move: Cursor tracking relative to container center
  const handleMouseMove = (e) => {
    const container = collectionScrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;

    const normalizedX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);

    // Deadzone: within +/- 15% of center, smooth halt
    if (Math.abs(normalizedX) < 0.15) {
      targetVelocityRef.current = 0;
    } else {
      const sign = Math.sign(normalizedX);
      const intensity = (Math.abs(normalizedX) - 0.15) / 0.85;
      const MAX_SPEED = 14;
      targetVelocityRef.current = sign * Math.pow(intensity, 1.3) * MAX_SPEED;
    }
  };

  const handleMouseLeave = () => {
    targetVelocityRef.current = 0;
  };

  const handleWheel = (e) => {
    const container = collectionScrollRef.current;
    if (!container) return;
    if (e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
      handleInfiniteWrap();
      updateCenterCard();
    }
  };

  // Persistent 60FPS RAF Drift Loop with Smooth Damping (Friction)
  useEffect(() => {
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      // Smooth damping interpolation towards target velocity
      currentVelocityRef.current += (targetVelocityRef.current - currentVelocityRef.current) * 0.08;

      const container = collectionScrollRef.current;
      if (container && Math.abs(currentVelocityRef.current) > 0.04) {
        container.scrollLeft += currentVelocityRef.current;
        handleInfiniteWrap();

        const now = performance.now();
        if (now - lastSpotlightCheckRef.current > 50) {
          lastSpotlightCheckRef.current = now;
          updateCenterCard();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleInfiniteWrap, updateCenterCard]);

  // Initialize carousel position to the middle set on initial load
  useEffect(() => {
    const container = collectionScrollRef.current;
    if (container) {
      const setWidth = container.scrollWidth / 3;
      container.scrollLeft = setWidth;
      const timer = setTimeout(() => {
        updateCenterCard();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateCenterCard]);

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
            preload="metadata"
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
            className="hero-scrim-overlay"
            style={{
              position: 'absolute',
              inset: 0
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
                  className="relative z-10 w-full max-w-[430px] rounded-2xl border border-amber-500/30 bg-neutral-950/80 backdrop-blur-xl shadow-2xl shadow-black/80 hover:border-amber-400/60 hover:shadow-amber-500/10 transition-all duration-500 overflow-hidden group"
                >
                  {/* Crown Jewel Badge */}
                  <div
                    className="absolute top-4 left-4 z-20 bg-neutral-950/90 backdrop-blur-md border border-amber-500/40 rounded-full px-3.5 py-1 text-xs font-bold text-amber-300 flex items-center gap-1.5 tracking-wider shadow-md"
                  >
                    <Sparkles size={12} /> CROWN SIGNATURE DISH
                  </div>

                  {/* Dish Image */}
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={heroDish?.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'}
                      alt="Royal Dutch Burgher Lamprais"
                      loading="lazy"
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
                        className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/40 text-xs tracking-wider whitespace-nowrap"
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
                        className="flex-1"
                        ariaLabel="Order Royal Dutch Burgher Lamprais"
                      >
                        Order Signature Dish
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

      {/* 2. FIVE NOBLE ROYAL CURATIONS INFINITE STREAMING SLIDER WITH CENTER SPOTLIGHT */}
      <section
        className="w-full bg-[#070B14] border-b border-[#242D42] relative z-10 py-10 overflow-hidden"
        aria-label="Noble royal culinary highlights"
      >
        {/* Section Header */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div
            className="badge badge-gold"
            style={{
              marginBottom: '0.6rem',
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
            ROYAL CURATIONS
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-wide m-0">
            The Noble Gastronomy Collection
          </h2>
        </div>

        {/* Infinite Carousel Track with Dynamic Center Spotlight & Mouse Drag-to-Scroll */}
        <div className="w-full overflow-hidden">
          <div
            ref={collectionScrollRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            className="flex gap-6 overflow-x-auto py-8 px-4 sm:px-8 select-none no-scrollbar items-center cursor-default will-change-transform transform-gpu"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'auto'
            }}
          >
            {INFINITE_CURATIONS.map((item, index) => (
              <NobleCurationCard
                key={`${item.id}-${index}`}
                ref={(el) => (cardElementsRef.current[index] = el)}
                item={item}
                index={index}
                onClick={() => {
                  const el = cardElementsRef.current[index];
                  if (el) {
                    targetVelocityRef.current = 0;
                    currentVelocityRef.current = 0;
                    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    setTimeout(updateCenterCard, 350);
                  }
                }}
              />
            ))}
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
            preload="metadata"
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
            className="section-scrim-overlay"
            style={{
              position: 'absolute',
              inset: 0
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
            preload="metadata"
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
            className="section-scrim-overlay"
            style={{
              position: 'absolute',
              inset: 0
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
              Every dish honors that legacy with zero compromises on quality, ethical local sourcing, and warm hospitality for every guest who crosses our threshold.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
