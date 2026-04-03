import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import ConfirmModal from './ConfirmModal';
import './header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
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
  const dashboardPath = signedInRole === 'LANDLORD' ? '/landlord-home' : '/tenant-home';

  const tenantMobileLinks = [
    { to: '/tenant-home', label: 'Dashboard' },
    { to: '/actives', label: 'Active Properties' },
    { to: '/browse-properties', label: 'Browse Properties' },
    { to: '/roommate-matching', label: 'Matching' },
    { to: '/maintenance-requests', label: 'Maintenance' },
    { to: '/tenant-payment', label: 'Payments' },
    { to: '/messages', label: 'Messages' },
    { to: '/rewards', label: 'Rewards' },
  ];

  const landlordMobileLinks = [
    { to: '/landlord-home', label: 'Dashboard' },
    { to: '/my-properties', label: 'My Properties' },
    { to: '/rental-requests', label: 'Rental Requests' },
    { to: '/maintenance-requests', label: 'Maintenance' },
    { to: '/landlord-payment', label: 'Payments' },
    { to: '/messages', label: 'Messages' },
    { to: '/balance', label: 'Balance' },
  ];

  const mobileRoleLinks = signedInRole === 'LANDLORD' ? landlordMobileLinks : tenantMobileLinks;

  const handleMobileLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmMobileLogout = async () => {
    setShowLogoutConfirm(false);
    setIsMobileMenuOpen(false);
    await authService.logout();
    navigate('/guest-home', { replace: true });
  };

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
      const target = e.target as Node | null;
      const clickedInsideMenu = !!(target && mobileMenuRef.current?.contains(target));
      const clickedToggle = !!(target && mobileToggleRef.current?.contains(target));
      if (isMobileMenuOpen && !clickedInsideMenu && !clickedToggle) {
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
          <Link to="/homi-plus" className={`nav-link ${location.pathname === '/homi-plus' ? 'active' : ''}`}>
            HOMI <span style={{ background: 'linear-gradient(90deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PRO</span>
          </Link>
          <Link to="/get-help" className={`nav-link ${location.pathname === '/get-help' ? 'active' : ''}`}>
            Get Help
          </Link>
          <Link to="/about-us" className={`nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}>
            About Us
          </Link>
          {isSignedIn && (
            <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
              Settings
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          type="button"
          ref={mobileToggleRef}
          className="mobile-menu-toggle"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav ref={mobileMenuRef} className="header-nav mobile-nav" aria-label="Mobile navigation" onPointerDown={(e) => e.stopPropagation()}>
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

          <Link to={isSignedIn ? dashboardPath : '/'} className={`nav-link ${location.pathname === dashboardPath || (!isSignedIn && location.pathname === '/') ? 'active' : ''}`}>
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
          <Link to="/homi-plus" className={`nav-link ${location.pathname === '/homi-plus' ? 'active' : ''}`}>
            HOMI <span style={{ background: 'linear-gradient(90deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plus</span>
          </Link>
          <Link to="/get-help" className={`nav-link ${location.pathname === '/get-help' ? 'active' : ''}`}>
            Get Help
          </Link>
          <Link to="/about-us" className={`nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}>
            About Us
          </Link>
          {isSignedIn && (
            <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
              Settings
            </Link>
          )}

          {isSignedIn && (
            <>
              <div className="mobile-nav-divider">Dashboard</div>
              {mobileRoleLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}

              <button type="button" className="mobile-logout-btn" onClick={handleMobileLogout}>
                <FaSignOutAlt />
                Sign Out
              </button>
            </>
          )}
        </nav>
      )}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmMobileLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Header;