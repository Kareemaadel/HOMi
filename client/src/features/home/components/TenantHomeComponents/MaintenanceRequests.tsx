import React from 'react';
import { FaTools, FaHistory, FaClock, FaCheckCircle, FaPlus } from 'react-icons/fa';
import './MaintenanceRequests.css';

const MaintenanceRequests = () => {
  const steps = [
    { label: 'Reported', status: 'done' },
    { label: 'Assigned', status: 'active' },
    { label: 'Resolved', status: 'pending' },
  ];

  return (
    <div className="card-base maintenance-dashboard">
      <header className="maintenance-top-nav">
        <div className="section-title">
          <div className="title-icon-ring"><FaTools /></div>
          <div>
            <h3>Maintenance</h3>
            <span className="request-id-pill">Ticket #REQ-992</span>
          </div>
        </div>
        <button className="btn-ghost-history">
          <FaHistory /> <span>History</span>
        </button>
      </header>

      {/* Active Request Card */}
      <div className="active-request-card">
        <div className="request-body">
          <div className="issue-details">
            <h4 className="issue-subject">Kitchen Faucet Leak</h4>
            <div className="tech-eta-card">
              <div className="avatar-stack">
                <img src="https://i.pravatar.cc/150?u=tech" alt="Mike Ross" />
                <div className="online-pulse"></div>
              </div>
              <div className="tech-info">
                <p className="tech-name">Mike Ross</p>
                <p className="eta-text"><FaClock /> Arriving at <strong>2:00 PM</strong></p>
              </div>
            </div>
          </div>

          <div className="request-timeline">
            <div className="status-badge-premium">In Progress</div>
            <div className="progress-steps">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`step-segment ${step.status}`} 
                  title={step.label}
                >
                  {step.status === 'done' && <FaCheckCircle className="step-check" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Request Call to Action Area */}
      <div className="new-request-cta">
        <div className="cta-content">
          <div className="cta-icon-box">
            <FaTools className="floating-icon" />
          </div>
          <h4>Need something else fixed?</h4>
          <button className="btn-new-request">
            <FaPlus /> <span>New Maintenance Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequests;