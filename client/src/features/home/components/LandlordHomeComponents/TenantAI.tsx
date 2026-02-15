import React from 'react';
import { FaRobot, FaCheckCircle, FaStar } from 'react-icons/fa';
import './tenantAI.css';

const TenantAI = () => {
  const recommendations = [
    { id: 1, name: "Sarah Jenkins", score: 98, reason: "Excellent credit, 3yr stable job", property: "Skyline Apts" },
    { id: 2, name: "Michael Chen", score: 85, reason: "Verified income, 100% on-time payments", property: "Sunset Loft" }
  ];

  return (
    <div className="ai-container">
      <div className="ai-header">
        <div className="ai-title">
          <FaRobot className="ai-icon" />
          <h3>AI Tenant Insights</h3>
        </div>
        <span className="ai-badge">Live Analysis</span>
      </div>

      <p className="ai-description">Based on background checks, income stability, and rental history.</p>

      <div className="recommendation-list">
        {recommendations.map(tenant => (
          <div key={tenant.id} className="tenant-item">
            <div className="tenant-top">
              <div className="match-circle">
                <svg viewBox="0 0 36 36">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${tenant.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span>{tenant.score}%</span>
              </div>
              <div className="tenant-info">
                <h4>{tenant.name}</h4>
                <p>Applying for: <strong>{tenant.property}</strong></p>
              </div>
            </div>
            
            <div className="ai-reason">
              <FaCheckCircle className="check-icon" />
              <span>{tenant.reason}</span>
            </div>
            
            <button className="approve-btn">Review Application</button>
          </div>
        ))}
      </div>

      <div className="ai-footer-note">
        <FaStar /> Upgrade to Pro for deeper criminal background analysis.
      </div>
    </div>
  );
};

export default TenantAI;