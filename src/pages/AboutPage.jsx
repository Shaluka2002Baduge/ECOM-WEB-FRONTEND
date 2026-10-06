import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Award, 
  Clock, 
  MapPin, 
  HeartHandshake, 
  ChevronRight,
  UtensilsCrossed,
  Wine
} from 'lucide-react';
import Button from '../components/common/Button';

/**
 * About Us Page - The Royal Heritage of Raalahami
 * Captures Sri Lankan aristocratic culinary traditions, heirloom recipes,
 * sustainably sourced Ceylon spices, and palatial fine dining halls.
 */
const AboutPage = () => {
  const heritageStats = [
    { value: '40+', label: 'Heirloom Royal Recipes', desc: 'Preserved from 18th-century Kandyan chieftain culinary manuscripts.' },
    { value: '100%', label: 'Single-Origin Spices', desc: 'Handpicked from organic spice gardens in Matale & Kandy.' },
    { value: '3', label: 'Palatial Dining Halls', desc: 'The Grand Courtyard, Balcony Court, and Exclusive Private Suite.' },
    { value: '15,000+', label: 'Delighted Royal Patrons', desc: 'Serving local connoisseurs and international dignitaries.' }
  ];

  const coreValues = [
    {
      icon: Crown,
      title: 'Aristocratic Legacy',
      description: 'Every dish honors the grandeur of traditional Sri Lankan royalty, curated from authentic chieftain family archives and served with utmost distinction.'
    },
    {
      icon: Flame,
      title: 'Artisan Claypot Craft',
      description: 'Slow-simmered in seasoned unglazed earthenware over aromatic cinnamon and coconut shell embers to extract deep, intoxicating flavor profiles.'
    },
    {
      icon: Compass,
      title: 'Ethical Coastal Harvest',
      description: 'Daily wild-caught lagoon mud crabs from Jaffna, jumbo prawns from Negombo, and yellowfin tuna sourced directly from verified artisanal fishermen.'
    },
    {
      icon: Wine,
      title: 'Botanical Artisan Elixirs',
      description: 'Handcrafted mocktails and infusions pairing King Coconut water, Ceylon wild passionfruit, lemongrass, and mountain botanicals.'
    }
  ];

  const diningHalls = [
    {
      name: 'Royal Dining Hall',
      subtitle: 'Main Courtyard & Heirloom Dining',
      description: 'Soaring carved timber ceilings, warm amber lantern glow, and hand-embroidered velvet booths designed for grand celebrations and family feasts.',
      capacity: 'Seats up to 60 Guests',
      atmosphere: 'Aristocratic & Celebratory'
    },
    {
      name: 'Balcony Court',
      subtitle: 'Open-Air Riverside Verandah',
      description: 'Breathtaking open-air dining capturing the evening riverside breeze from Kalu Ganga in Ratnapura, adorned with hanging brass lanterns and lush tropical foliage.',
      capacity: 'Seats up to 36 Guests',
      atmosphere: 'Romantic & Serene'
    },
    {
      name: 'Private Suite',
      subtitle: 'VIP Chieftain Chamber',
      description: 'An exclusive mahogany-paneled sanctuary with dedicated royal butler protocol, antique silver tableware, and bespoke multi-course degustation menus.',
      capacity: 'Intimate 4 to 12 Guests',
      atmosphere: 'Ultra-Exclusive & Diplomatic'
    }
  ];

  return (
    <div className="about-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. Hero Section with Cinematic Background & Gold Typography */}
      <section 
        style={{
          position: 'relative',
          paddingTop: '6rem',
          paddingBottom: '5rem',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div 
          className="hero-scrim-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem'
            }}
          >
            <Crown size={16} />
            The Legend of Raalahami
          </div>

          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              maxWidth: '900px',
              margin: '0 auto 1.5rem auto'
            }}
          >
            Guardians of <span className="text-gradient-gold">Ceylon’s Royal</span> Culinary Heritage
          </h1>

          <p 
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '760px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.7
            }}
          >
            Born from aristocratic Kandyan chieftain traditions, Raalahami brings centuries-old secret spice alchemy, slow-earthenware firecraft, and palatial hospitality to modern fine dining.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu">
              <Button variant="gold" size="lg" style={{ minWidth: '180px' }}>
                <UtensilsCrossed size={18} style={{ marginRight: '0.5rem' }} />
                Explore Feast Menu
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" style={{ minWidth: '180px' }}>
                <Compass size={18} style={{ marginRight: '0.5rem' }} />
                Visit The Palace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Heritage Milestones / Statistics */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem'
            }}
          >
            {heritageStats.map((stat, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  position: 'relative'
                }}
              >
                <div 
                  className="text-gradient-gold"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2.8rem',
                    fontWeight: '800',
                    lineHeight: 1,
                    marginBottom: '0.5rem'
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.4rem'
                  }}
                >
                  {stat.label}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Chieftain Story & Artisan Philosophy */}
      <section style={{ padding: '5rem 0', position: 'relative' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Story Description */}
            <div>
              <span 
                style={{
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  display: 'block',
                  marginBottom: '0.75rem'
                }}
              >
                Our Founding Legacy
              </span>
              <h2 
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  marginBottom: '1.5rem',
                  color: 'var(--text-primary)'
                }}
              >
                A Celebration of Aristocratic Spice Craft & Royal Fire
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                In ancient Sri Lanka, the <em>Raalahami</em> was the revered custodian of the region—master of ceremonies, host to royals, and patron of grand seasonal banquets. His private kitchens were sanctuaries of secret roasting techniques, hand-ground heirloom curries, and botanical elixirs brewed from the island’s richest soils.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.75rem' }}>
                Today, Raalahami resurrects this royal pedigree at our riverside sanctuary in Ratnapura. We reject commercial shortcuts, preparing every paste with stone pestles and simmering curries in unglazed clay pots to capture the authentic, complex depths of Sri Lankan spice culture.
              </p>

              <div 
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)',
                  borderLeft: '4px solid var(--accent-gold)',
                  marginBottom: '2rem'
                }}
              >
                <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>
                  "To dine at Raalahami is not merely to take a meal; it is an initiation into the splendor, fragrance, and warmth of ancient Ceylon."
                </p>
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                  — Executive Chef & Culinary Historian
                </span>
              </div>
            </div>

            {/* Visual Highlight Cards Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {coreValues.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <div 
                    key={idx}
                    className="luxury-card"
                    style={{
                      padding: '1.75rem 1.25rem',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div 
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(229, 169, 60, 0.15)',
                        color: 'var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <IconComponent size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                      {val.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Royal Dining Chambers Showcase */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
            <span 
              style={{
                color: 'var(--accent-gold)',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Palatial Architecture
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3vw, 2.75rem)', color: 'var(--text-primary)' }}>
              Our Three Distinct Dining Chambers
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Whether you seek an intimate candlelit celebration, breezy verandah dining, or high-level VIP diplomacy, our estate offers distinct environments tailored to your occasion.
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}
          >
            {diningHalls.map((hall, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '2.25rem 1.75rem',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                        {hall.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '600' }}>
                        {hall.subtitle}
                      </span>
                    </div>
                    <span 
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                        color: 'var(--accent-gold)',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}
                    >
                      {hall.capacity}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {hall.description}
                  </p>
                </div>

                <div 
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Atmosphere: <strong style={{ color: 'var(--text-primary)' }}>{hall.atmosphere}</strong>
                  </span>
                  <Link 
                    to="/menu"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Reserve <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section style={{ padding: '5rem 0', position: 'relative' }}>
        <div className="container">
          <div 
            className="glass-panel"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.15)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <Crown size={36} style={{ color: 'var(--accent-gold)', margin: '0 auto 1rem auto' }} />
            <h2 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}
            >
              Experience The Royal Hospitality of Raalahami
            </h2>
            <p 
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                maxWidth: '650px',
                margin: '0 auto 2rem auto',
                lineHeight: 1.7
              }}
            >
              Join us for lunch, twilight ocean cocktails, or an opulent evening banquet in our heritage dining chambers.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/menu">
                <Button variant="gold" size="lg">
                  <UtensilsCrossed size={18} style={{ marginRight: '0.5rem' }} />
                  Reserve a Table or Order Online
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  <MapPin size={18} style={{ marginRight: '0.5rem' }} />
                  Contact Palace Concierge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
