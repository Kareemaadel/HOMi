import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Reuse the existing GuestHome navbar styles/behavior.
import '../../features/Guest/pages/GuestHome.css';

const GuestNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const howItWorksLink = '/how-it-works-choose';

  const getHelpFromGuest = {
    pathname: '/get-help',
    state: { fromGuestHome: true },
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className={`guest-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/guest-home" className="brand-logo">
          <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
        </Link>

        <div className="nav-links desktop-only">
          <Link to="/guest-search">Browse Homes</Link>
          <Link to={howItWorksLink}>How it Works</Link>
          <Link to={getHelpFromGuest}>Help Center</Link>
        </div>

        <div className="nav-actions desktop-only">
          <button className="btn-text" onClick={() => navigate('/auth')}>
            Log in
          </button>
          <button className="btn-primary-pill shadow-hover" onClick={() => navigate('/auth')}>
            Sign up
          </button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="mobile-nav-panel">
          <Link to="/guest-search" onClick={() => setMobileMenuOpen(false)}>
            Browse Homes
          </Link>
          <Link to={howItWorksLink} onClick={() => setMobileMenuOpen(false)}>
            How it Works
          </Link>
          <Link to={getHelpFromGuest} onClick={() => setMobileMenuOpen(false)}>
            Help Center
          </Link>
          <button
            type="button"
            className="btn-text mobile-nav-login"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/auth');
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className="btn-primary-pill mobile-nav-signup"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/auth');
            }}
          >
            Sign up
          </button>
        </div>
      ) : null}
    </nav>
  );
};

export default GuestNavbar;

