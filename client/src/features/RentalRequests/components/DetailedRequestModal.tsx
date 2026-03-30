// client\src\features\RentalRequests\components\DetailedRequestModal.tsx
import React from 'react';
import { 
    FaTimes, FaBriefcase, FaWallet, FaChartLine, 
    FaCalendarCheck, FaHourglassHalf, FaUsers, FaPaw, 
    FaQuoteLeft, FaCheckCircle, FaStar, FaUserFriends, FaCommentDots 
} from 'react-icons/fa';
import './DetailedRequestModal.css';

interface DetailedRequestModalProps {
    data: any;
    onClose: () => void;
}

const DetailedRequestModal: React.FC<DetailedRequestModalProps> = ({ data, onClose }) => {
    const { 
        applicant, property, moveInDate, duration, occupants, 
        pets, message, habits, livingSituation, appliedOnDate 
    } = data;

    // --- MOCK STATE FOR TESTING ---
    // Toggle this boolean to true/false to test the populated vs. empty state
    const hasHabits = true; 
    const mockHabits = ["Early Riser", "Non-smoker", "Plant Parent", "Quiet Lifestyle"];
    
    // Determine which habits to show based on the toggle and actual data
    const displayedHabits = hasHabits ? (habits && habits.length > 0 ? habits : mockHabits) : [];
    // ------------------------------

    return (
        <div className="detailed-modal-overlay" onClick={onClose}>
            <div className="detailed-modal-container" onClick={e => e.stopPropagation()}>
                <button className="detailed-close-btn" onClick={onClose}><FaTimes /></button>

                <div className="detailed-modal-body">
                    {/* LEFT COLUMN: Profile & Message */}
                    <div className="detailed-left-col">
                        <div className="applicant-hero">
                            <div className="hero-avatar-wrapper">
                                <img src={applicant?.image || "https://via.placeholder.com/120"} alt={applicant?.name} />
                                <div className="match-score-radial">
                                    <span>{applicant?.matchScore || "85"}%</span>
                                    <label>Match</label>
                                </div>
                            </div>
                            <h2>{applicant?.name || "Applicant Name"} <FaCheckCircle className="verified-badge" style={{ color: '#10b981', marginLeft: '4px' }} /></h2>
                            <p className="hero-subtext">
                                {applicant?.occupation || "Professional"} at {applicant?.company || "Company"}
                            </p>
                            {/* NEW: Application Timestamp */}
                            <p className="hero-subtext" style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>
                                Applied on {appliedOnDate || "Oct 24, 2023"}
                            </p>
                            
                            <div className="hero-tags" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                {applicant?.isFirstTimeRenter && <span className="tag" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>First Time Renter</span>}
                                <span className="tag premium" style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>Verified Identity</span>
                            </div>
                        </div>

                        <div className="section-block">
                            <h3><FaQuoteLeft style={{ color: '#94a3b8' }} /> Personal Message</h3>
                            <div className="message-content">
                                {message || "No message provided by applicant. They might just be letting their profile do the talking!"}
                            </div>
                        </div>

                        <div className="section-block" style={{ marginTop: '30px' }}>
                            <h3>Lifestyles & Habits</h3>
                            <div className="habits-display-grid">
                                {displayedHabits.length > 0 ? (
                                    displayedHabits.map((habit: string) => (
                                        <div key={habit} className="habit-tag">
                                            {habit}
                                        </div>
                                    ))
                                ) : (
                                    // NEW: Empty State Management
                                    <div className="empty-text">
                                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontWeight: 600 }}>No lifestyle habits provided.</p>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>The applicant opted to skip this optional section.</span>
                                    </div>
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
                                    <span>{applicant?.income || "Pending"}</span>
                                </div>
                                <div className="fin-card">
                                    <FaChartLine className="icon" />
                                    <label>Credit Score</label>
                                    <span className="score">{applicant?.creditScore || "N/A"}</span>
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
                                        <p>{moveInDate || "Flexible"}</p>
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
                                {/* NEW: Living Situation Mapping */}
                                <div className="lease-item">
                                    <FaUserFriends />
                                    <div>
                                        <label>Living Situation</label>
                                        <p style={{ textTransform: 'capitalize' }}>{livingSituation || "Single"}</p>
                                    </div>
                                </div>
                                {/* UNCOMMENTED & FIXED: Pets */}
                                <div className="lease-item">
                                    <FaPaw />
                                    <div>
                                        <label>Pets</label>
                                        <p>{pets === "yes" ? "Has Pets" : (pets === "no" ? "No Pets" : "Not specified")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="property-context">
                            <label>Applying For</label>
                            <h4>{property?.name || "Select a Property"}</h4>
                            <p>{property?.unit || "Unit details unavailable"}</p>
                        </div>

                        <div className="sticky-actions">
                            <button className="btn-approve-main">Approve Application</button>
                            
                            {/* NEW: Message Applicant Button */}
                            <button className="btn-secondary-main" style={{
                                background: '#eff6ff', 
                                color: '#3b82f6', 
                                border: 'none', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                fontWeight: '600', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: '0.2s'
                            }}>
                                <FaCommentDots size={18} /> Message Applicant
                            </button>
                            
                            <button className="btn-decline-main">Decline</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRequestModal;