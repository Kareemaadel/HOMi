import React from 'react';
import './Privacy.css';
import { FaDownload, FaGoogle } from 'react-icons/fa';

const Privacy: React.FC = () => {
  return (
    <div className="privacy-wrapper animate-fade-in">
      <div className="section-intro">
        <h2>Privacy & Personal Data</h2>
        <p>Manage who sees your information and how your data is handled.</p>
      </div>

      <div className="privacy-section">
        <h3>Visibility Settings</h3>
        <div className="toggle-row">
          <div className="toggle-text">
            <h4>Public Profile</h4>
            <p>Allow landlords to find your profile via search</p>
          </div>
          <label className="pref-toggle">
            <input type="checkbox" defaultChecked />
            <span className="pref-slider"></span>
          </label>
        </div>
        <div className="toggle-row">
          <div className="toggle-text">
            <h4>Contact Transparency</h4>
            <p>Show my verified phone number to active landlords</p>
          </div>
          <label className="pref-toggle">
            <input type="checkbox" />
            <span className="pref-slider"></span>
          </label>
        </div>
      </div>

      <div className="data-management">
          <h3>Your Data</h3>
          <div className="data-card">
              <div className="data-info">
                  <FaDownload className="data-icon" />
                  <div>
                      <h4>Download Personal Archive</h4>
                      <p>Get a copy of all your rental history, messages, and documents in a JSON/PDF format.</p>
                  </div>
              </div>
              <button className="secondary-btn">Request Data</button>
          </div>
      </div>

      <div className="connected-accounts">
          <h3>Connected Accounts</h3>
          <div className="account-item">
              <div className="acc-meta"><FaGoogle /> Google Workspace</div>
              <button className="text-btn red">Disconnect</button>
          </div>
      </div>
    </div>
  );
};

export default Privacy;