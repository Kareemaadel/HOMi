import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBuilding, FaSearch, FaUserFriends,
  FaTools, FaCreditCard, FaEnvelope, FaStar,
  FaSignOutAlt,
  FaCog, FaSignature
} from 'react-icons/fa';
import './sidebar.css';
import { authService } from '../../../services/auth.service';
import ConfirmModal from '../ConfirmModal';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Guest');
  const [userRole, setUserRole] = useState('Not signed in');
  const [avatarSrc, setAvatarSrc] = useState(
    'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=80'
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const load = () => {
      const cached = authService.getCurrentUser();
      if (cached) {
        const { profile, user } = cached;
        setUserName(`${profile.firstName} ${profile.lastName}`.trim() || user.email);
        setUserRole(user.role === 'LANDLORD' ? 'Landlord' : 'Tenant');
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          `${profile.firstName} ${profile.lastName}`.trim() || 'User'
        )}&background=6366f1&color=fff&size=80`;
        setAvatarSrc(profile.avatarUrl || fallback);
      }
    };

    load();
    // Re-read on storage changes (e.g. after profile save in Settings)
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await authService.logout();
    navigate('/guest-home', { replace: true });
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=6366f1&color=fff&size=80`;

  return (
    <aside className="sidebar">
      {/* 1. Brand Section */}
      <div className="sidebar-brand">
        <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
      </div>

      {/* 2. Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li><a href="/tenant-home" className={location.pathname === "/tenant-home" ? "active" : ""}><FaHome /> <span>Home</span></a></li>
          <li><a href="/actives" className={location.pathname === "/actives" ? "active" : ""}><FaBuilding /> <span>Active Properties</span></a></li>
          <li><a href="/browse-properties" className={location.pathname === "/browse-properties" ? "active" : ""}><FaSearch /> <span>Browse Properties</span></a></li>
          <li><a href="/roommate-matching" className={location.pathname === "/roommate-matching" ? "active" : ""}><FaUserFriends /> <span>Matching</span></a></li>

          <div className="nav-divider">Management</div>

          <li><a href="/maintenance-requests" className={location.pathname === "/maintenance-requests" ? "active" : ""}><FaTools /> <span>Maintenance</span></a></li>
          <li><a href="/tenant-payment" className={location.pathname === "/tenant-payment" ? "active" : ""}><FaCreditCard /> <span>Payments</span></a></li>
          <li><a href="/tenant-contracts" className={location.pathname === "/tenant-contracts" ? "active" : ""}><FaSignature/> <span>Contracts</span></a></li>
          <li><a href="/messages" className={location.pathname === "/messages" ? "active" : ""}><FaEnvelope /> <span className="badge-wrap">Messages <em className="notif-dot"></em></span></a></li>
          <li><a href="/rewards" className={location.pathname === "/rewards" ? "active" : ""}><FaStar /> <span>Rewards</span></a></li>
          <li><a href="/settings" className={location.pathname === "/settings" ? "active" : ""}><FaCog /> <span>Settings</span></a></li>
        </ul>
      </nav>

      {/* 3. User Section */}
      <div className="sidebar-footer">
        <div className="user-info">
          <img
            src={avatarSrc}
            alt="Profile"
            referrerPolicy="no-referrer"
            onError={() => setAvatarSrc(fallbackAvatar)}
          />
          <div className="user-text">
            <p className="user-name">{userName || 'Loading…'}</p>
            <p className="user-role">{userRole}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          <FaSignOutAlt />
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
};

export default Sidebar;