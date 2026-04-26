import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCrown, FaInfoCircle, FaHome, FaCreditCard } from 'react-icons/fa';
import type { LandlordContract } from '../../../../services/contract.service';
import './RewardsSummary.css';

interface RewardsSummaryProps {
  contracts: LandlordContract[];
}

const RewardsSummary: React.FC<RewardsSummaryProps> = ({ contracts }) => {
  const { t } = useTranslation();
  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === 'ACTIVE').length,
    [contracts]
  );

  const pendingPayments = useMemo(
    () => contracts.filter((contract) => contract.status === 'PENDING_PAYMENT').length,
    [contracts]
  );

  return (
    <div className="card-base rewards-premium-container">
      <div className="glass-shimmer"></div>

      <header className="rewards-card-header">
        <div className="tier-badge">
          <FaCrown className="crown-icon" />
          <span>{t('tenantHomeComponents.residentSummary')}</span>
        </div>
        <FaInfoCircle className="info-trigger" />
      </header>

      <main className="rewards-main-display">
        <div className="points-hero">
          <div className="star-ring">
            <FaHome />
          </div>
          <div className="points-group">
            <h2 className="points-value">{activeContracts}</h2>
            <p className="points-label">{t('tenantHomeComponents.activeLease', { count: activeContracts })}</p>
          </div>
        </div>

        <div className="tier-progress-section">
          <div className="progress-labels">
            <span>{t('tenantHomeComponents.loyaltyRewards')}</span>
            <span>{t('tenantHomeComponents.launchingSoon')}</span>
          </div>
          <div className="tier-progress-bar">
            <div className="tier-progress-fill" style={{ width: `${pendingPayments > 0 ? 35 : 20}%` }}></div>
          </div>
        </div>
      </main>

      <footer className="perks-footer">
        <div className="perk-tag"><FaCreditCard /> {t('tenantHomeComponents.paymentTracking')}</div>
        <div className="perk-tag">{t('tenantHomeComponents.leaseInsights')}</div>
      </footer>
    </div>
  );
};

export default RewardsSummary;
