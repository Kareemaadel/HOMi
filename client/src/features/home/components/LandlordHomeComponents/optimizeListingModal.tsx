import React from 'react';
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
  return (
    <div className="olm-overlay animate-fade-in">
      <div className="olm-modal-container animate-slide-up">
        
        {/* Header */}
        <div className="olm-header">
          <div>
            <h2>Optimize Your Listing</h2>
            <p>Improve your listing to attract more tenants and secure faster bookings.</p>
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
                <span className="olm-label">Score</span>
              </div>
            </div>
            <div className="olm-score-breakdown">
              <h3>Listing Score: 70%</h3>
              <p>Almost there! Just a few tweaks to make your listing perfect.</p>
              <div className="olm-breakdown-list">
                <span className="olm-status-item olm-success"><FiCheckCircle /> Photos</span>
                <span className="olm-status-item olm-success"><FiCheckCircle /> Description</span>
                <span className="olm-status-item olm-error"><FiXCircle /> Amenities</span>
              </div>
            </div>
          </div>

          {/* Tips Sections Grid */}
          <div className="olm-tips-grid">
            
            {/* Photos Quality */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-blue"><FiCamera /></div>
                <h4>Photos Quality</h4>
              </div>
              <ul className="olm-checklist">
                <li><FiCheckCircle className="olm-check-icon" /> Add high-quality, bright images</li>
                <li><FiCheckCircle className="olm-check-icon" /> Show all rooms (bedroom, kitchen, bath)</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-100 olm-bg-blue"></div></div>
            </div>

            {/* Description Quality */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-purple"><FiAlignLeft /></div>
                <h4>Description Quality</h4>
              </div>
              <ul className="olm-checklist">
                <li><FiCheckCircle className="olm-check-icon" /> Write a clear, detailed description</li>
                <li><FiCheckCircle className="olm-check-icon" /> Highlight key features (e.g., balcony)</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-100 olm-bg-purple"></div></div>
            </div>

            {/* Pricing Strategy */}
            <div className="olm-tip-card">
              <div className="olm-tip-header">
                <div className="olm-icon-wrapper olm-bg-green"><FiDollarSign /></div>
                <h4>Pricing Strategy</h4>
              </div>
              <ul className="olm-checklist">
                <li><div className="olm-dot"></div> Set competitive pricing for your area</li>
                <li><div className="olm-dot"></div> Compare with similar local properties</li>
              </ul>
              <div className="olm-progress-bar"><div className="olm-progress-fill olm-fill-50 olm-bg-green"></div></div>
            </div>

          </div>

        </div>

        {/* CTA Footer */}
        <div className="olm-footer">
          <button className="olm-btn-secondary" onClick={onClose}>
            <FiEdit3 /> Edit Property
          </button>
          <button className="olm-btn-primary" onClick={onClose}>
            <FiTrendingUp /> Improve Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default OptimizeListingModal;