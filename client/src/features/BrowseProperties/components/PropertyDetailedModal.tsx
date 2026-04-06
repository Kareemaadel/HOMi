// client/src/features/BrowseProperties/components/PropertyDetailModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { 
    FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaTimes, 
    FaHeart, FaShareAlt, FaCalendarAlt, 
    FaArrowRight, FaComment, FaSmokingBan, 
    FaPaw, FaVolumeMute, FaInfoCircle, FaWrench,
    FaShieldAlt, FaChair, FaUsers, FaRegCompass,
    FaChevronLeft, FaChevronRight, FaCheckCircle
} from 'react-icons/fa';
import ApplicationModal from './ApplicationModal';
import AuthModal from '../../../components/global/AuthModal';
import './PropertyDetailedModal.css';

const PropertyDetailModal = ({ property, onClose, isGuest = false, isSentRequestView = false }: any) => {
    const [showApplication, setShowApplication] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Cancel Request States
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [showCancelSuccess, setShowCancelSuccess] = useState(false);
    
    // Use only real property images, with a single safe fallback
    const images = (property.allImages && property.allImages.length > 0)
        ? property.allImages
        : [
            property.image ||
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800",
        ];

    const houseRules = [
        { icon: <FaSmokingBan />, text: "No Smoking", active: true },
        { icon: <FaPaw />, text: "Pet Friendly", active: property.petsAllowed ?? false },
        { icon: <FaVolumeMute />, text: "Quiet Hours (10PM)", active: true },
        { icon: <FaUsers />, text: property.targetTenant || 'Any Tenant', active: true },
    ];

    const maintenanceResponsibilities = property.maintenanceResponsibilities || [];

    const nextImg = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
    const prevImg = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);

    const handleApplyClick = () => {
        if (isGuest) {
            setShowAuthModal(true);
        } else {
            setShowApplication(true);
        }
    };

    const handleCancelYes = () => {
        setShowCancelPrompt(false);
        setShowCancelSuccess(true);
    };

    if (showApplication) {
        return (
            <ApplicationModal 
                property={property} 
                onClose={onClose} 
                onBack={() => setShowApplication(false)} 
                isReadOnly={isSentRequestView}
                // Pass the pre-filled rental request data when in sent-request view
                prefillData={isSentRequestView ? property.rentalRequest : undefined}
            />
        );
    }

    const modalMarkup = (
        <div className="property-detail-overlay" onClick={onClose}>
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

            <div className="property-detail-container" onClick={e => e.stopPropagation()}>
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
                        <section className={`property-gallery-grid ${images.length === 1 ? 'single-image' : ''}`} onClick={() => setShowGallery(true)}>
                            <div className="hero-image-wrapper">
                                <img src={images[0]} alt="Property Main" />
                            </div>
                            {images.length > 1 && (
                                <div className="secondary-images">
                                    <img src={images[1]} alt="Interior" />
                                    <div className="image-stack-footer">
                                        {images[2] ? (
                                            <img src={images[2]} alt="Interior" />
                                        ) : (
                                            <img src={images[0]} alt="Interior" />
                                        )}
                                        {images.length > 3 && (
                                            <div className="more-overlay">
                                                <span>+ {images.length - 3} photos</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    {property.description?.trim() || `No description has been provided for ${property.title}.`}
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

                            <section className="maintenance-box">
                                <h3 className="section-h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', marginBottom: '16px' }}>
                                    <FaWrench style={{ color: '#64748b'}} /> Maintenance Responsibilities
                                </h3>
                                <div className="responsibility-box scrollable">
                                    {maintenanceResponsibilities.length > 0 ? (
                                        maintenanceResponsibilities.map((item: any, index: number) => (
                                            <div className="resp-row" key={`${item.area}-${index}`}>
                                                <span>{item.area}</span>
                                                <span className={`owner-badge ${(item.responsible_party || '').toLowerCase()}`}>
                                                    {item.responsible_party === 'LANDLORD' ? 'Landlord' : 'Tenant'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="resp-row">
                                            <span>No maintenance responsibilities configured for this property.</span>
                                            <span className="owner-badge tenant">N/A</span>
                                        </div>
                                    )}
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

                            {/* CONDITIONAL ACTION BUTTONS */}
                            {isSentRequestView ? (
                                <div className="sent-request-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button className="primary-cta-btn" style={{ backgroundColor: '#22c55e', cursor: 'default' }} disabled>
                                        <FaCheckCircle /> Request Sent
                                    </button>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="sec-btn" 
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                                            onClick={() => setShowApplication(true)}
                                        >
                                            Review Application
                                        </button>
                                        <button 
                                            className="sec-btn" 
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                                            onClick={() => setShowCancelPrompt(true)}
                                        >
                                            Cancel Request
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button className="primary-cta-btn" onClick={handleApplyClick}>
                                        {isGuest ? 'Register to Apply' : 'Start Application'} <FaArrowRight />
                                    </button>
                                    <p className="cta-subtext">Verified secure application process</p>
                                </>
                            )}

                            <div className="sidebar-divider"></div>

                            <div className="owner-profile">
                                <div className="avatar-wrapper">
                                    <img src={property.ownerImage} alt={property.ownerName || 'Owner'} />
                                    <span className="online-indicator"></span>
                                </div>
                                <div className="owner-details">
                                    <span className="name">{property.ownerName || 'Owner'}</span>
                                    <span className="role">Verified Owner • 4.9★</span>
                                </div>
                                <button className="chat-btn" onClick={() => {
                                    if (isGuest) setShowAuthModal(true);
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

            {/* Auth Modal for Guests */}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

            {/* Cancel Confirmation Prompt */}
            {showCancelPrompt && (
                <div className="mini-modal-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                    <div className="mini-modal" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '300px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>Cancel rental request for "{property.title}"?</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={handleCancelYes} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Yes</button>
                            <button onClick={() => setShowCancelPrompt(false)} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Success Message */}
            {showCancelSuccess && (
                <div className="mini-modal-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                    <div className="mini-modal" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '300px', textAlign: 'center' }}>
                        <FaCheckCircle style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '10px' }} />
                        <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>Request cancelled successfully.</p>
                        <button onClick={onClose} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Back to Properties</button>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalMarkup, document.body);
};

export default PropertyDetailModal;