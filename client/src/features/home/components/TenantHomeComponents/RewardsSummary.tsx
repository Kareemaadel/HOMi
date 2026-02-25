import React from 'react';
import { FaCrown, FaStar, FaInfoCircle } from 'react-icons/fa';
import './RewardsSummary.css';

const RewardsSummary: React.FC = () => {
  const currentPoints = 4850;
  const nextTierPoints = 5000;
  const progress = (currentPoints / nextTierPoints) * 100;

  return (
    <div className="card-base rewards-premium-container">
      <div className="glass-shimmer"></div>
      
      <header className="rewards-card-header">
        <div className="tier-badge">
          <FaCrown className="crown-icon" />
          <span>Gold Resident</span>
        </div>
        <FaInfoCircle className="info-trigger" />
      </header>

      <main className="rewards-main-display">
        <div className="points-hero">
          <div className="star-ring">
            <FaStar />
          </div>
          <div className="points-group">
            <h2 className="points-value">{currentPoints.toLocaleString()}</h2>
            <p className="points-label">Available Points</p>
          </div>
        </div>

        <div className="tier-progress-section">
          <div className="progress-labels">
            <span>Next Tier: <strong>Platinum</strong></span>
            <span>{nextTierPoints - currentPoints} to go</span>
          </div>
          <div className="tier-progress-bar">
            <div className="tier-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </main>

      <footer className="perks-footer">
        <div className="perk-tag">Free Cleaning</div>
        <div className="perk-tag">Guest Pass</div>
        <div className="perk-tag">+2 More</div>
      </footer>
    </div>
  );
};

export default RewardsSummary;