import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import ConfirmModal from './ConfirmModal';
import NotificationsBar from '../../features/home/components/TenantHomeComponents/NotificationsBar';
import notificationService from '../../services/notification.service';
import socketService from '../../services/socket.service';
import TestingClockBadge from './TestingClockBadge';
import './header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifBarOpen, setNotifBarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeDisabled, setRealtimeDisabled] = useState(false);
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
  const isMaintainer = signedInRole === 'MAINTENANCE_PROVIDER';
  const howItWorksPath = signedInRole === 'TENANT' ? '/for-tenants' : '/for-landlords';
  const howItWorksBrowsePath = isSignedIn ? howItWorksPath : '/how-it-works-choose';
  const howItWorksNavActive =
    location.pathname === '/how-it-works-choose' ||
    location.pathname === '/for-tenants' ||
    location.pathname === '/for-landlords';
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

  // Shadow effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track unread notifications count for signed-in users
  const refreshUnreadCount = useCallback(async () => {
    if (!isSignedIn || realtimeDisabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const c = await notificationService.unreadCount();
      setUnreadCount(c);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setRealtimeDisabled(true);
        setUnreadCount(0);
        socketService.disconnect();
      }
    }
  }, [isSignedIn, realtimeDisabled]);

  useEffect(() => { void refreshUnreadCount(); }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isSignedIn || realtimeDisabled) return;
    const socket = socketService.connect();
    if (!socket) return;
    const onNew = () => setUnreadCount((c) => c + 1);
    socketService.onNotificationNew(onNew);
    const id = window.setInterval(refreshUnreadCount, 60_000);
    return () => {
      socketService.offNotificationNew(onNew);
      window.clearInterval(id);
    };
  }, [isSignedIn, realtimeDisabled, refreshUnreadCount]);

  useEffect(() => {
    if (!notifBarOpen) void refreshUnreadCount();
  }, [notifBarOpen, refreshUnreadCount]);

  // Close mobile menu when route changes
  useEffect(() => {
    const timer = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  // Immediately route correctly for "How It Works"
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
        
        {/* Empty left spacer to keep things perfectly centered using Flexbox */}
        <div className="header-spacer left-spacer"></div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav" aria-label="Main navigation">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          {!isMaintainer && (
            <Link
              to={howItWorksBrowsePath}
              className={`nav-link ${howItWorksNavActive ? 'active' : ''}`}
              onClick={(e) => {
                if (!isSignedIn) return;
                e.preventDefault();
                navigate(howItWorksPath, { state: { fromAppNavbar: true } });
              }}
            >
              How It Works
            </Link>
          )}
          {!isMaintainer && (
            <Link to="/homi-plus" className={`nav-link ${location.pathname === '/homi-plus' ? 'active' : ''}`}>
              HOMI <span style={{ background: 'linear-gradient(90deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>PRO</span>
            </Link>
          )}
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

        {/* Mobile Menu Toggle & Right Spacer */}
        <div className="header-spacer right-spacer">
          {isSignedIn && signedInRole === 'TENANT' && <TestingClockBadge />}
          {isSignedIn && (
            <button
              type="button"
              className="header-notif-btn"
              onClick={() => setNotifBarOpen(true)}
              aria-label="Open notifications"
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="header-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
          )}
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
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav ref={mobileMenuRef} className="mobile-nav" aria-label="Mobile navigation" onPointerDown={(e) => e.stopPropagation()}>
          <Link to={isSignedIn ? dashboardPath : '/'} className={`mobile-nav-link ${location.pathname === dashboardPath || (!isSignedIn && location.pathname === '/') ? 'active' : ''}`}>
            Home
          </Link>
          {!isMaintainer && (
            <Link
              to={howItWorksBrowsePath}
              className={`mobile-nav-link ${howItWorksNavActive ? 'active' : ''}`}
              onClick={(e) => {
                if (!isSignedIn) return;
                e.preventDefault();
                navigate(howItWorksPath, { state: { fromAppNavbar: true } });
              }}
            >
              How It Works
            </Link>
          )}
          {!isMaintainer && (
            <Link to="/homi-plus" className={`mobile-nav-link ${location.pathname === '/homi-plus' ? 'active' : ''}`}>
              HOMI <span style={{ background: 'linear-gradient(90deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>PRO</span>
            </Link>
          )}
          <Link to="/get-help" className={`mobile-nav-link ${location.pathname === '/get-help' ? 'active' : ''}`}>
            Get Help
          </Link>
          <Link to="/about-us" className={`mobile-nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}>
            About Us
          </Link>
          {isSignedIn && (
            <Link to="/settings" className={`mobile-nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
              Settings
            </Link>
          )}

          {isSignedIn && (
            <>
              <div className="mobile-nav-divider">Dashboard Menu</div>
              {mobileRoleLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`mobile-nav-link ${location.pathname === item.to ? 'active' : ''}`}
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

      {isSignedIn && (
        <NotificationsBar isOpen={notifBarOpen} onClose={() => setNotifBarOpen(false)} />
      )}
    </header>
  );
};

export default Header;