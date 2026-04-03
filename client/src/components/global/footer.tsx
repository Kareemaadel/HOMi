import { Link } from 'react-router-dom';
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
              <img src="/logo.png" alt="HOMi Logo" className="logo-image" />
            </Link>
            <p>The premium, end-to-end platform modernizing the real estate rental market.</p>
          </div>

          {/* Platform Links */}
          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/browse-properties">Browse Homes</Link>
            <Link to="/for-landlords">List a Property</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          {/* Resources Links */}
          <div className="footer-links">
            <h4>Resources</h4>
            <Link to="/about">About Us</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/blog">Real Estate Blog</Link>
          </div>

          {/* Legal Links */}
          <div className="footer-links">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/trust">Trust & Safety</Link>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} HOMI Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;