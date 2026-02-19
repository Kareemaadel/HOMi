// client\src\features\BrowseProperties\components\PropertyDetailModal.tsx
import React, { useState } from 'react';
import { 
    FaBed, 
    FaBath, 
    FaRulerCombined, 
    FaMapMarkerAlt, 
    FaTimes, 
    FaHeart, 
    FaShareAlt, 
    FaCheckCircle, 
    FaCalendarAlt, 
    FaLayerGroup, 
    FaArrowRight, 
    FaComment 
} from 'react-icons/fa';
import ApplicationModal from './ApplicationModal';
import './PropertyDetailedModal.css';

const PropertyDetailModal = ({ property, onClose }: any) => {
    const [showApplication, setShowApplication] = useState(false);
    
    // Fallback images array
    const images = [property.image, property.image, property.image, property.image, property.image];

    /**
     * If showApplication is true, we switch the view.
     * We pass onBack to allow the ApplicationModal to return here.
     * We pass onClose to allow the ApplicationModal to close the entire modal stack.
     */
    if (showApplication) {
        return (
            <ApplicationModal 
                property={property} 
                onClose={onClose} 
                onBack={() => setShowApplication(false)} 
            />
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose} aria-label="Close modal">
                    <FaTimes size={20} />
                </button>
                
                <div className="modal-content">
                    {/* GALLERY SECTION */}
                    <div className="modal-gallery">
                        <div className="main-img">
                            <img src={images[0]} alt="Property Interior" />
                        </div>
                        {images.slice(1).map((img, i) => (
                            <img key={i} src={img} className="thumb-img" alt="Interior view" />
                        ))}
                    </div>

                    {/* DETAILS SECTION */}
                    <div className="modal-details">
                        <div className="detail-header">
                            <span className="type-tag">Apartment • For Rent</span>
                            <h1 className="detail-title">{property.title}</h1>
                            <div className="detail-location">
                                <FaMapMarkerAlt /> <span>{property.address}</span>
                            </div>
                            <div className="price-container">
                                <span className="detail-price">${property.price.toLocaleString()}</span>
                                <span className="term">/ month</span>
                            </div>
                        </div>

                        {/* QUICK SPECS */}
                        <div className="detail-specs">
                            <div className="spec-item">
                                <FaBed />
                                <span>{property.beds} Beds</span>
                            </div>
                            <div className="spec-item">
                                <FaBath />
                                <span>{property.baths} Baths</span>
                            </div>
                            <div className="spec-item">
                                <FaRulerCombined />
                                <span>{property.sqft} sqft</span>
                            </div>
                            <div className="spec-item">
                                <FaLayerGroup />
                                <span>3rd Floor</span>
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="detail-section">
                            <h3>About this home</h3>
                            <p className="description-text">
                                This stunning {property.title} offers an unparalleled living experience. 
                                Featuring floor-to-ceiling windows and a gourmet designer kitchen.
                            </p>
                        </div>

                        {/* AMENITIES */}
                        <div className="detail-section">
                            <h3>Premium Amenities</h3>
                            <div className="amenities-grid">
                                <div className="amenity"><FaCheckCircle /> Smart Home System</div>
                                <div className="amenity"><FaCheckCircle /> 24/7 Concierge</div>
                                <div className="amenity"><FaCheckCircle /> Fitness Center</div>
                                <div className="amenity"><FaCheckCircle /> Pet Friendly</div>
                            </div>
                        </div>

                        {/* LANDLORD / AGENT CARD */}
                        <div className="agent-card">
                            <div className="agent-info">
                                <img src="https://i.pravatar.cc/150?u=agent1" alt="Sarah Jenkins" />
                                <div>
                                    <p className="agent-name">Sarah Jenkins</p>
                                    <p className="agent-label">Luxury Property Specialist</p>
                                </div>
                            </div>
                            <div className="agent-actions">
                                <button className="btn-whatsapp"><FaComment /> Message Owner</button>
                                <button className="btn-contact-alt">Email Agent</button>
                            </div>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="modal-footer-actions">
                            <button 
                                className="footer-btn primary" 
                                onClick={() => setShowApplication(true)}
                            >
                                <FaArrowRight/> Apply Now
                            </button>
                            <button className="footer-btn secondary"><FaHeart /> Save</button>
                            <button className="footer-btn secondary"><FaShareAlt /></button>
                            <button className="footer-btn secondary"><FaCalendarAlt /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailModal;