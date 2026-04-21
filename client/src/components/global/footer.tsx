import { Link } from 'react-router-dom';
import { 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaFacebookF, 
  FaEnvelope,
  FaPhoneAlt
} from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">


      <div className="footer-section-container">
        <div className="footer-grid">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo">
              {/* Image styling updated to strictly preserve aspect ratio */}
              <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
            </Link>
            <p className="brand-description">
              The premium, end-to-end platform modernizing the real estate rental market for landlords and tenants alike.
            </p>
            
            {/* Social Media */}
            <div className="footer-socials">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/browse-properties">Browse Homes</Link>
            <Link to="/for-landlords">List a Property</Link>
            <Link to="/homi-plus">HOMI Pro</Link>
            <Link to="/pricing">Pricing & Fees</Link>
            <Link to="/roommate-matching">Roommate Matching</Link>
          </div>

          {/* Resources Links */}
          <div className="footer-links">
            <h4>Resources</h4>
            <Link to="/about-us">About Us</Link>
            <Link to="/get-help">Help Center</Link>
            <Link to="/blog">Real Estate Blog</Link>
            <Link to="/careers">Careers</Link>
          </div>

          {/* Contact & Legal */}
          <div className="footer-links">
            <h4>Contact & Legal</h4>
            <div className="footer-contact-info">
              <a href="mailto:support@homi.com"><FaEnvelope /> support@homi.com</a>
              <a href="tel:+18005550199"><FaPhoneAlt /> +1 (800) 555-0199</a>
            </div>
            <div className="footer-divider"></div>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/trust">Trust & Safety</Link>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} HOMI Technologies Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/sitemap">Sitemap</Link>
            <span className="dot">•</span>
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;