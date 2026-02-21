// client\src\features\BrowseProperties\components\PropertyDetailModal.tsx
import React, { useState } from 'react';
import { 
    FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaTimes, 
    FaHeart, FaShareAlt, FaCheckCircle, FaCalendarAlt, 
    FaArrowRight, FaComment, FaSmokingBan, 
    FaPaw, FaVolumeMute, FaUsersSlash, FaInfoCircle,
    FaShieldAlt, FaChair, FaUsers
} from 'react-icons/fa';
import ApplicationModal from './ApplicationModal';
import './PropertyDetailedModal.css';

const PropertyDetailModal = ({ property, onClose }: any) => {
    const [showApplication, setShowApplication] = useState(false);
    
    // Fallback images array
    const images = [property.image, property.image, property.image, property.image, property.image];

    // House Rules & Context
    const houseRules = [
        { icon: <FaSmokingBan />, text: "No Smoking", active: true },
        { icon: <FaPaw />, text: "Pet Friendly", active: property.petsAllowed ?? false },
        { icon: <FaVolumeMute />, text: "Quiet Hours (10PM - 8AM)", active: true },
        { icon: <FaUsersSlash />, text: "No Large Parties", active: true },
        // NEW: Target Tenant
        { icon: <FaUsers />, text: `Preferred: ${property.targetTenant || 'Any'}`, active: true },
    ];

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
                            <div className="header-top-row">
                                <span className="type-tag">Apartment • For Rent</span>
                                <span className="verified-badge"><FaCheckCircle /> Verified Listing</span>
                            </div>
                            <h1 className="detail-title">{property.title}</h1>
                            <div className="detail-location">
                                <FaMapMarkerAlt /> <span>{property.address}</span>
                            </div>
                            <div className="price-container">
                                <span className="detail-price">${property.price.toLocaleString()}</span>
                                <span className="term">/ month</span>
                            </div>
                        </div>

                        {/* NEW QUICK SPECS (Updated with Deposit and Furnishing) */}
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
                            {/* Security Deposit */}
                            <div className="spec-item highlight">
                                <FaShieldAlt />
                                <span>${property.securityDeposit?.toLocaleString() || 'N/A'} Deposit</span>
                            </div>
                            {/* Furnishing */}
                            <div className="spec-item highlight">
                                <FaChair />
                                <span>{property.furnishing || 'Unfurnished'}</span>
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="detail-section">
                            <div className="section-title-wrap">
                                <FaInfoCircle /> <h3>About this home</h3>
                            </div>
                            <p className="description-text">
                                This stunning {property.title} offers an unparalleled living experience. 
                                Featuring floor-to-ceiling windows, a gourmet designer kitchen, 
                                and premium finishes throughout. Located in a prime district with easy 
                                access to all city essentials.
                            </p>
                        </div>

                        {/* HOUSE RULES SECTION */}
                        <div className="detail-section rules-section">
                            <h3>House Rules & Preferences</h3>
                            <div className="rules-grid">
                                {houseRules.map((rule, idx) => (
                                    <div key={idx} className={`rule-item ${!rule.active ? 'disabled' : ''}`}>
                                        <span className="rule-icon">{rule.icon}</span>
                                        <span className="rule-text">{rule.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AMENITIES */}
                        <div className="detail-section">
                            <h3>Premium Amenities</h3>
                            <div className="amenities-grid">
                                <div className="amenity"><FaCheckCircle /> Smart Home System</div>
                                <div className="amenity"><FaCheckCircle /> 24/7 Concierge</div>
                                <div className="amenity"><FaCheckCircle /> Fitness Center</div>
                                <div className="amenity"><FaCheckCircle /> Secure Parking</div>
                            </div>
                        </div>

                        {/* LANDLORD CARD */}
                        <div className="agent-card">
                            <div className="agent-info">
                                <img src="https://i.pravatar.cc/150?u=agent1" alt="Landlord" />
                                <div>
                                    <p className="agent-name">Sarah Jenkins</p>
                                    <p className="agent-label">Property Owner • Active 2h ago</p>
                                </div>
                            </div>
                            <div className="agent-actions">
                                <button className="btn-whatsapp"><FaComment /> Message Owner</button>
                                <button className="btn-contact-alt">View Profile</button>
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
                            <button className="footer-btn icon-only"><FaHeart /></button>
                            <button className="footer-btn icon-only"><FaShareAlt /></button>
                            <button className="footer-btn icon-only"><FaCalendarAlt /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailModal;