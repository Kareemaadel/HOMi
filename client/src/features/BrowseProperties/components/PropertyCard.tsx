// client\src\features\BrowseProperties\components\PropertyCard.tsx
import React from 'react';
import { FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
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
            <div className="card-media">
                <img src={property.image} alt={property.title} loading="lazy" />
                
                <div className="card-badges">
                    {property.tags.map((tag, index) => (
                        <span key={index} className="badge-luxury">{tag}</span>
                    ))}
                </div>

                <button 
                    className="wishlist-btn" 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevents opening modal when liking
                        console.log("Added to favorites");
                    }}
                >
                    <FaHeart />
                </button>

                <div className="floating-price">
                    <span className="currency">$</span>
                    <span className="amount">{property.price.toLocaleString()}</span>
                    <span className="term">/mo</span>
                </div>

                <div className="rating-tag">
                    <FaStar /> {property.rating}
                </div>
            </div>

            <div className="card-body">
                <div className="location-row">
                    <FaMapMarkerAlt /> {property.address}
                </div>
                
                <h3 className="card-title">{property.title}</h3>
                
                <div className="specs-grid">
                    <div className="spec-pill">
                        <FaBed /> 
                        <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
                    </div>
                    <div className="spec-pill">
                        <FaBath /> 
                        <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
                    </div>
                    <div className="spec-pill">
                        <FaRulerCombined /> 
                        <span>{property.sqft} sqft</span>
                    </div>
                </div>

                <div className="card-actions">
                    <button 
                        className="btn-secondary" 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onOpenDetails();
                        }}
                    >
                        Details
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Applying for:", property.title);
                        }}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;