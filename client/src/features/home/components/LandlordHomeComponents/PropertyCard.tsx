import React from 'react';
import { FaMapMarkerAlt, FaEllipsisV, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import './PropertyCard.css';

const PropertyCard = ({ name, address, status, price, beds = 3, baths = 2, sqft = "1,200" }: any) => {
  return (
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

        {/* New Feature Tags */}
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
          <button className="view-btn">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;