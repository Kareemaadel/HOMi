import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-left">
        <span className="brand">HOMi<span>.</span></span>
        <span className="copyright">© 2026 All rights reserved.</span>
      </div>

      <div className="footer-center">
        <nav className="footer-nav">
          <a href="/support">Support</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/help">Help Center</a>
        </nav>
      </div>

      <div className="footer-right">
        <div className="social-links">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaLinkedinIn /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;