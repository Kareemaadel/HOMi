// client\src\features\MyProperties\components\DetailedPropertyCard.tsx
import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, 
  FaUserCircle, FaCalendarAlt, FaTools, FaEllipsisH 
} from 'react-icons/fa';
import ManagePropertyModal from './ManagePropertyModal'; // Import the new modal
import './DetailedPropertyCard.css';

const DetailedPropertyCard = ({ property }: any) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  return (
    <>
      <div className="detailed-card">
        <div className="detailed-image-section">
          <img src="/rentblue.jpg" alt={property.name} />
          <div className="image-overlay-tags">
            <span className={`detailed-badge ${property.status}`}>
              {property.status}
            </span>
            {property.maintenance && (
              <span className="maintenance-tag"><FaTools /> Maintenance</span>
            )}
          </div>
        </div>

        <div className="detailed-info-section">
          <div className="detailed-header">
            <div className="title-area">
              <h2>{property.name}</h2>
              <p className="detailed-address"><FaMapMarkerAlt /> {property.address}</p>
            </div>
            <button className="icon-btn-more"><FaEllipsisH /></button>
          </div>

          <div className="detailed-specs">
            <span><FaBed /> <strong>{property.beds}</strong> Beds</span>
            <span><FaBath /> <strong>{property.baths}</strong> Baths</span>
            <span><FaRulerCombined /> <strong>{property.sqft}</strong> sqft</span>
          </div>

          <div className="occupancy-container">
            <div className="occupancy-header">
              <label>Portfolio Performance</label>
              <span>{property.occupancyRate}% Occupancy</span>
            </div>
            <div className="occupancy-bar">
              <div className="occupancy-fill" style={{ width: `${property.occupancyRate}%` }}></div>
            </div>
          </div>

          <div className="tenant-info-bar">
            <div className="info-group">
              <FaUserCircle className="icon" />
              <div>
                <label>Current Tenant</label>
                <p>{property.tenantName || 'Unoccupied'}</p>
              </div>
            </div>
            <div className="info-group">
              <FaCalendarAlt className="icon" />
              <div>
                <label>Lease Expiry</label>
                <p>{property.leaseEnd || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-stats-section">
          <div className="financial-overview">
            <div className="stat-pill">
              <label>Annual Yield</label>
              <span className="yield-up">+{property.yield}%</span>
            </div>
            <div className="main-price">
              <span className="currency">$</span>
              <span className="amount">{property.price.replace('$', '')}</span>
              <span className="period">/mo</span>
            </div>
          </div>
          <div className="action-buttons">
            {/* TRIGGER MODAL HERE */}
            <button className="manage-btn" onClick={() => setIsManageModalOpen(true)}>
              Manage Unit
            </button>
            <button className="history-btn">View History</button>
          </div>
        </div>
      </div>

      {/* RENDER MODAL */}
      {isManageModalOpen && (
        <ManagePropertyModal 
          property={property} 
          onClose={() => setIsManageModalOpen(false)} 
        />
      )}
    </>
  );
};

export default DetailedPropertyCard;