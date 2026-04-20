// client/src/features/BrowseProperties/components/PropertyDetailModal.tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

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
import { messageService } from '../../../services/message.service';
import { propertyService, type ReportListingPayload } from '../../../services/property.service';
import './PropertyDetailedModal.css';

const PropertyDetailModal = ({ property, onClose, isGuest = false, isSentRequestView = false, onCancelRequest }: any) => {
    const navigate = useNavigate();
    const [showApplication, setShowApplication] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState<ReportListingPayload['reason']>('MISLEADING_INFORMATION');
    const [reportDetails, setReportDetails] = useState('');
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportSuccess, setReportSuccess] = useState<string | null>(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    
    // Cancel Request States
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [showCancelSuccess, setShowCancelSuccess] = useState(false);
    const canCancelSentRequest = property?.rentalRequest?.status === 'PENDING';
    
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

    const [cancelError, setCancelError] = useState<string | null>(null);

    const handleCancelYes = async () => {
        const requestId = property?.rentalRequest?.id;
        if (!requestId || !onCancelRequest) {
            setCancelError('Could not find this request to cancel.');
            return;
        }

        setCancelError(null);
        try {
            await onCancelRequest(requestId);
            setShowCancelPrompt(false);
            setShowCancelSuccess(true);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Could not cancel this request right now. Please try again.';
            setCancelError(message);
        }
    };

    const handleMessageOwner = async () => {
        if (isGuest) {
            setShowAuthModal(true);
            return;
        }

        const participantId = property?.ownerId;
        if (!participantId) {
            navigate('/messages');
            onClose();
            return;
        }

        setIsStartingChat(true);
        try {
            const response = await messageService.startConversation({
                participantId,
                propertyId: property?.id,
            });

            navigate('/messages', {
                state: {
                    conversationId: response.data.id,
                    participantId,
                    propertyId: property?.id,
                },
            });
            onClose();
        } catch (error) {
            console.error('Failed to start conversation from property detail:', error);
            navigate('/messages', {
                state: {
                    participantId,
                    propertyId: property?.id,
                },
            });
            onClose();
        } finally {
            setIsStartingChat(false);
        }
    };

    const handleOpenReport = () => {
        if (isGuest) {
            setShowAuthModal(true);
            return;
        }
        setShowReportModal(true);
        setReportError(null);
        setReportSuccess(null);
    };

    const handleSubmitReport = async () => {
        const details = reportDetails.trim();
        if (details.length < 30) {
            setReportError('Please include at least 30 characters so our moderation team has enough context.');
            return;
        }

        setIsSubmittingReport(true);
        setReportError(null);
        try {
            const response = await propertyService.reportProperty(property.id, {
                reason: reportReason,
                details,
            });
            setReportSuccess(response.message || 'Report submitted successfully.');
            setReportDetails('');
        } catch (error: any) {
            setReportError(error?.response?.data?.message || 'Unable to submit report right now. Please try again.');
        } finally {
            setIsSubmittingReport(false);
        }
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
                                    <button
                                        className="primary-cta-btn"
                                        style={{ backgroundColor: canCancelSentRequest ? '#22c55e' : '#64748b', cursor: 'default' }}
                                        disabled
                                    >
                                        <FaCheckCircle /> {canCancelSentRequest ? 'Request Sent' : 'Request Processed'}
                                    </button>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="sec-btn" 
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                                            onClick={() => setShowApplication(true)}
                                        >
                                            Review Application
                                        </button>
                                        {canCancelSentRequest && (
                                            <button 
                                                className="sec-btn" 
                                                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                                                onClick={() => setShowCancelPrompt(true)}
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </div>
                                    {cancelError && <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>{cancelError}</p>}
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
                                <button
                                    type="button"
                                    className="owner-profile-main"
                                    onClick={() => {
                                        if (property?.ownerId) {
                                            navigate(`/landlords/${property.ownerId}`);
                                            onClose();
                                        }
                                    }}
                                    disabled={!property?.ownerId}
                                    aria-label="View landlord profile"
                                >
                                    <div className="avatar-wrapper">
                                        <img src={property.ownerImage} alt={property.ownerName || 'Owner'} />
                                        <span className="online-indicator"></span>
                                    </div>
                                    <div className="owner-details">
                                        <span className="name">{property.ownerName || 'Owner'}</span>
                                        <span className="role">
                                            {property.ownerVerified ? (
                                                <span className="owner-verified-inline">
                                                    <FaCheckCircle aria-hidden /> Verified on HOMi
                                                </span>
                                            ) : (
                                                'Property owner'
                                            )}
                                        </span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="chat-btn"
                                    onClick={handleMessageOwner}
                                    aria-label="Message owner"
                                    disabled={isStartingChat}
                                >
                                    <FaComment />
                                </button>
                            </div>

                            <div className="secondary-actions">
                                <button className="sec-btn"><FaCalendarAlt /> Book Viewing</button>
                                <button className="sec-btn" onClick={handleOpenReport}><FaRegCompass /> Report Listing</button>
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

            {showReportModal && (
                <div className="mini-modal-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowReportModal(false)}>
                    <div className="mini-modal" style={{ background: 'white', padding: '22px', borderRadius: '12px', width: 'min(540px, 94vw)' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.1rem' }}>Report Listing</h3>
                        <p style={{ margin: '0 0 14px', color: '#475569', fontSize: '0.9rem' }}>
                            Help us keep HOMi safe. Reports are reviewed by admins and can lead to listing removal.
                        </p>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Reason</label>
                            <select value={reportReason} onChange={(e) => setReportReason(e.target.value as ReportListingPayload['reason'])} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontWeight: 600 }}>
                                <option value="MISLEADING_INFORMATION">Misleading information</option>
                                <option value="SCAM_OR_FRAUD">Scam or fraud</option>
                                <option value="FAKE_PHOTOS">Fake photos</option>
                                <option value="DUPLICATE_LISTING">Duplicate listing</option>
                                <option value="UNAVAILABLE_OR_ALREADY_RENTED">Unavailable or already rented</option>
                                <option value="OFFENSIVE_CONTENT">Offensive content</option>
                                <option value="OTHER">Other</option>
                            </select>

                            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Tell us what happened</label>
                            <textarea
                                value={reportDetails}
                                onChange={(e) => setReportDetails(e.target.value)}
                                rows={5}
                                placeholder="Example: The listing says 2 bedrooms but photos and description show a studio. The owner also asked for payment outside HOMi before any viewing."
                                style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', resize: 'vertical' }}
                            />
                            <p style={{ margin: 0, textAlign: 'right', fontSize: '0.78rem', color: reportDetails.trim().length < 30 ? '#ef4444' : '#64748b' }}>
                                {reportDetails.trim().length}/30 minimum
                            </p>
                        </div>

                        {reportError && <p style={{ margin: '10px 0 0', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>{reportError}</p>}
                        {reportSuccess && <p style={{ margin: '10px 0 0', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>{reportSuccess}</p>}

                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowReportModal(false)} style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleSubmitReport} disabled={isSubmittingReport} style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, opacity: isSubmittingReport ? 0.7 : 1 }}>
                                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalMarkup, document.body);
};

export default PropertyDetailModal;