import React, { useState } from 'react';
import { FaSearch, FaBell, FaComments, FaGlobe, FaChevronDown, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt } from 'react-icons/fa';
import './header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="dashboard-header">
      {/* LEFT: Search only */}
      <div className="header-left">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
          <span className="search-hint">⌘K</span>
        </div>
      </div>

      {/* RIGHT: Everything else grouped tightly */}
      <div className="header-right">
        <div className="action-icons-group">
          <button className="icon-btn">
            <FaCalendarAlt />
          </button>
          <button className="icon-btn">
            <FaComments />
            <span className="status-dot"></span>
          </button>
          <button className="icon-btn">
            <FaBell />
            <span className="status-dot red"></span>
          </button>
        </div>

        <div className="vertical-divider"></div>

        <button className="lang-selector">
          <FaGlobe />
          <span>EN</span>
        </button>

        <div className="user-profile-block" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="avatar-container">
            <img src="https://i.pravatar.cc/150?u=alex" alt="profile" />
            <div className="online-ring"></div>
          </div>
          <div className="user-details">
            <span className="user-name">Alex Rivera</span>
            <span className="user-role">Premium Member</span>
          </div>
          <FaChevronDown className={`chevron ${isDropdownOpen ? 'rotated' : ''}`} />

          {isDropdownOpen && (
            <div className="header-dropdown">
              <div className="dropdown-item"><FaUser /> Profile</div>
              <div className="dropdown-item"><FaCog /> Settings</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout"><FaSignOutAlt /> Logout</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;