// client/src/features/BrowseProperties/components/PropertyDetailModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaTimes, 
    FaHeart, FaShareAlt, FaCheckCircle, FaCalendarAlt, 
    FaArrowRight, FaComment, FaSmokingBan, 
    FaPaw, FaVolumeMute, FaInfoCircle, FaWrench,
    FaShieldAlt, FaChair, FaUsers, FaRegCompass,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import ApplicationModal from './ApplicationModal';
import './PropertyDetailedModal.css';

const PropertyDetailModal = ({ property, onClose, isGuest = false }: any) => {
    const navigate = useNavigate();
    const [showApplication, setShowApplication] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    
    // Dynamic/Fallback Images
    const images = property.allImages || [
        property.image, 
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800"
    ];

    const houseRules = [
        { icon: <FaSmokingBan />, text: "No Smoking", active: true },
        { icon: <FaPaw />, text: "Pet Friendly", active: property.petsAllowed ?? false },
        { icon: <FaVolumeMute />, text: "Quiet Hours (10PM)", active: true },
        { icon: <FaUsers />, text: property.targetTenant || 'Any Tenant', active: true },
    ];

    // Fallback data if property object doesn't have maintenance defined yet
    const maintenance = property.maintenance || {
        structural: 'Landlord', appliances: 'Tenant', utilities: 'Tenant',
        plumbing: 'Landlord', electrical: 'Landlord', hvac: 'Landlord',
        pest: 'Tenant', exterior: 'Landlord', common: 'Landlord', security: 'Landlord'
    };

    const maintenanceDisplayNames: Record<string, string> = {
        structural: 'Structural Repairs', appliances: 'Interior Appliances', 
        utilities: 'Utility Bills', plumbing: 'Plumbing', 
        electrical: 'Electrical', hvac: 'HVAC / Air', 
        pest: 'Pest Control', exterior: 'Exterior Maintenance', 
        common: 'Common Areas', security: 'Security Systems'
    };

    const nextImg = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
    const prevImg = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);

    const handleApplyClick = () => {
        if (isGuest) {
            onClose();
            navigate('/auth', { state: { message: 'Please log in or register to apply for this property.' } });
        } else {
            setShowApplication(true);
        }
    };

    if (showApplication) {
        return <ApplicationModal property={property} onClose={onClose} onBack={() => setShowApplication(false)} />;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* LIGHTBOX GALLERY VIEW */}
            {showGallery && (
                <div className="lightbox-overlay" onClick={() => setShowGallery(false)}>
                    <button className="lightbox-close"><FaTimes /></button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="nav-arrow left" onClick={prevImg}><FaChevronLeft /></button>
                        <img src={images[currentImgIdx]} alt="Gallery View" className="lightbox-img" />
                        <button className="nav-arrow right" onClick={nextImg}><FaChevronRight /></button>
                        <div className="img-counter">{currentImgIdx + 1} / {images.length}</div>
                    </div>
                </div>
            )}

            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <nav className="modal-nav">
                    <div className="nav-id-section">
                        <span className="id-badge">REF: {property.id?.toString().slice(-6).toUpperCase() || 'LXP-992'}</span>
                        <div className="status-pill"><span className="pulse-dot"></span> Active Listing</div>
                    </div>
                    <div className="nav-controls">
                        <button className="icon-action-btn"><FaHeart /></button>
                        <button className="icon-action-btn"><FaShareAlt /></button>
                        <div className="nav-separator"></div>
                        <button className="close-trigger" onClick={onClose}><FaTimes /></button>
                    </div>
                </nav>

                <div className="modal-layout-grid">
                    <div className="main-scroll-area">
                        {/* GALLERY TRIGGER */}
                        <section className="property-gallery-grid" onClick={() => setShowGallery(true)}>
                            <div className="hero-image-wrapper">
                                <img src={images[0]} alt="Property Main" />
                            </div>
                            <div className="secondary-images">
                                <img src={images[1]} alt="Interior" />
                                <div className="image-stack-footer">
                                    <img src={images[2]} alt="Interior" />
                                    <div className="more-overlay">
                                        <span>+ {images.length - 3} photos</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="content-inner">
                            <div className="availability-highlight-bar">
                                <FaCalendarAlt className="calendar-pulse" />
                                <div className="availability-text">
                                    <span className="label">Earliest Move-in Date</span>
                                    <span className="date-value">{property.availableDate || 'August 15th, 2024'}</span>
                                </div>
                                <span className="urgency-tag">High Demand</span>
                            </div>

                            <header className="content-header">
                                <h1 className="property-h1">{property.title}</h1>
                                <div className="location-link">
                                    <FaMapMarkerAlt /> {property.address}
                                    <button className="inline-map-btn">View on Map</button>
                                </div>
                            </header>

                            <div className="specs-strip">
                                <div className="spec-node"><FaBed /><div><span className="spec-val">{property.beds}</span><span className="spec-lab">Bedrooms</span></div></div>
                                <div className="spec-node"><FaBath /><div><span className="spec-val">{property.baths}</span><span className="spec-lab">Bathrooms</span></div></div>
                                <div className="spec-node"><FaRulerCombined /><div><span className="spec-val">{property.sqft}</span><span className="spec-lab">Sq. Feet</span></div></div>
                                <div className="spec-node"><FaChair /><div><span className="spec-val">{property.furnishing || 'Unfurnished'}</span><span className="spec-lab">Interior</span></div></div>
                            </div>

                            <hr className="divider" />

                            <section className="description-box">
                                <h3 className="section-h3"><FaInfoCircle /> Property Overview</h3>
                                <p className="description-p">
                                    This sophisticated {property.title} defines modern urban living. 
                                    Every detail has been curated for comfort and style, from the 
                                    floor-to-ceiling soundproof windows to the custom-integrated 
                                    smart home systems. 
                                </p>
                            </section>

                            <section className="rules-box">
                                <h3 className="section-h3">Lease Preferences</h3>
                                <div className="rules-flex">
                                    {houseRules.map((rule, idx) => (
                                        <div key={idx} className={`rule-card ${!rule.active ? 'off' : ''}`}>
                                            {rule.icon} <span>{rule.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* MAINTENANCE RESPONSIBILITIES (VIEW ONLY & SCROLLABLE) */}
                            <section className="maintenance-box">
                                <h3 className="section-h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', marginBottom: '16px' }}>
                                    <FaWrench style={{ color: '#64748b'}} /> Maintenance Responsibilities
                                </h3>
                                <div className="responsibility-box scrollable">
                                    {Object.entries(maintenance).map(([key, value]) => (
                                        <div className="resp-row" key={key}>
                                            <span>{maintenanceDisplayNames[key]}</span>
                                            {/* Adds the 'landlord' or 'tenant' class dynamically based on the value */}
                                            <span className={`owner-badge ${String(value).toLowerCase()}`}>
                                                {String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>
                    </div>

                    <aside className="action-sidebar">
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <div className="main-price">
                                    <span className="currency">$</span>
                                    <span className="amount">{property.price?.toLocaleString()}</span>
                                    <span className="freq">/mo</span>
                                </div>
                                <div className="deposit-info">
                                    <FaShieldAlt /> ${property.securityDeposit?.toLocaleString()} Deposit
                                </div>
                            </div>

                            <button className="primary-cta-btn" onClick={handleApplyClick}>
                                {isGuest ? 'Register to Apply' : 'Start Application'} <FaArrowRight />
                            </button>
                            <p className="cta-subtext">Verified secure application process</p>

                            <div className="sidebar-divider"></div>

                            <div className="owner-profile">
                                <div className="avatar-wrapper">
                                    <img src="https://i.pravatar.cc/150?u=sarah" alt="Agent" />
                                    <span className="online-indicator"></span>
                                </div>
                                <div className="owner-details">
                                    <span className="name">Sarah Jenkins</span>
                                    <span className="role">Verified Owner • 4.9★</span>
                                </div>
                                <button className="chat-btn" onClick={() => {
                                    if (isGuest) {
                                        onClose();
                                        navigate('/auth', { state: { message: 'Please log in to chat with the owner.' } });
                                    }
                                }}><FaComment /></button>
                            </div>

                            <div className="secondary-actions">
                                <button className="sec-btn"><FaCalendarAlt /> Book Viewing</button>
                                <button className="sec-btn"><FaRegCompass /> Neighborhood Guide</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailModal;