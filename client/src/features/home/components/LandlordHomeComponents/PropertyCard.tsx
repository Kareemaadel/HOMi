// client\src\features\home\components\LandlordHomeComponents\PropertyCard.tsx
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEllipsisV, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import ManagePropertyModal from '../../../MyProperties/components/ManagePropertyModal'; // Adjust path if necessary
import './PropertyCard.css';

const PropertyCard = ({ name, address, status, price, beds = 3, baths = 2, sqft = "1,200", id }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wrap the props into an object format the Modal expects
  const propertyData = {
    id,
    name,
    address,
    status,
    price,
    beds,
    baths,
    sqft
  };

  return (
    <>
      <div className="property-card">
        <div className="card-image-wrapper">
          <img src="/rentblue.jpg" alt={name} className="property-image" />
          <div className="image-overlay">
            <span className={`status-badge ${status}`}>
              {status}
            </span>
            <button className="options-btn" aria-label="options"><FaEllipsisV /></button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="card-header-info">
            <h3>{name}</h3>
            <p className="address"><FaMapMarkerAlt /> {address}</p>
          </div>

          <div className="property-features">
            <span><FaBed /> {beds} Beds</span>
            <span><FaBath /> {baths} Baths</span>
            <span><FaRulerCombined /> {sqft} sqft</span>
          </div>
          
          <div className="card-footer">
            <div className="price-container">
              <span className="price-label">Monthly Rent</span>
              <span className="price">{price}<span className="unit">/mo</span></span>
            </div>
            {/* TRIGGER MODAL HERE */}
            <button 
              className="view-btn" 
              onClick={() => setIsModalOpen(true)}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* RENDER MODAL */}
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