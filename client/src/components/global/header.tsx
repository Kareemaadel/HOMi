import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaComments, FaGlobe, FaChevronDown, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import './header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add a nice shadow effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`dashboard-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        {/* LEFT: Search */}
        <div className="header-left">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search properties, tenants..." />
            <kbd className="search-hint">⌘K</kbd>
          </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="header-right">
          <div className="action-icons-group">
            <button className="icon-btn" title="Calendar">
              <FaCalendarAlt />
            </button>
            <button className="icon-btn" title="Messages">
              <FaComments />
              <span className="status-dot green"></span>
            </button>
            <button className="icon-btn" title="Notifications">
              <FaBell />
              <span className="status-dot red"></span>
            </button>
          </div>

          <div className="vertical-divider"></div>

          <button className="lang-selector">
            <FaGlobe className="globe-icon" />
            <span>EN</span>
          </button>

          <div className="user-profile-wrapper">
            <div className="user-profile-block" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="avatar-container">
                <img src="https://i.pravatar.cc/150?u=alex" alt="profile" />
                <div className="online-indicator"></div>
              </div>
              <div className="user-details">
                <span className="user-name">Alex Rivera</span>
                <span className="user-role">Landlord Pro</span>
              </div>
              <FaChevronDown className={`chevron ${isDropdownOpen ? 'rotated' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="header-dropdown">
                <div className="dropdown-header">
                  <p>Account ID: #8829</p>
                  <span className="pro-badge"><FaShieldAlt /> Verified</span>
                </div>
                <div className="dropdown-menu">
                  <div className="dropdown-item"><FaUser /> Profile Details</div>
                  <div className="dropdown-item"><FaCog /> Account Settings</div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout"><FaSignOutAlt /> Sign Out</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;