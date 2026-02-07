import React from 'react';
import { FaBed, FaBath, FaRulerCombined, FaStar, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import './PropertyCard.css';

const PropertyCard = ({ property }: any) => {
    return (
        <div className="tenant-card-premium">
            <div className="card-media">
                <img src={property.image} alt={property.title} loading="lazy" />
                <div className="card-badges">
                    <span className="badge-luxury">Premium</span>
                </div>
                <button className="wishlist-btn"><FaHeart /></button>
                <div className="floating-price">
                    <span className="currency">$</span>
                    <span className="amount">{property.price.toLocaleString()}</span>
                    <span className="term">/mo</span>
                </div>
            </div>

            <div className="card-body">
                <div className="location-row">
                    <FaMapMarkerAlt /> {property.address}
                </div>
                <h3 className="card-title">{property.title}</h3>
                
                <div className="specs-grid">
                    <div className="spec-pill"><FaBed /> {property.beds} <span>Beds</span></div>
                    <div className="spec-pill"><FaBath /> {property.baths} <span>Baths</span></div>
                    <div className="spec-pill"><FaRulerCombined /> {property.sqft} <span>sqft</span></div>
                </div>

                <div className="card-actions">
                    <button className="btn-secondary">Details</button>
                    <button className="btn-primary">Apply Now</button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;