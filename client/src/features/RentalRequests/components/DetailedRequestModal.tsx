// client\src\features\RentalRequests\components\DetailedRequestModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FaTimes,
    FaTimesCircle,
    FaWallet,
    FaChartLine,
    FaCalendarCheck,
    FaHourglassHalf,
    FaUsers,
    FaQuoteLeft,
    FaCheckCircle,
    FaUserFriends,
    FaCommentDots,
    FaExclamationTriangle,
    FaCheck,
} from 'react-icons/fa';
import rentalRequestService from '../../../services/rental-request.service';
import { messageService } from '../../../services/message.service';
import './DetailedRequestModal.css';

interface DetailedRequestModalProps {
    data: {
        tenantId?: string;
        propertyId?: string;
        status?: string;
        applicant?: {
            name?: string;
            image?: string;
            matchScore?: number;
            occupation?: string;
            company?: string;
            isFirstTimeRenter?: boolean;
            income?: string;
            creditScore?: number;
        };
        property?: {
            title?: string;
            name?: string;
            unit?: string;
        };
        moveInDate?: string;
        duration?: string;
        occupants?: number;
        message?: string;
        habits?: string[];
        livingSituation?: string;
        appliedOnDate?: string;
        propertyName?: string;
    };
    requestId: string;
    onStatusChange?: () => void;
    onClose: () => void;
}

const DetailedRequestModal: React.FC<DetailedRequestModalProps> = ({ data, requestId, onStatusChange, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // States for our new confirmation and success flows
    const [confirmAction, setConfirmAction] = useState<'approve' | 'decline' | null>(null);
    const [applicationState, setApplicationState] = useState<'pending' | 'approved' | 'declined'>(
        data?.status === 'approved' ? 'approved' : data?.status === 'declined' ? 'declined' : 'pending'
    );
    const [actionLoading, setActionLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const {
        applicant,
        property,
        moveInDate,
        duration,
        occupants,
        message,
        habits,
        livingSituation,
        appliedOnDate,
        propertyName,
        tenantId,
        propertyId,
    } = data;
    const applyingForName = [property?.title, property?.name, propertyName, property?.unit]
        .map((value) => value?.trim())
        .find(Boolean) || t('rentalRequests.card.selectedProperty', { defaultValue: 'Selected Property' });

    const defaultHabits = [
        t('rentalRequests.habits.earlyRiser', { defaultValue: 'Early Riser' }),
        t('rentalRequests.habits.nonSmoker', { defaultValue: 'Non-smoker' }),
        t('rentalRequests.habits.plantParent', { defaultValue: 'Plant Parent' }),
        t('rentalRequests.habits.quietLifestyle', { defaultValue: 'Quiet Lifestyle' })
    ];
    const allHabits = habits && habits.length > 0 ? habits : defaultHabits;
    const displayedHabits = allHabits.slice(0, 4);
    const hiddenHabitsCount = Math.max(0, allHabits.length - displayedHabits.length);

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await rentalRequestService.updateRequestStatus(requestId, 'APPROVED');
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
            setApplicationState('declined');
            onStatusChange?.();
        } catch (error) {
            console.error('Failed to decline rental request', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprovedContinue = () => {
        onStatusChange?.();
        navigate('/landlord-contracts');
    };

    const handleMessageTenant = async () => {
        const participantId = tenantId?.trim();
        if (!participantId) {
            navigate('/messages');
            return;
        }
        setIsChatLoading(true);
        try {
            const response = await messageService.startConversation({
                participantId,
                propertyId: propertyId?.trim() || undefined,
            });
            navigate('/messages', {
                state: {
                    conversationId: response.data.id,
                    participantId,
                    propertyId: propertyId?.trim(),
                },
            });
            onClose();
        } catch (error) {
            console.error('Failed to start conversation with tenant', error);
            navigate('/messages', {
                state: { participantId, propertyId: propertyId?.trim() },
            });
            onClose();
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="detailed-modal-overlay" onClick={onClose} dir="ltr">
            <div className="detailed-modal-container" onClick={e => e.stopPropagation()}>

                {/* Close Button is hidden if we are on a final success/declined screen to force navigation/acknowledgment, or keep it if you prefer! */}
                <button className="detailed-close-btn" onClick={onClose}><FaTimes /></button>

                {/* --- INNER OVERLAYS FOR CONFIRMATION & SUCCESS --- */}
                {confirmAction === 'approve' && applicationState === 'pending' && (
                    <div className="action-overlay">
                        <div className="action-card">
                            <FaExclamationTriangle size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
                            <h3>{t('rentalRequests.modals.approveTitle', { defaultValue: 'Review Confirmation' })}</h3>
                            <p>{t('rentalRequests.modals.approveText', { name: applicant?.name || "this applicant" })}</p>
                            <div className="action-buttons">
                                <button className="btn-cancel" onClick={() => setConfirmAction(null)}>{t('confirmModal.cancel')}</button>
                                <button className="btn-approve-main" onClick={handleApprove} disabled={actionLoading}>
                                    {actionLoading ? t('auth.loading') : t('rentalRequests.card.approve')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmAction === 'decline' && applicationState === 'pending' && (
                    <div className="action-overlay">
                        <div className="action-card">
                            <FaExclamationTriangle size={40} color="#ef4444" style={{ marginBottom: '16px' }} />
                            <h3>{t('rentalRequests.modals.declineTitle', { defaultValue: 'Decline Application' })}</h3>
                            <p>{t('rentalRequests.modals.declineText', { defaultValue: 'Are you sure you want to decline this application? This action cannot be easily undone.' })}</p>
                            <div className="action-buttons">
                                <button className="btn-cancel" onClick={() => setConfirmAction(null)}>{t('confirmModal.cancel')}</button>
                                <button className="btn-decline-main" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDecline} disabled={actionLoading}>
                                    {actionLoading ? t('auth.loading') : t('rentalRequests.card.decline')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {applicationState === 'approved' && (
                    <div className="action-overlay outcome-approved">
                        <div className="action-card outcome-card">
                            <div className="success-circle"><FaCheck size={32} color="#10b981" /></div>
                            <h3>{t('rentalRequests.card.approvedBanner')}</h3>
                            <p>{t('rentalRequests.modals.approvedSuccessText', { defaultValue: 'Great news! The next step is to draft and send the official lease agreement to the tenant.' })}</p>
                            <button className="btn-approve-main" style={{ width: '100%' }} onClick={handleApprovedContinue}>
                                {t('rentalRequests.modals.goToContracts', { defaultValue: 'Go to Contracts Hub' })}
                            </button>
                        </div>
                    </div>
                )}

                {applicationState === 'declined' && (
                    <div className="action-overlay outcome-declined">
                        <div className="action-card outcome-card">
                            <div className="decline-outcome-circle" aria-hidden>
                                <FaTimesCircle size={32} color="#dc2626" />
                            </div>
                            <h3>{t('rentalRequests.card.declinedBanner')}</h3>
                            <p>{t('rentalRequests.modals.declinedSuccessText', { defaultValue: 'The applicant will be notified. Use the close control when you are ready to return to your requests.' })}</p>
                        </div>
                    </div>
                )}
                {/* --- END OVERLAYS --- */}

                <div className="detailed-modal-body">
                    <div className="detailed-top-grid">
                        {/* LEFT COLUMN: Profile & Message */}
                        <div className="detailed-left-col">
                            <div className="applicant-hero">
                                <div className="hero-avatar-wrapper">
                                    <img src={applicant?.image || "https://via.placeholder.com/120"} alt={applicant?.name} />
                                    <div className="match-score-radial">
                                        <span>{applicant?.matchScore || "85"}%</span>
                                        <label>{t('rentalRequests.card.match')}</label>
                                    </div>
                                </div>
                                <h2 className="hero-name-row">
                                    <span>{applicant?.name || "Applicant Name"}</span>
                                    <FaCheckCircle className="verified-badge" style={{ color: '#10b981' }} />
                                </h2>
                                <p className="hero-subtext">
                                    {applicant?.occupation || t('sidebar.tenant')}
                                </p>
                                <p className="hero-subtext" style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>
                                    {t('rentalRequests.card.appliedOn', { date: appliedOnDate || "Oct 24, 2023", defaultValue: `Applied on ${appliedOnDate}` })}
                                </p>

                                <div className="hero-tags" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                    {applicant?.isFirstTimeRenter && <span className="tag" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{t('rentalRequests.labels.firstTimeRenter', { defaultValue: 'First Time Renter' })}</span>}
                                    <span className="tag premium" style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{t('guestHome.verified')}</span>
                                </div>
                            </div>

                            <div className="section-block">
                                <h3><FaQuoteLeft style={{ color: '#94a3b8' }} /> {t('rentalRequests.labels.personalMessage', { defaultValue: 'Personal Message' })}</h3>
                                <div className="message-content">
                                    {message || t('rentalRequests.labels.noMessage', { defaultValue: 'No message provided by applicant.' })}
                                </div>
                            </div>

                            <div className="section-block" style={{ marginTop: '30px' }}>
                                <h3>{t('rentalRequests.labels.lifestyles', { defaultValue: 'Lifestyles & Habits' })}</h3>
                                <div className="habits-display-grid">
                                    {displayedHabits.length > 0 ? (
                                        displayedHabits.map((habit: string) => (
                                            <div key={habit} className="habit-tag">
                                                {habit}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-text">
                                            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontWeight: 600 }}>{t('rentalRequests.labels.noHabits', { defaultValue: 'No lifestyle habits provided.' })}</p>
                                        </div>
                                    )}
                                    {hiddenHabitsCount > 0 && (
                                        <div className="habit-tag">+{hiddenHabitsCount} {t('guestHome.exploreAll')}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Stats & Actions */}
                        <div className="detailed-right-col">
                            <div className="section-block financials">
                                <h3>{t('landlordHomeComponents.financialOverview')}</h3>
                                <div className="financial-grid">
                                    <div className="fin-card">
                                        <FaWallet className="icon" />
                                        <label>{t('landlordHomeComponents.netMonthlyIncome')}</label>
                                        <span>{applicant?.income || "Pending"}</span>
                                    </div>
                                    <div className="fin-card">
                                        <FaChartLine className="icon" />
                                        <label>{t('rentalRequests.card.credit')}</label>
                                        <span className="score">{applicant?.creditScore || 720}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="section-block lease-details">
                                <h3>{t('rentalRequests.labels.proposedLease', { defaultValue: 'Proposed Lease' })}</h3>
                                <div className="lease-list">
                                    <div className="lease-item">
                                        <FaCalendarCheck />
                                        <div>
                                            <label>{t('rentalRequests.labels.moveIn')}</label>
                                            <p>{moveInDate || t('rentalRequests.flexible')}</p>
                                        </div>
                                    </div>
                                    <div className="lease-item">
                                        <FaHourglassHalf />
                                        <div>
                                            <label>{t('tenantHomeComponents.leaseProgress')}</label>
                                            <p>{duration || "12"} {t('guestHome.perMonth')}</p>
                                        </div>
                                    </div>
                                    <div className="lease-item">
                                        <FaUsers />
                                        <div>
                                            <label>{t('rentalRequests.labels.occupants')}</label>
                                            <p>{occupants || "1"} {t('guestHome.landlordsTenants')}</p>
                                        </div>
                                    </div>
                                    <div className="lease-item">
                                        <FaUserFriends />
                                        <div>
                                            <label>{t('tenantHomeComponents.period')}</label>
                                            <p style={{ textTransform: 'capitalize' }}>{livingSituation || "Single"}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detailed-bottom-cta">
                        <div className="property-context">
                            <label>{t('landlordHomeComponents.applyingFor')}</label>
                            <h4>{applyingForName}</h4>
                            <p>{property?.unit || t('landlordHome.noCurrentTenant')}</p>
                        </div>

                        {applicationState === 'pending' && (
                            <div className="sticky-actions">
                                <button className="btn-approve-main" onClick={() => setConfirmAction('approve')}>{t('rentalRequests.card.approve')}</button>

                                {/* Wrapper to put Message and Decline on the same row */}
                                <div className="sticky-actions-row">
                                    <button
                                        type="button"
                                        className="btn-secondary-main"
                                        disabled={isChatLoading}
                                        onClick={() => void handleMessageTenant()}
                                        style={{
                                            background: '#eff6ff',
                                            color: '#3b82f6',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            cursor: isChatLoading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: '0.2s',
                                            flex: 1,
                                            opacity: isChatLoading ? 0.75 : 1,
                                        }}
                                    >
                                        <FaCommentDots size={18} /> {isChatLoading ? t('auth.loading') : t('header.messages')}
                                    </button>

                                    <button
                                        className="btn-decline-main"
                                        style={{ flex: 1 }} // Takes up the other half
                                        onClick={() => setConfirmAction('decline')}
                                    >
                                        {t('rentalRequests.card.decline')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedRequestModal;
