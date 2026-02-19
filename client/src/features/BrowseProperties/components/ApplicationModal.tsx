// client\src\features\BrowseProperties\components\ApplicationModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaCalendarAlt, FaHourglassHalf, FaCommentDots, FaPaperPlane, FaUsers, FaPaw, FaUserTie, FaArrowLeft } from 'react-icons/fa';
import './ApplicationModal.css';

// Added onBack to the props
const ApplicationModal = ({ property, onClose, onBack }: any) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container app-modal-view">
                <button className="close-modal" onClick={onClose} aria-label="Close modal">
                    <FaTimes size={20} />
                </button>

                {!isSubmitted ? (
                    <div className="app-layout">
                        <div className="app-sidebar">
                            {/* This button now triggers the onBack function */}
                            <button className="back-to-property" onClick={onBack}>
                                <FaArrowLeft /> Back to Details
                            </button>

                            <div className="property-mini-card">
                                <img src={property.image} alt={property.title} />
                                <div className="mini-info">
                                    <span className="badge">New Application</span>
                                    <h4>{property.title}</h4>
                                    <p className="mini-price">${property.price.toLocaleString()}<span>/mo</span></p>
                                </div>
                            </div>

                            <div className="landlord-card">
                                <div className="landlord-header">
                                    <FaUserTie className="landlord-icon" />
                                    <div>
                                        <h5>Landlord Info</h5>
                                        <p>{property.landlordName || "Sarah Jenkins"}</p>
                                    </div>
                                </div>
                                <div className="landlord-stats">
                                    <div className="stat"><span>Response Time</span><strong>&lt; 2h</strong></div>
                                    <div className="stat"><span>Properties</span><strong>12</strong></div>
                                </div>
                            </div>
                        </div>

                        <div className="app-form-section">
                            <div className="form-header">
                                <h1>Rental Application</h1>
                                <p>Provide your rental preferences to start the process.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="premium-form">
                                <div className="form-row">
                                    <div className="field-group">
                                        <label><FaCalendarAlt /> Move-in Date</label>
                                        <input type="date" required />
                                    </div>
                                    <div className="field-group">
                                        <label><FaHourglassHalf /> Duration</label>
                                        <select required className="premium-select">
                                            <option value="">Select duration</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                            <option value="24">24 Months</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="field-group">
                                        <label><FaUsers /> Occupants</label>
                                        <input type="number" min="1" placeholder="Number of people" required />
                                    </div>
                                    <div className="field-group">
                                        <label><FaPaw /> Pets</label>
                                        <select required className="premium-select">
                                            <option value="no">No Pets</option>
                                            <option value="yes">Yes, I have pets</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label><FaCommentDots /> Message to Landlord</label>
                                    <textarea 
                                        placeholder="Briefly introduce yourself..." 
                                        rows={4}
                                        className="premium-textarea"
                                    ></textarea>
                                </div>

                                <div className="terms-checkbox">
                                    <input type="checkbox" id="terms" required />
                                    <label htmlFor="terms">I agree to the <span>Terms of Service</span> and authorize the landlord to review my profile details.</label>
                                </div>

                                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                                    {loading ? <div className="spinner"></div> : <><FaPaperPlane /> Submit Application</>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="success-screen">
                        <FaCheckCircle className="check-icon-anim" />
                        <h2>Application Sent!</h2>
                        <p>Your request has been forwarded. You can track its status in your dashboard.</p>
                        <button className="final-btn" onClick={onClose}>Return to Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;