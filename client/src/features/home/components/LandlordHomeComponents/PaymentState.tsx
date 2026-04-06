import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowRight, FiClock, FiCheckCircle } from 'react-icons/fi';
import './PaymentState.css';

interface PaymentStateProps {
  upcomingPayouts: number;
  recentlyReceived: number;
  isLoading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const PaymentState: React.FC<PaymentStateProps> = ({
  upcomingPayouts,
  recentlyReceived,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const upcomingValue = isLoading ? 'Loading...' : currencyFormatter.format(upcomingPayouts);
  const receivedValue = isLoading ? 'Loading...' : currencyFormatter.format(recentlyReceived);

  return (
    <div className="payment-state-card">
      <div className="payment-header">
        <div className="payment-title">
          <div className="icon-wrapper">
            <FiDollarSign />
          </div>
          <h3>Financial Overview</h3>
        </div>
      </div>
      
      <div className="payment-body">
        <div className="payment-row">
          <div className="payment-info">
            <FiClock className="icon-pending" />
            <span>Upcoming Payouts</span>
          </div>
          <span className="payment-amount">{upcomingValue}</span>
        </div>
        
        <div className="payment-row">
          <div className="payment-info">
            <FiCheckCircle className="icon-success" />
            <span>Recently Received</span>
          </div>
          <span className="payment-amount">{receivedValue}</span>
        </div>
      </div>

      <div className="payment-footer">
        {/* Adjust the route string to match your exact App.tsx routing path */}
        <button 
          className="btn-view-finance"
          onClick={() => navigate('/landlord-payment')} 
        >
          View Finances <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentState;