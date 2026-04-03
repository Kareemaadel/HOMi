// client\src\features\RentalRequests\components\DetailedRequestModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaTimes, FaWallet, FaChartLine, 
    FaCalendarCheck, FaHourglassHalf, FaUsers, FaPaw, 
    FaQuoteLeft, FaCheckCircle, FaUserFriends, FaCommentDots,
    FaExclamationTriangle, FaCheck
} from 'react-icons/fa';
import rentalRequestService from '../../../services/rental-request.service';
import './DetailedRequestModal.css';

interface DetailedRequestModalProps {
    data: any;
    requestId: string;
    onStatusChange?: () => void;
    onClose: () => void;
}

const DetailedRequestModal: React.FC<DetailedRequestModalProps> = ({ data, requestId, onStatusChange, onClose }) => {
    const navigate = useNavigate();
    
    // States for our new confirmation and success flows
    const [confirmAction, setConfirmAction] = useState<'approve' | 'decline' | null>(null);
    const [applicationState, setApplicationState] = useState<'pending' | 'approved' | 'declined'>('pending');
    const [actionLoading, setActionLoading] = useState(false);

    const { 
        applicant, property, moveInDate, duration, occupants, 
        pets, message, habits, livingSituation, appliedOnDate 
    } = data;

    const defaultHabits = ["Early Riser", "Non-smoker", "Plant Parent", "Quiet Lifestyle"];
    const allHabits = habits && habits.length > 0 ? habits : defaultHabits;
    const displayedHabits = allHabits.slice(0, 4);
    const hiddenHabitsCount = Math.max(0, allHabits.length - displayedHabits.length);

    // Safely parse pets to ensure no numbers are displayed
    const hasPets = pets === "yes" || pets === true || Number(pets) > 0;

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await rentalRequestService.updateRequestStatus(requestId, 'APPROVED');
            onStatusChange?.();
            setApplicationState('approved');
        } catch (error) {
            console.error('Failed to approve rental request', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async () => {
        try {
            setActionLoading(true);
            await rentalRequestService.updateRequestStatus(requestId, 'DECLINED');
            onStatusChange?.();
            setApplicationState('declined');
        } catch (error) {
            console.error('Failed to decline rental request', error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="detailed-modal-overlay" onClick={onClose}>
            <div className="detailed-modal-container" onClick={e => e.stopPropagation()}>
                
                {/* Close Button is hidden if we are on a final success/declined screen to force navigation/acknowledgment, or keep it if you prefer! */}
                <button className="detailed-close-btn" onClick={onClose}><FaTimes /></button>

                {/* --- INNER OVERLAYS FOR CONFIRMATION & SUCCESS --- */}
                {confirmAction === 'approve' && applicationState === 'pending' && (
                    <div className="action-overlay">
                        <div className="action-card">
                            <FaExclamationTriangle size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
                            <h3>Review Confirmation</h3>
                            <p>Have you thoroughly reviewed <strong>{applicant?.name || "this applicant"}'s</strong> background, financials, and lifestyle fit?</p>
                            <div className="action-buttons">
                                <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Go Back</button>
                                <button className="btn-approve-main" onClick={handleApprove} disabled={actionLoading}>
                                    {actionLoading ? 'Processing...' : 'Yes, Approve Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmAction === 'decline' && applicationState === 'pending' && (
                    <div className="action-overlay">
                        <div className="action-card">
                            <FaExclamationTriangle size={40} color="#ef4444" style={{ marginBottom: '16px' }} />
                            <h3>Decline Application</h3>
                            <p>Are you sure you want to decline this application? This action cannot be easily undone.</p>
                            <div className="action-buttons">
                                <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
                                <button className="btn-decline-main" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDecline} disabled={actionLoading}>
                                    {actionLoading ? 'Processing...' : 'Yes, Decline'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {applicationState === 'approved' && (
                    <div className="action-overlay success">
                        <div className="action-card">
                            <div className="success-circle"><FaCheck size={32} color="#10b981" /></div>
                            <h3>Application Approved!</h3>
                            <p>Great news! The next step is to draft and send the official lease agreement to the tenant.</p>
                            <button className="btn-approve-main" style={{ width: '100%' }} onClick={() => navigate('/landlord-contracts')}>
                                Go to Contracts Hub
                            </button>
                        </div>
                    </div>
                )}

                {applicationState === 'declined' && (
                    <div className="action-overlay declined">
                        <div className="action-card">
                            <FaTimes size={40} color="#ef4444" style={{ marginBottom: '16px' }} />
                            <h3>Application Declined</h3>
                            <p>The applicant will be notified safely. You can now focus on other prospective tenants.</p>
                            <button className="btn-cancel" style={{ width: '100%', border: '1px solid #cbd5e1' }} onClick={onClose}>
                                Close Window
                            </button>
                        </div>
                    </div>
                )}
                {/* --- END OVERLAYS --- */}

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
                                    <div className="empty-text">
                                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontWeight: 600 }}>No lifestyle habits provided.</p>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>The applicant opted to skip this optional section.</span>
                                    </div>
                                )}
                                {hiddenHabitsCount > 0 && (
                                    <div className="habit-tag">+{hiddenHabitsCount} more</div>
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
                                    <span className="score">{applicant?.creditScore || 720}</span>
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
                                <div className="lease-item">
                                    <FaUserFriends />
                                    <div>
                                        <label>Living Situation</label>
                                        <p style={{ textTransform: 'capitalize' }}>{livingSituation || "Single"}</p>
                                    </div>
                                </div>
 
                            </div>
                        </div>

                        <div className="property-context">
                            <label>Applying For</label>
                            {/* Uses title first, falls back to name */}
                            <h4>{property?.title || property?.name || "Property Title"}</h4>
                            <p>{property?.unit || "Unit details unavailable"}</p>
                        </div>

<div className="sticky-actions">
                            <button className="btn-approve-main" onClick={() => setConfirmAction('approve')}>Accept Application</button>
                            
                            {/* Wrapper to put Message and Decline on the same row */}
                            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                <button className="btn-secondary-main" onClick={() => navigate('/messages')} style={{
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
                                    transition: '0.2s',
                                    flex: 1 // Takes up half the row
                                }}>
                                    <FaCommentDots size={18} /> Message
                                </button>
                                
                                <button 
                                    className="btn-decline-main" 
                                    style={{ flex: 1 }} // Takes up the other half
                                    onClick={() => setConfirmAction('decline')}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRequestModal;