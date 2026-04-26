import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaTools, FaHistory, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { LandlordContract } from '../../../../services/contract.service';
import './MaintenanceRequests.css';

interface MaintenanceRequestsProps {
  contract: LandlordContract | null;
}

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = ({ contract }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const maintenanceResponsibilities = contract?.maintenanceResponsibilities ?? [];
  const topResponsibilities = maintenanceResponsibilities.slice(0, 3);
  const hasResponsibilities = topResponsibilities.length > 0;

  return (
    <div className="card-base maintenance-dashboard">
      <header className="maintenance-top-nav">
        <div className="section-title">
          <div className="title-icon-ring"><FaTools /></div>
          <h3>{t('tenantHomeComponents.maintenance')}</h3>
        </div>

        <div className="maintenance-header-actions">
          <span className="request-id-pill">{t('tenantHomeComponents.noOpenRequests')}</span>
          <button className="btn-ghost-history" onClick={() => navigate('/maintenance-requests')}>
            <FaHistory /> <span>{t('tenantHomeComponents.history')}</span>
          </button>
        </div>
      </header>

      <div className="active-request-card">
        {hasResponsibilities ? (
          <div className="request-body">
            <div className="issue-details">
              <h4 className="issue-subject">{t('tenantHomeComponents.leaseResponsibilities')}</h4>
              <div className="tech-eta-card" style={{ display: 'block' }}>
                {topResponsibilities.map((responsibility) => (
                  <p key={responsibility.id} className="eta-text" style={{ marginBottom: '8px' }}>
                    <strong>{responsibility.area}:</strong>{' '}
                    {responsibility.responsibleParty === 'LANDLORD' ? t('tenantHomeComponents.landlord') : t('tenantHomeComponents.tenant')}
                  </p>
                ))}
              </div>
            </div>

            <div className="request-timeline">
              <div className="status-badge-premium">{t('tenantHomeComponents.configured')}</div>
            </div>
          </div>
        ) : (
          <div className="request-body">
            <div className="issue-details">
              <h4 className="issue-subject">{t('tenantHomeComponents.noMaintenanceItems')}</h4>
              <div className="tech-eta-card" style={{ display: 'block' }}>
                <p className="eta-text">{t('tenantHomeComponents.maintenanceItemsAppearHere')}</p>
              </div>
            </div>
            <div className="request-timeline">
              <div className="status-badge-premium">{t('landlordHomeComponents.clear')}</div>
            </div>
          </div>
        )}
      </div>

      <div className="new-request-cta">
        <div className="cta-content">
          <div className="cta-icon-box">
            <FaTools className="floating-icon" />
          </div>
          <h4>{t('tenantHomeComponents.needMaintenanceSupport')}</h4>
          <button className="btn-new-request" onClick={() => navigate('/maintenance-requests')}>
            <FaPlus /> <span>{t('tenantHomeComponents.newMaintenanceRequest')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequests;
