import React from 'react';
import './AvailableJobModal.css';
import { 
    FaTimes, FaMapMarkerAlt, FaUser, FaTag, FaClock, 
    FaDollarSign, FaExclamationTriangle, FaImage, FaCheckCircle,
    FaArrowRight
} from 'react-icons/fa';

interface AvailableJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: {
        id: string;
        issueType: string;
        description: string;
        requesterName: string;
        propertyLocation: string;
        price: number | string;
        datePublished: string;
        urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    } | null;
    onConfirmApply: (id: string) => void;
}

const AvailableJobModal: React.FC<AvailableJobModalProps> = ({ 
    isOpen, 
    onClose, 
    job, 
    onConfirmApply 
}) => {
    if (!isOpen || !job) return null;

    // Mock evidence photos
    const mockPhotos = [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1595844730298-b9f0ff98ffd0?auto=format&fit=crop&q=80&w=400'
    ];

    return (
        <div className="market-modal-overlay" onClick={onClose}>
            <div className="market-modal-container" onClick={e => e.stopPropagation()}>
                <header className="market-modal-header">
                    <div className="modal-header-left">
                        <div className={`modal-urgency-badge ${job.urgency.toLowerCase()}`}>
                            {job.urgency} Priority
                        </div>
                        <h2>Job Application</h2>
                    </div>
                    <button className="modal-exit-btn" onClick={onClose} aria-label="Close window">
                        <FaTimes />
                    </button>
                </header>

                <div className="market-modal-scroll-area">
                    <div className="modal-grid-layout">
                        <div className="modal-info-column">
                            <section className="modal-info-block">
                                <label className="modal-block-label"><FaTag /> Category</label>
                                <h3 className="modal-job-type">{job.issueType}</h3>
                            </section>

                            <section className="modal-info-block">
                                <label className="modal-block-label"><FaClock /> Job Summary</label>
                                <p className="modal-job-description">{job.description}</p>
                            </section>

                            <div className="modal-data-row">
                                <div className="data-cell">
                                    <label><FaUser /> Posted By</label>
                                    <p>{job.requesterName}</p>
                                </div>
                                <div className="data-cell">
                                    <label><FaMapMarkerAlt /> Property Location</label>
                                    <p>{job.propertyLocation}</p>
                                </div>
                                <div className="data-cell">
                                    <label><FaClock /> Published Date</label>
                                    <p>{job.datePublished}</p>
                                </div>
                            </div>

                            <section className="modal-info-block photos-block">
                                <label className="modal-block-label"><FaImage /> Evidence & Reference Photos</label>
                                <div className="modal-photo-gallery">
                                    {mockPhotos.map((url, i) => (
                                        <div key={i} className="gallery-thumb">
                                            <img src={url} alt={`Evidence ${i + 1}`} />
                                            <div className="thumb-overlay">View Full</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="modal-side-column">
                            <div className="reward-summary-card">
                                <label>Market Reward</label>
                                <div className="reward-value">
                                    <FaDollarSign className="reward-icon" />
                                    <span>{typeof job.price === 'number' ? job.price.toLocaleString() : job.price}</span>
                                </div>
                                <div className="reward-divider" />
                                <p className="reward-disclaimer">Includes estimated labor and basic material costs.</p>
                            </div>

                            <div className="application-policy-box">
                                <FaExclamationTriangle className="policy-icon" />
                                <div className="policy-text">
                                    <h4>Service Terms</h4>
                                    <p>Your profile and rating will be shared with the requester upon application.</p>
                                </div>
                            </div>

                            <div className="modal-side-actions">
                                <button className="modal-btn-apply" onClick={() => onConfirmApply(job.id)}>
                                    Apply for this Job <FaArrowRight />
                                </button>
                                <button className="modal-btn-close" onClick={onClose}>
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailableJobModal;
