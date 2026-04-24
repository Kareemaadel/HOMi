import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaStar, FaMapMarkerAlt, FaToolbox, FaCheckCircle, 
    FaCalendarAlt, FaQuoteLeft, FaHammer, FaClock, FaCheck,
    FaArrowLeft, FaPaperPlane
} from 'react-icons/fa';
import './ProviderProfile.css';

interface ProviderProfileProps {
    isOpen: boolean;
    onClose: () => void;
    provider: {
        id: string;
        name: string;
        specialty: string;
        rating: number;
        reviewCount: number;
        location: string;
        priceRange: string;
        imageUrl: string;
        isVerified?: boolean;
        completedJobs: number;
    } | null;
    myIssues: any[];
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ isOpen, onClose, provider, myIssues }) => {
    const [step, setStep] = useState<'profile' | 'select-issue' | 'success'>('profile');
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('profile');
            setSelectedIssueId(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen || !provider) return null;

    const handleRequestFix = () => {
        setStep('select-issue');
    };

    const handleSendRequest = () => {
        if (!selectedIssueId) return;
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setStep('success');
        }, 1500);
    };

    const renderProfile = () => (
        <div className="profile-scroll-container">
            <div className="profile-hero">
                <div className="profile-hero-overlay"></div>
                <img src={provider.imageUrl} alt={provider.name} className="profile-cover-img" />
                <button className="close-profile-btn" onClick={onClose}><FaTimes /></button>
            </div>

            <div className="profile-content-main">
                <div className="profile-header-section">
                    <div className="profile-avatar-wrapper">
                        <img src={provider.imageUrl} alt={provider.name} className="profile-avatar-img" />
                        {provider.isVerified && <FaCheckCircle className="verified-icon-large" />}
                    </div>
                    <div className="profile-main-meta">
                        <h1>{provider.name}</h1>
                        <p className="specialty-text">{provider.specialty}</p>
                        <div className="rating-location-row">
                            <div className="p-rating">
                                <FaStar /> <span>{provider.rating}</span> ({provider.reviewCount} Reviews)
                            </div>
                            <div className="p-location">
                                <FaMapMarkerAlt /> {provider.location}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-grid-info">
                    <div className="info-card">
                        <span className="info-label">Experience</span>
                        <span className="info-value">8+ Years</span>
                    </div>
                    <div className="info-card">
                        <span className="info-label">Jobs Done</span>
                        <span className="info-value">{provider.completedJobs}+</span>
                    </div>
                    <div className="info-card">
                        <span className="info-label">Response Time</span>
                        <span className="info-value">&lt; 1 Hour</span>
                    </div>
                </div>

                <div className="profile-bio-section">
                    <h3>About {provider.name.split(' ')[0]}</h3>
                    <p>
                        Professional {provider.specialty.toLowerCase()} with extensive experience in residential and commercial maintenance. 
                        Dedicated to providing high-quality service and durable solutions for all your home needs. 
                        Certified by international standards and equipped with modern tools to ensure efficiency and safety.
                    </p>
                </div>

                <div className="skills-section">
                    <h3>Expertise & Skills</h3>
                    <div className="skills-tags">
                        <span>Emergency Repairs</span>
                        <span>Maintenance</span>
                        <span>Installation</span>
                        <span>Safety Inspections</span>
                        <span>Modern Equipment</span>
                    </div>
                </div>

                <div className="reviews-section">
                    <div className="reviews-header">
                        <h3>Recent Reviews</h3>
                        <button className="view-all-reviews">See All</button>
                    </div>
                    <div className="review-item-mini">
                        <div className="review-meta">
                            <FaQuoteLeft className="quote-icon" />
                            <div className="review-author">
                                <strong>Sara Kamel</strong>
                                <div className="stars-row"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                            </div>
                            <span className="review-date">2 weeks ago</span>
                        </div>
                        <p>"Excellent work! Very professional and arrived on time. Highly recommended for any complex plumbing issues."</p>
                    </div>
                </div>
            </div>

            <div className="profile-footer-sticky">
                <div className="footer-price-info">
                    <span>Starting from</span>
                    <strong>{provider.priceRange}</strong>
                </div>
                <button className="request-fix-btn" onClick={handleRequestFix}>
                    Request Fix
                </button>
            </div>
        </div>
    );

    const renderSelectIssue = () => (
        <div className="issue-selection-container animate-in">
            <header className="selection-header">
                <button className="back-btn" onClick={() => setStep('profile')}><FaArrowLeft /></button>
                <h2>Assign an Issue</h2>
                <p>Select which of your posted issues you want {provider.name.split(' ')[0]} to work on.</p>
            </header>

            <div className="selection-content">
                {myIssues.length > 0 ? (
                    <div className="issue-select-list">
                        {myIssues.map(issue => (
                            <div 
                                key={issue.id} 
                                className={`issue-select-card ${selectedIssueId === issue.id ? 'selected' : ''}`}
                                onClick={() => setSelectedIssueId(issue.id)}
                            >
                                <div className="select-checkbox">
                                    {selectedIssueId === issue.id && <FaCheck />}
                                </div>
                                <div className="issue-select-info">
                                    <div className="issue-select-top">
                                        <span className="issue-type-badge"><FaHammer /> {issue.issueType}</span>
                                        <span className="issue-date-text"><FaClock /> Posted {issue.postedDate}</span>
                                    </div>
                                    <p className="issue-desc-short">{issue.description}</p>
                                    <div className="issue-budget-tag">Budget: {issue.budget}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-selection">
                        <p>You haven't posted any issues yet.</p>
                        <button className="goto-post-btn" onClick={onClose}>Post New Issue</button>
                    </div>
                )}
            </div>

            <footer className="selection-footer">
                <button className="cancel-selection-btn" onClick={() => setStep('profile')}>Cancel</button>
                <button 
                    className="send-request-btn" 
                    disabled={!selectedIssueId || isSubmitting}
                    onClick={handleSendRequest}
                >
                    {isSubmitting ? 'Sending...' : (
                        <>
                            Send Request <FaPaperPlane />
                        </>
                    )}
                </button>
            </footer>
        </div>
    );

    const renderSuccess = () => (
        <div className="success-overlay-container animate-in">
            <div className="success-box">
                <div className="success-icon-wrapper-large">
                    <FaCheck />
                </div>
                <h2>Request Sent!</h2>
                <p>Request sent to provider, you'll be notified with response as soon as possible.</p>
                <button className="finish-btn" onClick={onClose}>Done</button>
            </div>
        </div>
    );

    return (
        <div className="provider-profile-modal-overlay" onClick={onClose}>
            <div className="provider-profile-modal-container" onClick={e => e.stopPropagation()}>
                {step === 'profile' && renderProfile()}
                {step === 'select-issue' && renderSelectIssue()}
                {step === 'success' && renderSuccess()}
            </div>
        </div>
    );
};

export default ProviderProfile;
