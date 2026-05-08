import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, Globe, Menu, X, Zap, MapPin, Bed, Bath, Maximize, Star,
  ShieldCheck, CheckCircle, PlayCircle, FileSignature, CreditCard, ArrowRight
} from 'lucide-react';
import './GuestHome.css';
import PropertyDetailedModal from '../../BrowseProperties/components/PropertyDetailedModal';
import { propertyService } from '../../../services/property.service';
import type { PropertyUI as GuestHomeListing } from '../../../utils/propertyMapping';
import { mapPropertyToUI } from '../../../utils/propertyMapping';
import AuthModal from '../../../components/global/AuthModal';
import Footer from '../../../components/global/footer';

const GuestHome: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const getHelpFromGuest = {
    pathname: '/get-help',
    state: { fromGuestHome: true },
  };

  // State for live properties
  const [properties, setProperties] = useState<GuestHomeListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<GuestHomeListing | null>(null);
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
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAllProperties({
          status: 'AVAILABLE',
          page: 1,
          limit: 3
        });
        setProperties(response.data.map(mapPropertyToUI));
      } catch (err) {
        console.error('Failed to fetch properties for GuestHome:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="guest-layout">
      {/* 1. Glassmorphic Navbar */}
      <nav className={`guest-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/guest-home" className="brand-logo">
            <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
          </Link>

          <div className="nav-links desktop-only">
            <Link to="/guest-search">{t('guestHome.browseHomes')}</Link>
            <Link to="/how-it-works-choose">{t('guestHome.howItWorks')}</Link>
            <Link to={getHelpFromGuest}>{t('guestHome.helpCenter')}</Link>
          </div>

          <div className="nav-actions desktop-only">
            <button className="lang-toggle-btn" onClick={toggleLanguage} title={i18n.language === 'en' ? 'Arabic' : 'English'}>
              <Globe size={18} />
              <span>{i18n.language === 'en' ? 'ع' : 'En'}</span>
            </button>
            <button className="btn-text" onClick={() => navigate('/auth')}>{t('guestHome.login')}</button>
            <button className="btn-primary-pill shadow-hover" onClick={() => navigate('/auth')}>{t('guestHome.signup')}</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <Link to="/guest-search" onClick={() => setMobileMenuOpen(false)}>{t('guestHome.browseHomes')}</Link>
            <Link to="/how-it-works-choose" onClick={() => setMobileMenuOpen(false)}>{t('guestHome.howItWorks')}</Link>
            <Link to={getHelpFromGuest} onClick={() => setMobileMenuOpen(false)}>{t('guestHome.helpCenter')}</Link>
            <div className="mobile-lang-row">
              <button className="lang-toggle-btn" onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}>
                <Globe size={18} />
                <span>{i18n.language === 'en' ? 'Arabic' : 'English'}</span>
              </button>
            </div>
            <button className="btn-text mobile-nav-login" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>
              {t('guestHome.login')}
            </button>
            <button className="btn-primary-pill mobile-nav-signup" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>
              {t('guestHome.signup')}
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
            <span>{t('guestHome.ratedPlatformEgypt')}</span>
          </div>
          <h1 className="hero-title animate-slide-up">
            <span className="text-gradient-opposite">{t('guestHome.findPerfectHome')}</span> <br />
            <span className="text-gradient">{t('guestHome.withoutHassle')}</span>
          </h1>
          <p className="hero-subtitle animate-slide-up-delayed">
            {t('guestHome.heroSubtitle')}
          </p>

          {/* Advanced Search Pill */}
          <div className="hero-search-wrapper animate-slide-up-delayed-more">
            <div className="hero-search-pill glass-panel">
              <div className="search-block">
                <label>{t('guestHome.location')}</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="icon-muted" />
                  <input type="text" placeholder={t('guestHome.locationPlaceholder')} />
                </div>
              </div>
              <div className="search-divider"></div>
              <div className="search-block">
                <label>{t('guestHome.propertyType')}</label>
                <select>
                  <option value="">{t('guestHome.anyType')}</option>
                  <option value="apartment">{t('guestHome.apartment')}</option>
                  <option value="villa">{t('guestHome.villa')}</option>
                  <option value="studio">{t('guestHome.studio')}</option>
                </select>
              </div>
              <div className="search-divider"></div>
              <div className="search-block">
                <label>{t('guestHome.maxPrice')}</label>
                <select>
                  <option value="">{t('guestHome.anyPrice')}</option>
                  <option value="10k">{t('guestHome.under10k')}</option>
                  <option value="25k">{t('guestHome.under25k')}</option>
                  <option value="50k">{t('guestHome.under50k')}</option>
                </select>
              </div>
              <button className="search-submit-btn" onClick={() => navigate('/browse')}>
                <Search size={20} />
                <span>{t('guestHome.search')}</span>
              </button>
            </div>
          </div>

          {/* Floating UI Elements for visual depth */}
          <div className="hero-trust-cards mobile-only animate-slide-up-delayed-more">
            <div className="floating-card">
              <ShieldCheck className="float-icon green" />
              <div className="float-text">
                <strong>{t('guestHome.verified')}</strong>
                <span>{t('guestHome.landlordsTenants')}</span>
              </div>
            </div>
            <div className="floating-card">
              <div className="avatars-group">
                <img src="https://i.pravatar.cc/100?u=a" alt="user" />
                <img src="https://i.pravatar.cc/100?u=b" alt="user" />
                <img src="https://i.pravatar.cc/100?u=c" alt="user" />
              </div>
              <div className="float-text">
                <strong>{t('guestHome.matchesMade')}</strong>
                <span>{t('guestHome.madeThisMonth')}</span>
              </div>
            </div>
          </div>

          <div className="floating-card float-left desktop-only">
            <ShieldCheck className="float-icon green" />
            <div className="float-text">
              <strong>{t('guestHome.verified')}</strong>
              <span>{t('guestHome.landlordsTenants')}</span>
            </div>
          </div>
          <div className="floating-card float-right desktop-only">
            <div className="avatars-group">
              <img src="https://i.pravatar.cc/100?u=a" alt="user" />
              <img src="https://i.pravatar.cc/100?u=b" alt="user" />
              <img src="https://i.pravatar.cc/100?u=c" alt="user" />
            </div>
            <div className="float-text">
              <strong>{t('guestHome.matchesMade')}</strong>
              <span>{t('guestHome.madeThisMonth')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Ticker */}
      <div className="trust-ticker-section">
        <p className="ticker-label">{t('guestHome.trustedBy')}</p>
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
              <h2>{t('guestHome.handpickedHomes')}</h2>
              <p className="section-desc">{t('guestHome.highestRatings')}</p>
            </div>
            <Link to="/guest-search" className="view-all-link">{t('guestHome.exploreAll')} <ArrowRight size={16} /></Link>
          </div>

          <div className="property-grid">
            {loading ? (
              <p>Loading properties...</p>
            ) : properties.length > 0 ? (
              properties.map(prop => (
                <div key={prop.id} className="prop-card group" onClick={() => handlePropertyClick(prop)}>
                  <div className="prop-img-wrapper">
                    <img src={prop.image} alt={prop.title} className="group-hover-scale" />
                    <div className="prop-overlay-gradient"></div>
                    {prop.tags && prop.tags[0] && <div className="prop-badge"><Star size={12} className="fill-star" /> {prop.tags[0]}</div>}
                    <button className="heart-btn" onClick={(e) => { e.stopPropagation(); handleProtectedAction(); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                  </div>
                  <div className="prop-details">
                    <div className="prop-meta-top">
                      <span className="prop-loc"><MapPin size={14} /> {prop.address}</span>
                      <span className="prop-rating"><Star size={14} className="fill-star" /> {prop.rating} (12)</span>
                    </div>
                    <h3 className="prop-title">{prop.title}</h3>
                    <div className="prop-specs">
                      <span><Bed size={16} /> {prop.beds} {t('guestHome.beds')}</span>
                      <span><Bath size={16} /> {prop.baths} {t('guestHome.baths')}</span>
                      <span><Maximize size={16} /> {prop.sqft} {t('guestHome.sqm')}</span>
                    </div>
                    <div className="prop-footer-split">
                      <div className="prop-price-block">
                        <span className="price-val">{prop.price.toLocaleString()} EGP</span>
                        <span className="price-period">/ {t('guestHome.perMonth')}</span>
                      </div>
                      <img src={prop.ownerImage} alt="Host" className="host-mini-avatar" title="Verified Landlord" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No properties found.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. Visual "How it Works" */}
      <section className="how-it-works-section relative-overflow">
        <div className="section-container relative-z">
          <div className="text-center mb-64">
            <h2 className="section-title">{t('guestHome.rentInSteps')}</h2>
            <p className="section-desc">{t('guestHome.digitizedJourney')}</p>
          </div>

          <div className="modern-steps-grid">
            <div className="m-step-card">
              <div className="m-step-icon-box"><Search size={24} /></div>
              <h4>{t('guestHome.discover')}</h4>
              <p>{t('guestHome.filterVerified')}</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><PlayCircle size={24} /></div>
              <h4>{t('guestHome.request')}</h4>
              <p>{t('guestHome.sendDirectRequest')}</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><FileSignature size={24} /></div>
              <h4>{t('guestHome.sign')}</h4>
              <p>{t('guestHome.reviewSignDigital')}</p>
            </div>
            <div className="m-step-card">
              <div className="m-step-icon-box"><CreditCard size={24} /></div>
              <h4>{t('guestHome.payMoveIn')}</h4>
              <p>{t('guestHome.paySecurelyMoveIn')}</p>
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
                <div className="p-badge">{t('guestHome.forTenants')}</div>
                <h2>{t('guestHome.findHappyPlace')}</h2>
                <p>{t('guestHome.tenantDescription')}</p>
                <ul className="persona-benefits">
                  <li><CheckCircle size={18} className="text-green" /> {t('guestHome.tenantBenefit1')}</li>
                  <li><CheckCircle size={18} className="text-green" /> {t('guestHome.tenantBenefit2')}</li>
                  <li><CheckCircle size={18} className="text-green" /> {t('guestHome.tenantBenefit3')}</li>
                </ul>
                <button className="btn-primary-pill mt-auto" onClick={() => setShowAuthModal(true)}>{t('guestHome.startBrowsing')}</button>
              </div>
            </div>

            <div className="persona-card landlord-card">
              <div className="p-card-content">
                <div className="p-badge dark">{t('guestHome.forLandlords')}</div>
                <h2>{t('guestHome.manageAutopilot')}</h2>
                <p>{t('guestHome.landlordDescription')}</p>
                <ul className="persona-benefits">
                  <li><CheckCircle size={18} className="text-blue" /> {t('guestHome.landlordBenefit1')}</li>
                  <li><CheckCircle size={18} className="text-blue" /> {t('guestHome.landlordBenefit2')}</li>
                  <li><CheckCircle size={18} className="text-blue" /> {t('guestHome.landlordBenefit3')}</li>
                </ul>
                <button className="btn-outline-dark mt-auto" onClick={() => setShowAuthModal(true)}>{t('guestHome.listProperty')}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Rich Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="text-center mb-64">
            <h2 className="section-title">{t('guestHome.lovedByCommunity')}</h2>
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
              <div className="stars mt-4"><Star /><Star /><Star /><Star /><Star /></div>
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
              <div className="stars mt-4"><Star /><Star /><Star /><Star /><Star /></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Premium CTA Banner */}
      <section className="cta-banner-wrapper">
        <div className="cta-banner premium-gradient-bg">
          <div className="cta-shapes-bg"></div>
          <div className="cta-text relative-z">
            <h2>{t('guestHome.futureOfRenting')}</h2>
            <p>{t('guestHome.joinThousands')}</p>
          </div>
          <div className="cta-actions relative-z">
            <button className="btn-white-massive shadow-hover" onClick={() => setShowAuthModal(true)}>{t('guestHome.getStartedNow')}</button>
            <span className="cta-subtext">{t('guestHome.noCreditCardRequired')}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation for Mobile */}
      {/* <div className="bottom-nav mobile-only">
        <button className="nav-item active">
          <Search size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item">
          <Globe size={24} />
          <span>Browse</span>
        </button>
        <button className="nav-item">
          <Star size={24} />
          <span>Saved</span>
        </button>
        <button className="nav-item">
          <Zap size={24} />
          <span>Messages</span>
        </button>
        <button className="nav-item">
          <ShieldCheck size={24} />
          <span>Profile</span>
        </button>
      </div> */}

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