import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiX, 
  FiCamera, 
  FiAlignLeft, 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle, 
  FiEdit3, 
  FiTrendingUp 
} from 'react-icons/fi';
import './optimizeListingModal.css';

interface OptimizeListingModalProps {
  onClose: () => void;
}

const OptimizeListingModal: React.FC<OptimizeListingModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="olm-overlay animate-fade-in">
      <div className="olm-modal-container animate-slide-up">
        
        {/* Header */}
        <div className="olm-header">
          <div>
            <h2>{t('landlordHomeComponents.optimizeYourListing')}</h2>
            <p>{t('landlordHomeComponents.improveListingAttract')}</p>
          </div>
          <button className="olm-close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="olm-content">
          
          {/* Top Section: Score */}
          <div className="olm-score-card">
            <div className="olm-score-circle">
              <svg viewBox="0 0 36 36" className="olm-circular-chart olm-orange">
                <path className="olm-circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="olm-circle"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="olm-score-text">
                <span className="olm-percentage">70%</span>
                <span className="olm-label">{t('landlordHomeComponents.score')}</span>
              </div>
            </div>
            <div className="olm-score-breakdown">
              <h3>{t('landlordHomeComponents.listingScore')}: 70%</h3>
              <p>{t('landlordHomeComponents.almostThere')}</p>
              <div className="olm-breakdown-list">
                <span className="olm-status-item olm-success"><FiCheckCircle /> {t('landlordHomeComponents.photos')}</span>
                <span className="olm-status-item olm-success"><FiCheckCircle /> {t('landlordHomeComponents.description')}</span>
                <span className="olm-status-item olm-error"><FiXCircle /> {t('landlordHomeComponents.amenities')}</span>
              </div>
            </div>
          </div>

          {/* Tips Sections Grid */}
          <div className="olm-tips-grid">
            
            {/* Photos Quality */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-blue"><FiCamera /></div>
                <h4>{t('landlordHomeComponents.photosQuality')}</h4>
              </div>
              <ul className="olm-checklist">
                <li><FiCheckCircle className="olm-check-icon" /> {t('landlordHomeComponents.addHighQualityBright')}</li>
                <li><FiCheckCircle className="olm-check-icon" /> {t('landlordHomeComponents.showAllRooms')}</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-100 olm-bg-blue"></div></div>
            </div>

            {/* Description Quality */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-purple"><FiAlignLeft /></div>
                <h4>{t('landlordHomeComponents.descriptionQuality')}</h4>
              </div>
              <ul className="olm-checklist">
                <li><FiCheckCircle className="olm-check-icon" /> {t('landlordHomeComponents.writeClearDetailed')}</li>
                <li><FiCheckCircle className="olm-check-icon" /> {t('landlordHomeComponents.highlightKeyFeatures')}</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-100 olm-bg-purple"></div></div>
            </div>

            {/* Pricing Strategy */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-green"><FiDollarSign /></div>
                <h4>{t('landlordHomeComponents.pricingStrategy')}</h4>
              </div>
              <ul className="olm-checklist">
                <li><div className="olm-dot"></div> {t('landlordHomeComponents.setCompetitivePricingStrategy')}</li>
                <li><div className="olm-dot"></div> {t('landlordHomeComponents.compareSimilarLocal')}</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-50 olm-bg-green"></div></div>
            </div>

          </div>

        </div>

        {/* CTA Footer */}
        <div className="olm-footer">
          <button className="olm-btn-secondary" onClick={onClose}>
            <FiEdit3 /> {t('landlordHomeComponents.editProperty')}
          </button>
          <button className="olm-btn-primary" onClick={onClose}>
            <FiTrendingUp /> {t('landlordHomeComponents.improveNow')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OptimizeListingModal;