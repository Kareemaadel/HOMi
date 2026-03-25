import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Reuse the existing GuestHome navbar styles/behavior.
import '../../features/Guest/pages/GuestHome.css';

const GuestNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signedInRole = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const parsed = JSON.parse(userStr) as { role?: string } | null;
      return parsed?.role ?? null;
    } catch {
      return null;
    }
  }, []);

  const howItWorksPath = signedInRole === 'TENANT' ? '/for-tenants' : '/for-landlords';
  // Keep the "no sidebar" variant when users are on the guest How It Works experience.
  const howItWorksLink = {
    pathname: howItWorksPath,
    state: { fromGuestHome: true },
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
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
          <Link to="/help">Help Center</Link>
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
    </nav>
  );
};

export default GuestNavbar;

