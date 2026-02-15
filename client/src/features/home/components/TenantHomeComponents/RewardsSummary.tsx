import React from 'react';
import './RewardsSummary.css';
// RewardsSummary.tsx
const RewardsSummary = () => (
  <div className="card-base rewards-premium">
    <div className="mesh-bg"></div>
    <div className="rewards-text">
      <p>Current Tier</p>
      <h4>Gold Resident</h4>
    </div>
    <div className="points-display">
      <span className="star-icon">⭐</span>
      <span className="points-number">4,850</span>
    </div>
    <div className="perks-row">
      <div className="perk">Free Cleaning</div>
      <div className="perk">Guest Pass</div>
    </div>
  </div>
);

export default RewardsSummary;
