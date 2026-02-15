// import React from 'react';
// import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
// import './footer.css';

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="dashboard-footer">
//       <div className="footer-inner">
//         {/* LEFT: Branding & Legal */}
//         <div className="footer-section footer-left">
//           <div className="footer-brand">
//             <span className="brand-text">HOMi<span className="dot">.</span></span>
//             <div className="status-indicator-pill">
//               <span className="pulse-dot"></span>
//               Systems Operational
//             </div>
//           </div>
//           <p className="copyright">© {currentYear} HOMi Tech Inc. • All rights reserved.</p>
//         </div>

//         {/* CENTER: Navigation */}
//         <div className="footer-section footer-center">
//           <nav className="footer-nav">
//             <a href="/support" className="nav-link">Support</a>
//             <a href="/privacy" className="nav-link">Privacy</a>
//             <a href="/terms" className="nav-link">Terms</a>
//             <a href="/help" className="nav-link">Help Center</a>
//           </nav>
//         </div>

//         {/* RIGHT: Socials */}
//         <div className="footer-section footer-right">
//           <div className="social-grid">
//             <a href="#" className="social-icon-btn"><FaFacebookF /></a>
//             <a href="#" className="social-icon-btn"><FaTwitter /></a>
//             <a href="#" className="social-icon-btn"><FaInstagram /></a>
//             <a href="#" className="social-icon-btn"><FaLinkedinIn /></a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// new edits :

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About HOMi Section */}
          <div className="footer-section footer-about">
            <h3 className="footer-section-title">About HOMi</h3>
            <p className="footer-description">
              HOMi is a centralized rental management platform that brings transparency, 
              efficiency, and seamless communication to landlords, tenants, and maintenance 
              providers. Streamline your rental operations with our comprehensive solution.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section footer-links">
            <h3 className="footer-section-title">Quick Links</h3>
            <nav className="footer-nav" aria-label="Footer navigation">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/features" className="footer-link">Features</Link>
              <Link to="/for-landlords" className="footer-link">Landlords</Link>
              <Link to="/for-tenants" className="footer-link">Tenants</Link>
              <Link to="/maintenance-providers" className="footer-link">Maintenance Providers</Link>
            </nav>
          </div>

          {/* Support & Legal Section */}
          <div className="footer-section footer-support">
            <h3 className="footer-section-title">Support & Legal</h3>
            <nav className="footer-nav" aria-label="Support and legal links">
              <Link to="/contact" className="footer-link">Contact Us</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms & Conditions</Link>
            </nav>
          </div>

          {/* Social Media Section */}
          <div className="footer-section footer-social">
            <h3 className="footer-section-title">Follow Us</h3>
            <div className="social-links" aria-label="Social media links">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} HOMi Tech Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;