// client\src\features\home\components\LandlordHomeComponents\PropertyCard.tsx
import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaEllipsisV, FaBed, FaBath, 
  FaRulerCombined, FaArrowRight, FaEye 
} from 'react-icons/fa';
import ManagePropertyModal from '../../../MyProperties/components/ManagePropertyModal';
import './PropertyCard.css';

const PropertyCard = ({ name, address, status, price, beds = 3, baths = 2, sqft = "1,200", id }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const propertyData = { id, name, address, status, price, beds, baths, sqft };

  return (
    <>
      <div className="property-card" onClick={() => setIsModalOpen(true)}>
        <div className="card-image-wrapper">
          <img src="/rentblue.jpg" alt={name} className="property-image" />
          
          <div className="image-overlay-top">
            <span className={`status-badge $`}>
              <span className="pulse-dot"></span>
              {status}
            </span>
            <button className="options-glass-btn" onClick={(e) => e.stopPropagation()}>
              <FaEllipsisV />
            </button>
          </div>

          <div className="view-overlay">
            <div className="view-circle">
              <FaEye />
              <span>Manage Unit</span>
            </div>
          </div>

          <div className="image-overlay-bottom">
             <span className="category-tag">Premium Unit</span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="card-header-info">
            <h3 className="property-title">{name}</h3>
            <p className="address-text">
              <FaMapMarkerAlt className="loc-icon" /> {address}
            </p>
          </div>

          <div className="property-spec-grid">
            <div className="spec-item">
              <FaBed />
              <div className="spec-val">
                <span className="num">{beds}</span>
                <span className="lbl">Beds</span>
              </div>
            </div>
            <div className="spec-item">
              <FaBath />
              <div className="spec-val">
                <span className="num">{baths}</span>
                <span className="lbl">Baths</span>
              </div>
            </div>
            <div className="spec-item">
              <FaRulerCombined />
              <div className="spec-val">
                <span className="num">{sqft}</span>
                <span className="lbl">sqft</span>
              </div>
            </div>
          </div>
          
          <div className="card-footer-luxury">
            <div className="rent-info">
              <span className="rent-label">Annual Revenue Est.</span>
              <div className="rent-value">
                <span className="currency">$</span>
                <span className="amount">{price}</span>
                <span className="per">/mo</span>
              </div>
            </div>
            
            <button className="manage-action-btn">
              <FaArrowRight />
            </button>
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