import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaBuilding, FaCalendarAlt, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import DetailedRequestModal from './DetailedRequestModal';
import rentalRequestService from '../../../services/rental-request.service';
import { messageService } from '../../../services/message.service';
import './RequestCard.css';

export interface RequestCardData {
    id: string | number;
    tenantId: string;
    propertyId: string;
    applicant: {
        name: string;
        image: string;
        occupation: string;
        income: string;
        creditScore: number;
        matchScore: number;
    };
    property: { name: string; unit?: string; address?: string; image?: string; rent?: string; title?: string };
    moveInDate: string;
    livingSituation: string;
    message: string;
    status: string;
    duration?: string;
    occupants?: number;
    habits?: string[];
    appliedOnDate?: string;
}

interface RequestCardProps {
    data: RequestCardData;
    onStatusChange?: () => void;
}

const RequestCard = ({ data, onStatusChange }: RequestCardProps) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    // Destructured livingSituation instead of pets
    const { applicant, property, moveInDate, livingSituation, message, status } = data;
    const isApproved = status === 'approved';
    const isDeclined = status === 'declined';

    const openChatWithTenant = async () => {
        const participantId = data.tenantId;
        if (!participantId) {
            navigate('/messages');
            return;
        }
        setIsChatLoading(true);
        try {
            const response = await messageService.startConversation({
                participantId,
                propertyId: data.propertyId,
            });
            navigate('/messages', {
                state: {
                    conversationId: response.data.id,
                    participantId,
                    propertyId: data.propertyId,
                },
            });
        } catch (error) {
            console.error('Failed to start conversation with tenant', error);
            navigate('/messages', {
                state: { participantId, propertyId: data.propertyId },
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleDecline = async () => {
        try {
            await rentalRequestService.updateRequestStatus(String(data.id), 'DECLINED');
            onStatusChange?.();
        } catch (error) {
            console.error('Failed to decline rental request', error);
        }
    };

    return (
        <>
            <article
                className={`rc-compact ${isApproved ? 'rc-approved-card' : ''} ${isDeclined ? 'rc-declined-card' : ''}`}
            >
                <div className="rc-header">
                    <div className="rc-avatar-box">
                        <img src={applicant.image} alt={applicant.name} />
                        <span className="rc-match-badge">{applicant.matchScore}% Match</span>
                    </div>
                    <div className="rc-user-info">
                        <h3>{applicant.name} <FaCheckCircle className="icon-blue" /></h3>
                        <p>{applicant.occupation}</p>
                    </div>
                </div>

                <div className="rc-property">
                    <FaBuilding className="icon-gray" />
                    <span><strong>{property.name}</strong> - Unit {property.unit}</span>
                </div>

                <div className="rc-stats-grid">
                    <div className="rc-stat">
                        <label>Income</label>
                        <span>{applicant.income}</span>
                    </div>
                    <div className="rc-stat">
                        <label>Credit</label>
                        <span className={applicant.creditScore >= 700 ? 'text-green' : 'text-orange'}>
                            {applicant.creditScore}
                        </span>
                    </div>
                </div>

                <div className="rc-specs">
                    <span><FaCalendarAlt className="icon-gray"/> {moveInDate}</span>
                    {/* Replaced Pets with Living Situation */}
                    <span style={{ textTransform: 'capitalize' }}>
                        <FaUserFriends className="icon-gray"/> {livingSituation || "Single"}
                    </span>
                </div>

                <div className="rc-message">
                    <p>"{message}"</p>
                </div>

                {isApproved ? (
                    <div className="rc-approved-banner">
                        <FaCheckCircle />
                        <span>Application Approved</span>
                    </div>
                ) : isDeclined ? (
                    <div className="rc-declined-banner">
                        <FaTimesCircle aria-hidden />
                        <span>Application Declined</span>
                    </div>
                ) : (
                    <div className="rc-actions">
                        <button className="rc-btn-primary" onClick={() => setIsModalOpen(true)}>
                            Review Application
                        </button>
                        <div className="rc-action-row">
                            <button
                                type="button"
                                className="rc-btn-secondary"
                                disabled={isChatLoading}
                                onClick={() => void openChatWithTenant()}
                            >
                                <FaEnvelope /> {isChatLoading ? 'Opening…' : 'Chat'}
                            </button>
                            <button className="rc-btn-decline" onClick={handleDecline}>Decline</button>
                        </div>
                    </div>
                )}
            </article>

            {isModalOpen && (
                <DetailedRequestModal 
                    data={data} 
                    requestId={String(data.id)}
                    onStatusChange={onStatusChange}
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    );
};

export default RequestCard;