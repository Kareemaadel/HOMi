import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <div className="footer-inner">
        {/* LEFT: Branding & Legal */}
        <div className="footer-section footer-left">
          <div className="footer-brand">
            <span className="brand-text">HOMi<span className="dot">.</span></span>
            <div className="status-indicator-pill">
              <span className="pulse-dot"></span>
              Systems Operational
            </div>
          </div>
          <p className="copyright">© {currentYear} HOMi Tech Inc. • All rights reserved.</p>
        </div>

        {/* CENTER: Navigation */}
        <div className="footer-section footer-center">
          <nav className="footer-nav">
            <a href="/support" className="nav-link">Support</a>
            <a href="/privacy" className="nav-link">Privacy</a>
            <a href="/terms" className="nav-link">Terms</a>
            <a href="/help" className="nav-link">Help Center</a>
          </nav>
        </div>

        {/* RIGHT: Socials */}
        <div className="footer-section footer-right">
          <div className="social-grid">
            <a href="#" className="social-icon-btn"><FaFacebookF /></a>
            <a href="#" className="social-icon-btn"><FaTwitter /></a>
            <a href="#" className="social-icon-btn"><FaInstagram /></a>
            <a href="#" className="social-icon-btn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;