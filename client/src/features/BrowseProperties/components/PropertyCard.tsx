// client\src\features\BrowseProperties\components\PropertyCard.tsx
import React, { useState } from 'react';
import { 
    FaHeart, 
    FaMapMarkerAlt, 
    FaStar, 
    FaChevronRight 
} from 'react-icons/fa';
import './PropertyCard.css';

interface PropertyCardProps {
    property: {
        id: string | number;
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
    // Local state to handle the heart toggle
    const [isSaved, setIsSaved] = useState(false);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the card's onClick from firing
        setIsSaved(!isSaved);
        console.log(isSaved ? "Removed from favorites" : "Added to favorites");
    };

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
                    className={`wishlist-btn ${isSaved ? 'active' : ''}`} 
                    aria-label="Add to favorites"
                    onClick={handleWishlistToggle}
                >
                    <FaHeart />
                </button>

                <div className="rating-tag">
                    <FaStar className="star-icon" /> 
                    <span>{property.rating}</span>
                </div>
            </div>

            {/* Bottom Content Section */}
            <div className="card-body">
                {/* Simplified Inline Price Presentation */}
                <div className="simple-price-tag">
                    <span className="currency">$</span>
                    <span className="amount">{property.price.toLocaleString()}</span>
                    <span className="term">/ month</span>
                </div>

                <div className="location-row">
                    <div className="loc-icon-bg">
                        <FaMapMarkerAlt />
                    </div>
                    <span>{property.address}</span>
                </div>
                
                <h3 className="card-title">{property.title}</h3>
                


                <div className="card-actions">
                    <button 
                        className="btn-details-minimal"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(); // Opens the modal
                        }}
                    >
                        View Details
                    </button>
                    
                    <button 
                        className="btn-apply-glow" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(); // <--- This ensures the modal opens here too!
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