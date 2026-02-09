import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaHome, FaBuilding, FaSearch, FaUserFriends, 
  FaTools, FaCreditCard, FaEnvelope, FaStar, 
  FaQuestionCircle, FaSignOutAlt,
  FaCog,
  FaBalanceScale,
  FaInbox,
  FaPaperPlane,
  FaWallet
} from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="sidebar">
      {/* 1. Brand Section */}
      <div className="sidebar-brand">
        <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
      </div>

      {/* 2. Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li><a href="/" className={location.pathname === "/" ? "active" : ""}><FaHome /> <span>Home</span></a></li>
          <li><a href="/my-properties" className={location.pathname === "/my-properties" ? "active" : ""}><FaBuilding /> <span>My Properties</span></a></li>
          <li><a href="/rental-requests" className={location.pathname === "/rental-requests" ? "active" : ""}><FaInbox /> <span>Rental Requests</span></a></li>
          
          <div className="nav-divider">Management</div>
          
          <li><a href="/maintenance-requests" className={location.pathname === "/maintenance-requests" ? "active" : ""}><FaTools /> <span>Maintenance</span></a></li>
          <li><a href="/payments" className={location.pathname === "/payments" ? "active" : ""}><FaCreditCard /> <span>Payments</span></a></li>
          <li><a href="/messages" className={location.pathname === "/messages" ? "active" : ""}><FaEnvelope /> <span className="badge-wrap">Messages <em className="notif-dot"></em></span></a></li>
          
          <li><a href="/messages" className={location.pathname === "/balance" ? "active" : ""}><FaWallet /> <span className="badge-wrap">Balance <em className="notif-dot"></em></span></a></li>
          <li><a href="/settings" className={location.pathname === "/settings" ? "active" : ""}><FaCog /> <span>Settings</span></a></li>
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