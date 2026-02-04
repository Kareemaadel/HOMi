import React from 'react';
import {
  FaHome, FaBuilding, FaSearch, FaUserFriends, 
  FaTools, FaCreditCard, FaEnvelope, FaStar, 
  FaQuestionCircle, FaSignOutAlt,
  FaCog
} from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* 1. Brand Section */}
      <div className="sidebar-brand">
        <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
      </div>

      {/* 2. Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li><a href="/" className="active"><FaHome /> <span>Home</span></a></li>
          <li><a href="/active-properties"><FaBuilding /> <span>Active Properties</span></a></li>
          <li><a href="/browse-properties"><FaSearch /> <span>Browse Properties</span></a></li>
          <li><a href="/roommate-matching"><FaUserFriends /> <span>Matching</span></a></li>
          
          <div className="nav-divider">Management</div>
          
          <li><a href="/maintenance-requests"><FaTools /> <span>Maintenance</span></a></li>
          <li><a href="/payments"><FaCreditCard /> <span>Payments</span></a></li>
          <li><a href="/messages"><FaEnvelope /> <span className="badge-wrap">Messages <em className="notif-dot"></em></span></a></li>
          <li><a href="/rewards"><FaStar /> <span>Rewards</span></a></li>
          <li><a href="/settings"><FaCog /> <span>Settings</span></a></li>
        </ul>
      </nav>

      {/* 3. User Section */}
      <div className="sidebar-footer">
        <div className="user-info">
          <img src="https://i.pravatar.cc/150?u=tenant" alt="Profile" />
          <div className="user-text">
            <p className="user-name">Alex Rivera</p>
            <p className="user-role">Premium Tenant</p>
          </div>
        </div>
        <button className="logout-btn"><FaSignOutAlt /></button>
      </div>
    </aside>
  );
};

export default Sidebar;