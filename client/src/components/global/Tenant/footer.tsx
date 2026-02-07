import React, { useState } from 'react';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronRight,
} from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    console.log('Subscribed:', email);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="dashboard-footer">
      <div className="footer-container">

        {/* TOP */}
        <div className="footer-top">

          {/* BRAND */}
          <div className="footer-section footer-brand">
            <span className="brand-name">
              HOMi<span className="brand-dot">.</span>
            </span>

            <p className="brand-description">
              Your trusted platform for seamless property management and rental solutions.
            </p>

            <div className="contact-info">
              <div className="contact-item"><FaEnvelope /> support@homi.com</div>
              <div className="contact-item"><FaPhone /> +1 (555) 123-4567</div>
              <div className="contact-item"><FaMapMarkerAlt /> 123 Property St, City</div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#"><FaChevronRight /> Dashboard</a></li>
              <li><a href="#"><FaChevronRight /> Properties</a></li>
              <li><a href="#"><FaChevronRight /> Payments</a></li>
              <li><a href="#"><FaChevronRight /> Maintenance</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#"><FaChevronRight /> Help Center</a></li>
              <li><a href="#"><FaChevronRight /> FAQ</a></li>
              <li><a href="#"><FaChevronRight /> Contact</a></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="footer-section">
            <h3 className="footer-title">Stay Updated</h3>
            <p className="newsletter-description">
              Subscribe for updates and tips.
            </p>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  className="newsletter-input"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="newsletter-button" type="submit">
                  <FaEnvelope />
                </button>
              </div>
            </form>

            <div className="legal-links">
              <a href="#">Privacy</a> • <a href="#">Terms</a> • <a href="#">Cookies</a>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} HOMi. All rights reserved.</p>

          <div className="social-links">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedinIn /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
