// client/src/features/Settings/components/About.tsx
import React from 'react';
import './About.css';
import { FaGithub, FaTwitter, FaGlobe } from 'react-icons/fa';

const About: React.FC = () => (
  <div className="about-glass-container">
    <div className="about-hero-section">
      <div className="glass-logo">AR</div>
      <div className="glass-title">
        <h1>ActiveRentals</h1>
        <span>Version 2.4.0 • Enterprise Edition</span>
      </div>
    </div>

    <div className="about-content-grid">
      <div className="glass-card">
        <h4>Our Mission</h4>
        <p>To redefine property management through elegant software and seamless user experiences.</p>
      </div>
      <div className="glass-card">
        <h4>Connect</h4>
        <div className="social-links">
          <FaGithub /><FaTwitter /><FaGlobe />
        </div>
      </div>
    </div>

    <footer className="about-footer">
      <p>© 2026 ActiveRentals Inc. All rights reserved.</p>
      <div className="legal-links">Privacy Policy • Terms of Service</div>
    </footer>
  </div>
);

export default About;