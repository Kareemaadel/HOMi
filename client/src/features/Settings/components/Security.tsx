// client/src/features/Settings/components/Security.tsx
import React from 'react';
import './Security.css';
import { FaShieldVirus, FaFingerprint, FaHistory, FaKey } from 'react-icons/fa';

const Security: React.FC = () => (
  <div className="security-grid-layout">
    <div className="security-status-hero">
      <div className="safety-meter">
        <svg viewBox="0 0 36 36" className="circular-chart blue">
          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="circle" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="percentage">85%</div>
      </div>
      <div className="status-meta">
        <h3>Security Score: Good</h3>
        <p>Your account is well protected. Enable 2FA to reach 100%.</p>
      </div>
    </div>

    <div className="security-tools-grid">
      <div className="tool-card">
        <div className="tool-icon-box"><FaKey /></div>
        <h4>Password</h4>
        <p>Change your secure passphrase</p>
        <button className="tool-btn">Update</button>
      </div>
      <div className="tool-card active">
        <div className="tool-icon-box"><FaFingerprint /></div>
        <h4>2FA Auth</h4>
        <p>Biometric or SMS verification</p>
        <button className="tool-btn">Manage</button>
      </div>
      <div className="tool-card">
        <div className="tool-icon-box"><FaHistory /></div>
        <h4>Sessions</h4>
        <p>Last login: 2 hours ago</p>
        <button className="tool-btn">Review</button>
      </div>
    </div>
  </div>
);

export default Security;