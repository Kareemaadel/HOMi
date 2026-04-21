import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, ShieldCheck, CreditCard, FileSignature, 
  Star, ArrowRight, Menu, X, CheckCircle,
  MapPin, Bed, Bath, Maximize, Zap, PlayCircle
} from 'lucide-react';
import './GuestHome.css';
import PropertyDetailedModal, {
    type PropertyDetailModalProperty,
} from '../../BrowseProperties/components/PropertyDetailedModal';
import AuthModal from '../../../components/global/AuthModal';

type GuestHomeListing = {
    id: number;
    title: string;
    price: number;
    currency?: string;
    location?: string;
    type?: string;
    beds: number;
    baths: number;
    sqft: number;
    rating: number;
    reviews?: number;
    image: string;
    hostImg?: string;
    badge?: string;
};

const mapGuestHomeListingToModal = (p: GuestHomeListing): PropertyDetailModalProperty => ({
    id: p.id,
    title: p.title,
    address: p.location,
    price: p.price,
    securityDeposit: 0,
    image: p.image,
    allImages: [p.image],
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    ownerName: 'Host',
    ownerImage: p.hostImg,
    ownerVerified: false,
    locationLat: null,
    locationLng: null,
    availabilityDateISO: null,
    listedAtISO: new Date().toISOString(),
    maintenanceResponsibilities: [],
    petsAllowed: false,
    targetTenant: 'Any Tenant',
    furnishing: 'Unfurnished',
    availableDate: 'Not specified',
    description: '',
    tags: p.badge ? [p.badge] : [],
    rating: p.rating,
});

