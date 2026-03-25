import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import './header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getSignedInRole = (): string | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const parsed = JSON.parse(userStr) as { role?: string } | null;
      return parsed?.role ?? null;
    } catch {
      return null;
    }
  };

  const signedInRole = getSignedInRole();
  const isSignedIn = Boolean(localStorage.getItem('accessToken')) && signedInRole !== null;
  const howItWorksPath = signedInRole === 'TENANT' ? '/for-tenants' : '/for-landlords';

  // Add a nice shadow effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // If a signed-in user lands on the "other role" How It Works page,
  // immediately route them to the correct one.
  useEffect(() => {
    if (!signedInRole) return;

    const isOnLandlordsPage = location.pathname === '/for-landlords';
    const isOnTenantsPage = location.pathname === '/for-tenants';

    if (signedInRole === 'TENANT' && isOnLandlordsPage) {
      navigate('/for-tenants', { replace: true, state: { fromAppNavbar: true } });
    } else if (signedInRole === 'LANDLORD' && isOnTenantsPage) {
      navigate('/for-landlords', { replace: true, state: { fromAppNavbar: true } });
    }
  }, [navigate, location.pathname, signedInRole]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.header-nav') && !target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo/Brand */}
        <div className="header-brand">

        </div>

        {/* Search Bar - Desktop */}
        <div className="header-search desktop-search">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search properties, tenants..." 
              className="search-input"
              aria-label="Search"
            />
            <kbd className="search-hint">⌘K</kbd>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav" aria-label="Main navigation">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link
            to={howItWorksPath}
            className={`nav-link ${location.pathname === howItWorksPath ? 'active' : ''}`}
            onClick={(e) => {
              if (!isSignedIn) return;
              e.preventDefault();
              navigate(howItWorksPath, { state: { fromAppNavbar: true } });
            }}
          >
            How It Works
          </Link>
          <Link to="/saved-properties" className={`nav-link ${location.pathname === '/saved-properties' ? 'active' : ''}`}>
            Saved Properties
          </Link>
          <Link to="/get-help" className={`nav-link ${location.pathname === '/get-help' ? 'active' : ''}`}>
            Get Help
          </Link>
          <Link to="/about-us" className={`nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}>
            About Us
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="header-nav mobile-nav" aria-label="Mobile navigation">
          {/* Mobile Search */}
          <div className="header-search mobile-search">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search properties, tenants..." 
                className="search-input"
                aria-label="Search"
              />
            </div>
          </div>


        </nav>
      )}
    </header>
  );
};

export default Header;