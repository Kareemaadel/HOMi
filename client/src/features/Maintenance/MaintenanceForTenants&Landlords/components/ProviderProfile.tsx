import React, { useEffect } from 'react';
import {
    FaTimes, FaStar, FaMapMarkerAlt, FaCheckCircle, FaToolbox,
    FaUser, FaBriefcase
} from 'react-icons/fa';
import './ProviderProfile.css';
import type { BrowseProvider } from '../../../../services/maintenance.service';

interface ProviderProfileProps {
    isOpen: boolean;
    onClose: () => void;
    provider: BrowseProvider | null;
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ isOpen, onClose, provider }) => {
    useEffect(() => {
        const stop = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', stop);
        return () => window.removeEventListener('keydown', stop);
    }, [onClose]);

    if (!isOpen || !provider) return null;

    const fullName = `${provider.firstName} ${provider.lastName}`.trim();
    const displayName = provider.businessName ?? fullName;
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=200`;
    const cover = provider.avatarUrl ?? fallback;

    return (
        <div className="provider-profile-modal-overlay" onClick={onClose}>
            <div className="provider-profile-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="profile-scroll-container">
                    <div className="profile-hero">
                        <div className="profile-hero-overlay" />
                        <img src={cover} alt={displayName} className="profile-cover-img" />
                        <button className="close-profile-btn" onClick={onClose}><FaTimes /></button>
                    </div>

                    <div className="profile-content-main">
                        <div className="profile-header-section">
                            <div className="profile-avatar-wrapper">
                                <img src={cover} alt={displayName} className="profile-avatar-img" />
                                <FaCheckCircle className="verified-icon-large" />
                            </div>
                            <div className="profile-main-meta">
                                <h1>{displayName}</h1>
                                <p className="specialty-text">
                                    <FaToolbox style={{ marginRight: 6 }} />
                                    {provider.primaryCategory} · {provider.providerType === 'CENTER' ? 'Center' : 'Individual'}
                                </p>
                                <div className="rating-location-row">
                                    <div className="p-rating">
                                        <FaStar /> <span>{provider.rating.toFixed(1)}</span> ({provider.ratingsCount} reviews)
                                    </div>
                                    {provider.companyLocation && (
                                        <div className="p-location">
                                            <FaMapMarkerAlt /> {provider.companyLocation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-grid-info">
                            <div className="info-card">
                                <span className="info-label">Type</span>
                                <span className="info-value">
                                    {provider.providerType === 'CENTER' ? <><FaBriefcase /> Center</> : <><FaUser /> Individual</>}
                                </span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Jobs done</span>
                                <span className="info-value">{provider.completedJobsCount}+</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Categories</span>
                                <span className="info-value">{provider.categories.length}</span>
                            </div>
                        </div>

                        {provider.bio && (
                            <div className="profile-bio-section">
                                <h3>About {displayName.split(' ')[0]}</h3>
                                <p>{provider.bio}</p>
                            </div>
                        )}

                        <div className="skills-section">
                            <h3>Service categories</h3>
                            <div className="skills-tags">
                                {provider.categories.length === 0 ? (
                                    <span>{provider.primaryCategory}</span>
                                ) : (
                                    provider.categories.map((c) => <span key={c}>{c}</span>)
                                )}
                            </div>
                        </div>

                        <div className="reviews-section">
                            <div className="reviews-header">
                                <h3>How HOMi works with this maintainer</h3>
                            </div>
                            <p style={{ color: '#475569' }}>
                                When you post a maintenance issue, this provider can apply with their final price. You
                                can then accept their bid (escrowed from your HOMi wallet) and the work will start.
                            </p>
                        </div>
                    </div>

                    <div className="profile-footer-sticky">
                        <div className="footer-price-info">
                            <span>Rating</span>
                            <strong>{provider.rating.toFixed(1)} / 5</strong>
                        </div>
                        <button className="request-fix-btn" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderProfile;
