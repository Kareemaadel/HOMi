// client\src\features\RentalRequests\components\DetailedRequestModal.tsx
import React from 'react';
import { 
    FaTimes, FaBriefcase, FaWallet, FaChartLine, 
    FaCalendarCheck, FaHourglassHalf, FaUsers, FaPaw, 
    FaQuoteLeft, FaCheckCircle, FaStar 
} from 'react-icons/fa';
import './DetailedRequestModal.css';

interface DetailedRequestModalProps {
    data: any;
    onClose: () => void;
}

const DetailedRequestModal: React.FC<DetailedRequestModalProps> = ({ data, onClose }) => {
    const { applicant, property, moveInDate, duration, occupants, pets, message, habits } = data;

    return (
        <div className="detailed-modal-overlay" onClick={onClose}>
            <div className="detailed-modal-container" onClick={e => e.stopPropagation()}>
                <button className="detailed-close-btn" onClick={onClose}><FaTimes /></button>

                <div className="detailed-modal-body">
                    {/* LEFT COLUMN: Profile & Message */}
                    <div className="detailed-left-col">
                        <div className="applicant-hero">
                            <div className="hero-avatar-wrapper">
                                <img src={applicant.image} alt={applicant.name} />
                                <div className="match-score-radial">
                                    <span>{applicant.matchScore}%</span>
                                    <label>Match</label>
                                </div>
                            </div>
                            <h2>{applicant.name} <FaCheckCircle className="verified-badge" /></h2>
                            <p className="hero-subtext">{applicant.occupation} at {applicant.company}</p>
                            
                            <div className="hero-tags">
                                {applicant.isFirstTimeRenter && <span className="tag">First Time Renter</span>}
                                <span className="tag premium">Verified Identity</span>
                            </div>
                        </div>

                        <div className="section-block">
                            <h3><FaQuoteLeft /> Personal Message</h3>
                            <div className="message-content">
                                {message || "No message provided by applicant."}
                            </div>
                        </div>

                    <div className="section-block">
                        <h3>Lifestyles & Habits</h3>
                        <div className="habits-display-grid">
                            {habits && habits.length > 0 ? (
                                habits.map((habit: string) => (
                                    <div key={habit} className="habit-tag">
                                    {habit}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-text">No specific habits mentioned.</div>
                            )}
                        </div>
                    </div>
                    </div>

                    {/* RIGHT COLUMN: Stats & Actions */}
                    <div className="detailed-right-col">
                        <div className="section-block financials">
                            <h3>Financial Overview</h3>
                            <div className="financial-grid">
                                <div className="fin-card">
                                    <FaWallet className="icon" />
                                    <label>Monthly Income</label>
                                    <span>{applicant.income}</span>
                                </div>
                                <div className="fin-card">
                                    <FaChartLine className="icon" />
                                    <label>Credit Score</label>
                                    <span className="score">{applicant.creditScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="section-block lease-details">
                            <h3>Proposed Lease</h3>
                            <div className="lease-list">
                                <div className="lease-item">
                                    <FaCalendarCheck />
                                    <div>
                                        <label>Desired Move-in</label>
                                        <p>{moveInDate}</p>
                                    </div>
                                </div>
                                <div className="lease-item">
                                    <FaHourglassHalf />
                                    <div>
                                        <label>Lease Duration</label>
                                        <p>{duration || "12"} Months</p>
                                    </div>
                                </div>
                                <div className="lease-item">
                                    <FaUsers />
                                    <div>
                                        <label>Total Occupants</label>
                                        <p>{occupants || "1"} Person(s)</p>
                                    </div>
                                </div>
                                <div className="lease-item">
                                    <FaPaw />
                                    <div>
                                        <label>Pets</label>
                                        <p>{pets === "yes" ? "Has Pets" : "No Pets"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="property-context">
                            <label>Applying For</label>
                            <h4>{property.name}</h4>
                            <p>{property.unit}</p>
                        </div>

                        <div className="sticky-actions">
                            <button className="btn-approve-main">Approve Application</button>
                            <button className="btn-decline-main">Decline</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRequestModal;