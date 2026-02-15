// import React, { useState, useEffect } from 'react';
// import { FaSearch, FaBell, FaComments, FaGlobe, FaChevronDown, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
// import './header.css';

// const Header = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // Add a nice shadow effect on scroll
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 10);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <header className={`dashboard-header ${scrolled ? 'scrolled' : ''}`}>
//       <div className="header-inner">
//         {/* LEFT: Search */}
//         <div className="header-left">
//           <div className="search-wrapper">
//             <FaSearch className="search-icon" />
//             <input type="text" placeholder="Search properties, tenants..." />
//             <kbd className="search-hint">⌘K</kbd>
//           </div>
//         </div>

//         {/* RIGHT: Actions & Profile */}
//         <div className="header-right">
//           <div className="action-icons-group">
//             <button className="icon-btn" title="Calendar">
//               <FaCalendarAlt />
//             </button>
//             <button className="icon-btn" title="Messages">
//               <FaComments />
//               <span className="status-dot green"></span>
//             </button>
//             <button className="icon-btn" title="Notifications">
//               <FaBell />
//               <span className="status-dot red"></span>
//             </button>
//           </div>

//           <div className="vertical-divider"></div>

//           <button className="lang-selector">
//             <FaGlobe className="globe-icon" />
//             <span>EN</span>
//           </button>

//           <div className="user-profile-wrapper">
//             <div className="user-profile-block" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
//               <div className="avatar-container">
//                 <img src="https://i.pravatar.cc/150?u=alex" alt="profile" />
//                 <div className="online-indicator"></div>
//               </div>
//               <div className="user-details">
//                 <span className="user-name">Alex Rivera</span>
//                 <span className="user-role">Landlord Pro</span>
//               </div>
//               <FaChevronDown className={`chevron ${isDropdownOpen ? 'rotated' : ''}`} />
//             </div>

//             {isDropdownOpen && (
//               <div className="header-dropdown">
//                 <div className="dropdown-header">
//                   <p>Account ID: #8829</p>
//                   <span className="pro-badge"><FaShieldAlt /> Verified</span>
//                 </div>
//                 <div className="dropdown-menu">
//                   <div className="dropdown-item"><FaUser /> Profile Details</div>
//                   <div className="dropdown-item"><FaCog /> Account Settings</div>
//                   <div className="dropdown-divider"></div>
//                   <div className="dropdown-item logout"><FaSignOutAlt /> Sign Out</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;











// new edits :
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import './header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.header-nav') && !target.closest('.mobile-menu-toggle')) {
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
          <Link to="/for-landlords" className={`nav-link ${location.pathname === '/for-landlords' ? 'active' : ''}`}>
            How It Works
          </Link>
          <Link to="/for-tenants" className={`nav-link ${location.pathname === '/for-tenants' ? 'active' : ''}`}>
            Saved Properties
          </Link>
          <Link to="/maintenance-providers" className={`nav-link ${location.pathname === '/maintenance-providers' ? 'active' : ''}`}>
            Get Help
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
            About Us
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="header-nav mobile-nav" aria-label="Mobile navigation">
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
          
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/features" className={`nav-link ${location.pathname === '/features' ? 'active' : ''}`}>
            Features
          </Link>
          <Link to="/for-landlords" className={`nav-link ${location.pathname === '/for-landlords' ? 'active' : ''}`}>
            For Landlords
          </Link>
          <Link to="/for-tenants" className={`nav-link ${location.pathname === '/for-tenants' ? 'active' : ''}`}>
            For Tenants
          </Link>
          <Link to="/maintenance-providers" className={`nav-link ${location.pathname === '/maintenance-providers' ? 'active' : ''}`}>
            Maintenance Providers
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
            About
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;