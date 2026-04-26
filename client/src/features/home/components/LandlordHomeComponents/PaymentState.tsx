import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiArrowRight, FiClock, FiCheckCircle } from 'react-icons/fi';
import './PaymentState.css';

interface PaymentStateProps {
  upcomingPayouts: number;
  recentlyReceived: number;
  isLoading?: boolean;
}

const PaymentState: React.FC<PaymentStateProps> = ({
  upcomingPayouts,
  recentlyReceived,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currencyFormatter = new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const upcomingValue = isLoading ? t('sidebar.loading') : currencyFormatter.format(upcomingPayouts);
  const receivedValue = isLoading ? t('sidebar.loading') : currencyFormatter.format(recentlyReceived);

  return (
    <div className="payment-state-card">
      <div className="payment-header">
        <div className="payment-title">
          <div className="icon-wrapper">
            <FiDollarSign />
          </div>
          <h3>{t('landlordHomeComponents.financialOverview')}</h3>
        </div>
      </div>
      
      <div className="payment-body">
        <div className="payment-row">
          <div className="payment-info">
            <FiClock className="icon-pending" />
            <span>{t('landlordHomeComponents.upcomingPayouts')}</span>
          </div>
          <span className="payment-amount">{upcomingValue}</span>
        </div>
        
        <div className="payment-row">
          <div className="payment-info">
            <FiCheckCircle className="icon-success" />
            <span>{t('landlordHomeComponents.recentlyReceived')}</span>
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
          {t('landlordHomeComponents.viewFinances')} <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaymentState;