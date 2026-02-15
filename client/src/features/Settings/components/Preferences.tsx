// client/src/features/Settings/components/Preferences.tsx
import React from 'react';
import './Preferences.css';
import { FaMoon, FaSun, FaDesktop, FaGlobe, FaBell } from 'react-icons/fa';

const Preferences: React.FC = () => {
  return (
    <div className="pref-container">
      <div className="pref-header">
        <h2>System Preferences</h2>
        <p>Tailor your ActiveRentals interface to your liking.</p>
      </div>

      <section className="pref-section">
        <label className="pref-label">Appearance</label>
        <div className="theme-selector">
          <div className="theme-option active">
            <div className="theme-preview light">
              <FaSun />
            </div>
            <span>Light</span>
          </div>
          <div className="theme-option">
            <div className="theme-preview dark">
              <FaMoon />
            </div>
            <span>Dark</span>
          </div>
          <div className="theme-option">
            <div className="theme-preview system">
              <FaDesktop />
            </div>
            <span>System</span>
          </div>
        </div>
      </section>

      <section className="pref-section">
        <div className="pref-row">
          <div className="pref-info">
            <div className="pref-icon-bg"><FaGlobe /></div>
            <div>
              <h4>Language</h4>
              <p>Select your preferred dashboard language</p>
            </div>
          </div>
          <select className="pref-select">
            <option>English (US)</option>
            <option>Spanish (ES)</option>
            <option>French (FR)</option>
          </select>
        </div>

        <div className="pref-row">
          <div className="pref-info">
            <div className="pref-icon-bg bell"><FaBell /></div>
            <div>
              <h4>Desktop Notifications</h4>
              <p>Receive real-time alerts on your browser</p>
            </div>
          </div>
          <label className="pref-toggle">
            <input type="checkbox" defaultChecked />
            <span className="pref-slider"></span>
          </label>
        </div>
      </section>
    </div>
  );
};

export default Preferences;