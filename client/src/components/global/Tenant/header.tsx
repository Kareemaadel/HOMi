import React, { useState, useRef, useEffect } from 'react';
import { 
  FaSearch, 
  FaBell, 
  FaComments, 
  FaGlobe, 
  FaChevronDown, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaCalendarAlt,
  FaHome,
  FaFileAlt,
  FaCreditCard,
  FaWrench,
  FaQuestionCircle,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import './header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount] = useState(3);
  const [messageCount] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Payment Reminder', message: 'Your rent payment is due in 3 days', time: '2h ago', unread: true },
    { id: 2, title: 'Maintenance Update', message: 'Your maintenance request has been approved', time: '5h ago', unread: true },
    { id: 3, title: 'New Document', message: 'New lease agreement available', time: '1d ago', unread: false },
  ];

  const messages = [
    { id: 1, name: 'Property Manager', message: 'Hello, I have an update about...', time: '5m ago', unread: true },
  ];

  return (
    <header className="dashboard-header">
      {/* LEFT: Search */}
      <div className="header-left">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search properties, payments, documents..." 
            className="search-input"
          />
          <span className="search-hint">⌘K</span>
        </div>
      </div>

      {/* RIGHT: Actions and Profile */}
      <div className="header-right">
        {/* Action Icons */}
        <div className="action-icons-group">
          <button 
            className="icon-btn" 
            title="Calendar"
            onClick={() => console.log('Calendar clicked')}
          >
            <FaCalendarAlt />
          </button>
          
          <div className="icon-btn-wrapper" ref={messageRef}>
            <button 
              className="icon-btn" 
              title="Messages"
              onClick={() => {
                setIsMessagesOpen(!isMessagesOpen);
                setIsNotificationsOpen(false);
              }}
            >
              <FaComments />
              {messageCount > 0 && <span className="badge">{messageCount}</span>}
            </button>
            
            {isMessagesOpen && (
              <div className="notification-dropdown messages-dropdown">
                <div className="dropdown-header">
                  <h3>Messages</h3>
                  <span className="view-all">View All</span>
                </div>
                <div className="dropdown-content">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`notification-item ${msg.unread ? 'unread' : ''}`}>
                      <div className="notification-avatar">
                        <FaComments />
                      </div>
                      <div className="notification-info">
                        <div className="notification-title">{msg.name}</div>
                        <div className="notification-message">{msg.message}</div>
                        <div className="notification-time">{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="icon-btn-wrapper" ref={notificationRef}>
            <button 
              className="icon-btn" 
              title="Notifications"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsMessagesOpen(false);
              }}
            >
              <FaBell />
              {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </button>
            
            {isNotificationsOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <span className="view-all">Mark all as read</span>
                </div>
                <div className="dropdown-content">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <div className="notification-avatar">
                        <FaBell />
                      </div>
                      <div className="notification-info">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <a href="/notifications">View all notifications</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="vertical-divider"></div>

        {/* Language Selector */}
        <div className="language-wrapper">
          <button 
            className="lang-selector"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            <FaGlobe />
            <span>EN</span>
            <FaChevronDown className={`chevron ${isLanguageOpen ? 'rotated' : ''}`} />
          </button>
          
          {isLanguageOpen && (
            <div className="language-dropdown">
              <div className="lang-option active">English</div>
              <div className="lang-option">Español</div>
              <div className="lang-option">Français</div>
              <div className="lang-option">Deutsch</div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* User Profile */}
        <div 
          className="user-profile-block" 
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            setIsNotificationsOpen(false);
            setIsMessagesOpen(false);
          }}
          ref={dropdownRef}
        >
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
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  <img src="https://i.pravatar.cc/150?u=alex" alt="profile" />
                </div>
                <div className="dropdown-user-details">
                  <div className="dropdown-user-name">Alex Rivera</div>
                  <div className="dropdown-user-email">alex.rivera@example.com</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/dashboard" className="dropdown-item">
                <FaHome /> Dashboard
              </a>
              <a href="/profile" className="dropdown-item">
                <FaUser /> My Profile
              </a>
              <a href="/documents" className="dropdown-item">
                <FaFileAlt /> Documents
              </a>
              <a href="/payments" className="dropdown-item">
                <FaCreditCard /> Payments
              </a>
              <a href="/maintenance" className="dropdown-item">
                <FaWrench /> Maintenance
              </a>
              <div className="dropdown-divider"></div>
              <a href="/settings" className="dropdown-item">
                <FaCog /> Settings
              </a>
              <a href="/help" className="dropdown-item">
                <FaQuestionCircle /> Help & Support
              </a>
              <div className="dropdown-divider"></div>
              <a href="/logout" className="dropdown-item logout">
                <FaSignOutAlt /> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;