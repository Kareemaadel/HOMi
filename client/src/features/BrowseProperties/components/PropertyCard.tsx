// client\src\features\BrowseProperties\components\PropertyCard.tsx
import React from 'react';
import { 
    FaBed, 
    FaBath, 
    FaRulerCombined, 
    FaHeart, 
    FaMapMarkerAlt, 
    FaStar, 
    FaChevronRight 
} from 'react-icons/fa';
import './PropertyCard.css';

interface PropertyCardProps {
    property: {
        id: number;
        title: string;
        address: string;
        price: number;
        beds: number;
        baths: number;
        sqft: number;
        image: string;
        tags: string[];
        rating: number;
    };
    onOpenDetails: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onOpenDetails }) => {
    return (
        <div className="tenant-card-premium" onClick={onOpenDetails}>
            {/* Top Media Section */}
            <div className="card-media">
                <img src={property.image} alt={property.title} loading="lazy" />
                
                {/* Visual Overlays */}
                <div className="card-overlay-gradient" />

                <div className="card-badges">
                    {property.tags.map((tag, index) => (
                        <span key={index} className="badge-luxury">{tag}</span>
                    ))}
                </div>

                <button 
                    className="wishlist-btn" 
                    aria-label="Add to favorites"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Added to favorites");
                    }}
                >
                    <FaHeart />
                </button>

                <div className="floating-price">
                    <div className="price-container">
                        <span className="currency">$</span>
                        <span className="amount">{property.price.toLocaleString()}</span>
                        <span className="term">/mo</span>
                    </div>
                </div>

                <div className="rating-tag">
                    <FaStar className="star-icon" /> 
                    <span>{property.rating}</span>
                </div>
            </div>

            {/* Bottom Content Section */}
            <div className="card-body">
                <div className="location-row">
                    <div className="loc-icon-bg">
                        <FaMapMarkerAlt />
                    </div>
                    <span>{property.address}</span>
                </div>
                
                <h3 className="card-title">{property.title}</h3>
                
                <div className="specs-grid">
                    <div className="spec-pill">
                        <div className="pill-icon"><FaBed /></div>
                        <div className="pill-info">
                            <strong>{property.beds}</strong>
                            <span>{property.beds === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                    </div>
                    
                    <div className="spec-pill">
                        <div className="pill-icon"><FaBath /></div>
                        <div className="pill-info">
                            <strong>{property.baths}</strong>
                            <span>{property.baths === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                    </div>
                    
                    <div className="spec-pill">
                        <div className="pill-icon"><FaRulerCombined /></div>
                        <div className="pill-info">
                            <strong>{property.sqft.toLocaleString()}</strong>
                            <span>sqft</span>
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <button 
                        className="btn-details-minimal"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails();
                        }}
                    >
                        View Details
                    </button>
                    
                    <button 
                        className="btn-apply-glow" 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Applying for:", property.title);
                        }}
                    >
                        Apply Now <FaChevronRight className="arrow-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;