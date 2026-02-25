import React from 'react';
import { FaCreditCard, FaCalendarAlt, FaChevronRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './UpcomingPayments.css';

interface PaymentProps {
  amount?: number;
  dueDate?: string;
  isAutopay?: boolean;
  lastFour?: string;
}

const UpcomingPayments: React.FC<PaymentProps> = ({ 
  amount = 1450.00, 
  dueDate = "3 days", 
  isAutopay = false, 
  lastFour = "4242" 
}) => {
  return (
    <div className="card-base payment-premium-card">
      <div className="payment-main-content">
        <header className="payment-header">
          <span className="type-badge">Rent Payment</span>
          <div className="due-status-indicator">
            <FaExclamationCircle className="pulse-icon" />
            <span>Due in {dueDate}</span>
          </div>
        </header>
        
        <div className="amount-display">
          <div className="amount-main">
            <span className="currency-symbol">$</span>
            <span className="amount-value">{amount.toLocaleString()}</span>
            <span className="amount-fraction">.00</span>
          </div>
          <p className="billing-label">
            <FaCalendarAlt className="icon-subtle" /> Period: April 1 - April 30
          </p>
        </div>

        <footer className="payment-meta-footer">
          <div className="meta-item">
            <span className="meta-label">Method</span>
            <div className="meta-value">
              <FaCreditCard className="card-icon" /> 
              <span>•••• {lastFour}</span>
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-label">Autopay</span>
            <div className={`meta-value autopay-status ${isAutopay ? 'active' : 'inactive'}`}>
              {isAutopay ? <FaCheckCircle /> : null}
              <span>{isAutopay ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        </footer>
      </div>

      <button className="payment-side-action" aria-label="Process payment">
        <div className="action-top">
          <FaCreditCard className="pay-icon" />
        </div>
        <span className="action-text">Pay Now</span>
        <div className="action-bottom">
          <FaChevronRight className="arrow-icon" />
        </div>
      </button>
    </div>
  );
};

export default UpcomingPayments;