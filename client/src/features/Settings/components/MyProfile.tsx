// client/src/features/Settings/components/MyProfile.tsx
import React from 'react';
import './MyProfile.css';
import { FaCamera, FaIdBadge, FaEnvelope, FaPhone } from 'react-icons/fa';

const MyProfile: React.FC = () => (
  <div className="profile-wrapper">
    <div className="profile-identity-card">
      <div className="avatar-main-wrapper">
        <img src="https://i.pravatar.cc/150?u=tenant" alt="Profile" />
        <button className="edit-btn-floating"><FaCamera /></button>
      </div>
      <div className="identity-text">
        <h3>Alex Rivera</h3>
        <p>Premium Member</p>
      </div>
      <div className="identity-stats">
        <div className="stat"><span>Active Since</span><strong>Feb 2024</strong></div>
        <div className="stat"><span>Rentals</span><strong>12</strong></div>
      </div>
    </div>

    <div className="profile-edit-surface">
      <div className="form-section-title">Personal Details</div>
      <div className="input-group-modern">
        <div className="modern-field">
          <FaIdBadge className="field-icon" />
          <div className="field-content">
            <label>Full Name</label>
            <input type="text" placeholder="Alex Rivera" />
          </div>
        </div>
        <div className="modern-field">
          <FaEnvelope className="field-icon" />
          <div className="field-content">
            <label>Email Address</label>
            <input type="email" placeholder="alex.r@outlook.com" />
          </div>
        </div>
        <div className="modern-field">
          <FaPhone className="field-icon" />
          <div className="field-content">
            <label>Phone Number</label>
            <input type="text" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>
      <button className="prime-save-button">Save Changes</button>
    </div>
  </div>
);

export default MyProfile;