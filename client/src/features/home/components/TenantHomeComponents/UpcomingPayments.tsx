// UpcomingPayments.tsx
import React from 'react';
import './UpcomingPayments.css';

const UpcomingPayments = () => {
  return (
    <div className="card-base payment-premium-card">
      <div className="payment-main-content">
        <div className="payment-header-row">
          <div className="type-badge">Rent Payment</div>
          <span className="due-tag">Due in 3 days</span>
        </div>
        
        <div className="amount-section">
          <div className="amount-wrapper">
            <span className="currency">$</span>
            <span className="total-amount">1,450</span>
            <span className="decimal">.00</span>
          </div>
          <p className="billing-period">For period: April 1 - April 30</p>
        </div>

        <div className="payment-footer">
          <div className="mini-detail">
            <span className="detail-label">Method</span>
            <span className="detail-value">**** 4242</span>
          </div>
          <div className="mini-detail">
            <span className="detail-label">Autopay</span>
            <span className="detail-value status-off">Off</span>
          </div>
        </div>
      </div>

      <button className="payment-action-sidebar">
        <div className="btn-icon">💳</div>
        <span>Pay Now</span>
        <div className="hover-arrow">→</div>
      </button>
    </div>
  );
};

export default UpcomingPayments;