const GuestHome: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getHelpFromGuest = {
    pathname: '/get-help',
    state: { fromGuestHome: true },
  };
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetailModalProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProtectedAction = () => {
    setShowAuthModal(true);
  };

  const handlePropertyClick = (property: GuestHomeListing) => {
    setSelectedProperty(mapGuestHomeListingToModal(property));
    setIsModalOpen(true);
  };

  // Expanded to 5 properties
  const mockProperties: GuestHomeListing[] = [
    { 
      id: 1, 
      title: 'Modern Loft with Nile View', 
      price: 15000, 
      currency: 'EGP',
      location: 'Zamalek, Cairo', 
      type: 'Apartment', 
      beds: 2, baths: 2, sqft: 120,
      rating: 4.9, reviews: 34,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      hostImg: 'https://i.pravatar.cc/150?u=1',
      badge: 'Superhost'
    },
    { 
      id: 2, 
      title: 'Luxury Smart Villa', 
      price: 45000, 
      currency: 'EGP',
      location: 'Sheikh Zayed, Giza', 
      type: 'Villa', 
      beds: 4, baths: 5, sqft: 450,
      rating: 5.0, reviews: 12,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      hostImg: 'https://i.pravatar.cc/150?u=2',
      badge: 'Premium'
    },
    { 
      id: 3, 
      title: 'Cozy Tech Hub Studio', 
      price: 9000, 
      currency: 'EGP',
      location: 'Maadi, Cairo', 
      type: 'Studio', 
      beds: 1, baths: 1, sqft: 65,
      rating: 4.8, reviews: 89,
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
      hostImg: 'https://i.pravatar.cc/150?u=3'
    },

  ];

  return (
    <div className="guest-layout">
      {/* 1. Glassmorphic Navbar */}
      <nav className={`guest-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/guest-home" className="brand-logo">
            <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
          </Link>

          <div className="nav-links desktop-only">
            <Link to="/guest-search">Browse Homes</Link>
            <Link to="/how-it-works-choose">How it Works</Link>
            <Link to={getHelpFromGuest}>Help Center</Link>
          </div>

          <div className="nav-actions desktop-only">
            <button className="btn-text" onClick={() => navigate('/auth')}>Log in</button>
            <button className="btn-primary-pill shadow-hover" onClick={() => navigate('/auth')}>Sign up</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <Link to="/guest-search" onClick={() => setMobileMenuOpen(false)}>Browse Homes</Link>
            <Link to="/how-it-works-choose" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
            <Link to={getHelpFromGuest} onClick={() => setMobileMenuOpen(false)}>Help Center</Link>
            <button className="btn-text mobile-nav-login" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>
              Log in
            </button>
            <button className="btn-primary-pill mobile-nav-signup" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>
              Sign up
            </button>
          </div>
        )}
      </nav>

      {/* 2. Dynamic Hero Section */}
      <header className="hero-section">
        <div className="hero-mesh-bg"></div>
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Zap size={14} className="text-amber" /> 
            <span>The #1 rated rental platform in Egypt</span>
          </div>
        <h1 className="hero-title animate-slide-up">
            <span className="text-gradient-opposite">Find Your Perfect Home</span> <br/> 
            <span className="text-gradient">Without the Hassle.</span>
        </h1>
          <p className="hero-subtitle animate-slide-up-delayed">
            Browse verified listings, sign legally binding contracts digitally, and pay your rent securely online. Say goodbye to broker fees.
          </p>
          
          {/* Advanced Search Pill */}
          <div className="hero-search-wrapper animate-slide-up-delayed-more">
            <div className="hero-search-pill glass-panel">
              <div className="search-block">
                <label>Location</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="icon-muted"/>
                  <input type="text" placeholder="Cairo, Giza, North Coast..." />
                </div>
              </div>
              <div className="search-divider"></div>
              <div className="search-block">
                <label>Property Type</label>
                <select>
                  <option value="">Any type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                </select>
              </div>
              <div className="search-divider"></div>
              <div className="search-block">
                <label>Max Price</label>
                <select>
                  <option value="">Any price</option>
                  <option value="10k">Under 10,000 EGP</option>
                  <option value="25k">Under 25,000 EGP</option>
                  <option value="50k">Under 50,000 EGP</option>
                </select>
              </div>
              <button className="search-submit-btn" onClick={() => navigate('/browse')}>
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Floating UI Elements for visual depth */}
          <div className="floating-card float-left desktop-only">
            <ShieldCheck className="float-icon green" />
            <div className="float-text">
              <strong>100% Verified</strong>
              <span>Landlords & Tenants</span>
            </div>
          </div>
          <div className="floating-card float-right desktop-only">
            <div className="avatars-group">
              <img src="https://i.pravatar.cc/100?u=a" alt="user" />
              <img src="https://i.pravatar.cc/100?u=b" alt="user" />
              <img src="https://i.pravatar.cc/100?u=c" alt="user" />
            </div>
            <div className="float-text">
              <strong>10k+ matches</strong>
              <span>Made this month</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Ticker */}
      <div className="trust-ticker-section">
        <p className="ticker-label">TRUSTED BY MODERN RENTERS & PARTNERS ACROSS EGYPT</p>
        <div className="ticker-logos">
          <div className="logo-placeholder">CIB</div>
          <div className="logo-placeholder">Fawry</div>
          <div className="logo-placeholder">ValU</div>
          <div className="logo-placeholder">Vodafone Cash</div>
          <div className="logo-placeholder">E-Signature EG</div>
        </div>
      </div>

      {/* 3. Detailed Featured Properties */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2>Handpicked Homes</h2>
              <p className="section-desc">Properties with the highest ratings and verified landlords.</p>
            </div>
            <Link to="/guest-search" className="view-all-link">Explore all <ArrowRight size={16}/></Link>
          </div>
          
          <div className="property-grid">
            {mockProperties.map(prop => (
              <div key={prop.id} className="prop-card group" onClick={() => handlePropertyClick(prop)}>
                <div className="prop-img-wrapper">
                  <img src={prop.image} alt={prop.title} className="group-hover-scale" />
                  <div className="prop-overlay-gradient"></div>
                  {prop.badge && <div className="prop-badge"><Star size={12} className="fill-star"/> {prop.badge}</div>}
                  <button className="heart-btn" onClick={(e) => { e.stopPropagation(); handleProtectedAction(); }}>
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                </div>
                <div className="prop-details">
                  <div className="prop-meta-top">
                    <span className="prop-loc"><MapPin size={14}/> {prop.location}</span>
                    <span className="prop-rating"><Star size={14} className="fill-star"/> {prop.rating} ({prop.reviews})</span>
                  </div>
                  <h3 className="prop-title">{prop.title}</h3>
                  <div className="prop-specs">
                    <span><Bed size={16}/> {prop.beds} Beds</span>
                    <span><Bath size={16}/> {prop.baths} Baths</span>
                    <span><Maximize size={16}/> {prop.sqft} m²</span>
                  </div>
                  <div className="prop-footer-split">
                    <div className="prop-price-block">
                      <span className="price-val">{prop.price.toLocaleString()} {prop.currency}</span>
                      <span className="price-period">/ month</span>
                    </div>
                    <img src={prop.hostImg} alt="Host" className="host-mini-avatar" title="Verified Landlord" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Visual "How it Works" */}
      <section className="how-it-works-section relative-overflow">
        <div className="section-container relative-z">
          <div className="text-center mb-64">
            <h2 className="section-title">Rent a home in 4 simple steps</h2>
            <p className="section-desc">We've digitized the entire rental journey. No paperwork, no physical visits required.</p>
          </div>
          
          <div className="modern-steps-grid">
            <div className="m-step-card">
              <div className="m-step-icon-box"><Search size={24} /></div>
              <h4>1. Discover</h4>
              <p>Filter through verified listings and take 3D virtual tours.</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><PlayCircle size={24} /></div>
              <h4>2. Request</h4>
              <p>Send a direct rental request to the landlord with your profile.</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><FileSignature size={24} /></div>
              <h4>3. Sign</h4>
              <p>Review and sign a legally binding digital lease agreement.</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><CreditCard size={24} /></div>
              <h4>4. Pay & Move In</h4>
              <p>Pay securely via HOMI, receive confirmation, and move in with full digital records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dual Persona (Tenants & Landlords) with Visuals */}
      <section className="personas-section">
        <div className="section-container">
          <div className="personas-grid">
            <div className="persona-card tenant-card glass-panel-dark">
              <div className="p-card-content">
                <div className="p-badge">For Tenants</div>
                <h2>Find your happy place.</h2>
                <p>Say goodbye to shady brokers. Apply online, chat directly with verified landlords, and pay rent with your credit card.</p>
                <ul className="persona-benefits">
                  <li><CheckCircle size={18} className="text-green"/> Zero hidden broker commissions</li>
                  <li><CheckCircle size={18} className="text-green"/> Build your digital rental resume</li>
                  <li><CheckCircle size={18} className="text-green"/> Automated rent reminders & receipts</li>
                </ul>
                <button className="btn-primary-pill mt-auto" onClick={() => setShowAuthModal(true)}>Start Browsing</button>
              </div>
            </div>

            <div className="persona-card landlord-card">
              <div className="p-card-content">
                <div className="p-badge dark">For Landlords</div>
                <h2>Manage properties on autopilot.</h2>
                <p>Screen tenants, collect rent automatically, and manage maintenance requests from a single powerful dashboard.</p>
                <ul className="persona-benefits">
                  <li><CheckCircle size={18} className="text-blue"/> Identity & background screening</li>
                  <li><CheckCircle size={18} className="text-blue"/> Auto-generated legal contracts</li>
                  <li><CheckCircle size={18} className="text-blue"/> Guaranteed on-time payouts</li>
                </ul>
                <button className="btn-outline-dark mt-auto" onClick={() => setShowAuthModal(true)}>List Your Property</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Rich Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="text-center mb-64">
            <h2 className="section-title">Loved by the community</h2>
          </div>
          <div className="test-grid">
            <div className="test-card glass-panel">
              <div className="test-header">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="test-avatar" />
                <div>
                  <h4 className="test-name">Sarah Jenkins</h4>
                  <span className="test-role">Tenant in Maadi</span>
                </div>
                <div className="test-quote-icon">"</div>
              </div>
              <p>"I relocated to Cairo and found my apartment on HOMI before even landing. The digital contract feature gave me immense peace of mind."</p>
              <div className="stars mt-4"><Star/><Star/><Star/><Star/><Star/></div>
            </div>
            <div className="test-card glass-panel">
              <div className="test-header">
                <img src="https://i.pravatar.cc/150?u=ahmed" alt="Ahmed" className="test-avatar" />
                <div>
                  <h4 className="test-name">Ahmed Mostafa</h4>
                  <span className="test-role">Landlord (3 Properties)</span>
                </div>
                <div className="test-quote-icon">"</div>
              </div>
              <p>"HOMI handles my rent collection seamlessly. I don't have to chase tenants for payments anymore, it goes straight to my bank account."</p>
              <div className="stars mt-4"><Star/><Star/><Star/><Star/><Star/></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Premium CTA Banner */}
      <section className="cta-banner-wrapper">
        <div className="cta-banner premium-gradient-bg">
          <div className="cta-shapes-bg"></div>
          <div className="cta-text relative-z">
            <h2>Ready to experience the future of renting?</h2>
            <p>Join thousands of users on HOMI. Create your free account today.</p>
          </div>
          <div className="cta-actions relative-z">
            <button className="btn-white-massive shadow-hover" onClick={() => setShowAuthModal(true)}>Get Started Now</button>
            <span className="cta-subtext">No credit card required to sign up.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="guest-footer">
         <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
          <Link to="/guest-home" className="brand-logo">
        <img src="/logo.png" alt="HOMi Logo" className="logo-image" />

          </Link>
              <p>The premium, end-to-end platform modernizing the real estate rental market.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <Link to="/guest-search">Browse Homes</Link>
              <a href="#" className="footer-link-override" onClick={(e) => { e.preventDefault(); setShowAuthModal(true); }}>List a Property</a>
              <Link to="/pricing">Pricing</Link>
            </div>
            <div className="footer-links">
              <h4>Resources</h4>
              <Link to="/about">About Us</Link>
              <Link to={getHelpFromGuest}>Help Center</Link>
              <Link to="/blog">Real Estate Blog</Link>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/trust">Trust & Safety</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} HOMI Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal Component Mount */}
      {isModalOpen && selectedProperty && (
        <PropertyDetailedModal 
          property={selectedProperty} 
          onClose={() => setIsModalOpen(false)} 
          isGuest={true} 
        />
      )}

      {/* Reusable Auth Modal for Guests */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default GuestHome;