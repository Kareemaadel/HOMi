import React from 'react';
import './Billing.css';
import { FaCheckCircle, FaCreditCard, FaDownload, FaHistory } from 'react-icons/fa';

const Billing: React.FC = () => {
  return (
    <div className="billing-wrapper animate-fade-in">
      <div className="current-plan-card">
        <div className="plan-info">
          <span className="plan-badge">Active Plan</span>
          <h2>Landlord Pro <span>$49/mo</span></h2>
          <p>Next billing date: <strong>March 15, 2026</strong></p>
        </div>
        <button className="upgrade-btn">Manage Subscription</button>
      </div>

      <div className="billing-grid">
        <div className="payment-methods-section">
          <h3><FaCreditCard /> Payment Methods</h3>
          <div className="method-card">
            <div className="card-brand">VISA</div>
            <div className="card-details">
              <p>•••• •••• •••• 4242</p>
              <span>Expires 12/28</span>
            </div>
            <button className="text-btn">Edit</button>
          </div>
          <button className="add-method-btn">+ Add New Method</button>
        </div>

        <div className="invoice-history">
          <h3><FaHistory /> Recent Invoices</h3>
          {[1, 2, 3].map(i => (
            <div className="invoice-item" key={i}>
              <div className="inv-meta">
                <strong>Feb 15, 2026</strong>
                <span>PRO-2026-00{i}</span>
              </div>
              <div className="inv-amount">$49.00</div>
              <button className="icon-btn"><FaDownload /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billing;