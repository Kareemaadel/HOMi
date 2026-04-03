import React, { useState } from 'react';
import { 
  FiMapPin, FiMoreHorizontal, FiMaximize, 
  FiUsers, FiActivity, FiArrowUpRight, FiCheckCircle, FiClock 
} from 'react-icons/fi';
import ManagePropertyModal from '../../../MyProperties/components/ManagePropertyModal';
import './PropertyCard.css';

interface PropertyCardProps {
  name?: string;
  address?: string;
  status?: string;
  price?: string;
  tenantName?: string;
  paymentStatus?: string;
  beds?: number;
  baths?: number;
  sqft?: string | number;
  imageUrl?: string;
  id: string | number;
}

const PropertyCard = ({
  name = "Skyline Apartments",
  address = "Downtown, Dubai",
  status = "Occupied",
  price = "2,500",
  tenantName = "No current tenant",
  paymentStatus = "Pending",
  beds = 3,
  baths = 2,
  sqft = "1,200",
  imageUrl = "/rentblue.jpg",
  id
}: PropertyCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const propertyData = { id, name, address, status, price, beds, baths, sqft, tenantName };

  return (
    <>
      <div className="prop-card-container" onClick={() => setIsModalOpen(true)}>
        <div className="prop-card-media">
          <img src={imageUrl || "/rentblue.jpg"} alt={name} className="prop-main-img" />
          
          <div className="prop-floating-badges">
            <div className={`status-pill ${status.toLowerCase()}`}>
              <span className="pulse-indicator"></span>
              {status}
            </div>
            <button className="prop-options-btn" onClick={(e) => e.stopPropagation()}>
              <FiMoreHorizontal />
            </button>
          </div>

          <div className="prop-media-overlay">
            <div className="manage-glass-pill">
              <span>Property Analytics</span>
              <FiArrowUpRight />
            </div>
          </div>
        </div>

        <div className="prop-card-content">
          <div className="prop-header">
            <h3 className="prop-title">{name}</h3>
            <p className="prop-location">
              <FiMapPin size={12} /> {address}
            </p>
          </div>

          {/* New Section: Tenant Snapshot */}
          <div className="tenant-snapshot">
            <div className="tenant-info">
              <div className="tenant-avatar">{tenantName.charAt(0)}</div>
              <div className="tenant-details">
                <span className="label">Current Tenant</span>
                <span className="name">{tenantName || 'No current tenant'}</span>
              </div>
            </div>
            <div className={`payment-status ${paymentStatus.toLowerCase()}`}>
               {paymentStatus === "Paid" ? <FiCheckCircle size={14}/> : <FiClock size={14}/>}
               {paymentStatus}
            </div>
          </div>

          <div className="prop-specs-minimal">
            <div className="spec-unit"><b>{beds}</b><span>Beds</span></div>
            <div className="spec-divider"></div>
            <div className="spec-unit"><b>{baths}</b><span>Baths</span></div>
            <div className="spec-divider"></div>
            <div className="spec-unit"><b>{sqft}</b><span>sqft</span></div>
          </div>

          <div className="prop-footer">
            <div className="price-stack">
              <span className="price-label">Net Monthly Income</span>
              <div className="price-display">
                <span className="price-amt">${price}</span>
                <span className="price-period">/mo</span>
              </div>
            </div>
            <div className="prop-action-icon">
                <FiMaximize />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ManagePropertyModal 
          property={propertyData} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default PropertyCard;