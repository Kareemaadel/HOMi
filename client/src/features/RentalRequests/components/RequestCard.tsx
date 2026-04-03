import React, { useState } from 'react';
import { FaCheckCircle, FaBuilding, FaCalendarAlt, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import DetailedRequestModal from './DetailedRequestModal';
import rentalRequestService from '../../../services/rental-request.service';
import './RequestCard.css';

const RequestCard = ({ data, onStatusChange }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Destructured livingSituation instead of pets
    const { applicant, property, moveInDate, livingSituation, message } = data;

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
            <article className="rc-compact">
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

                <div className="rc-actions">
                    <button className="rc-btn-primary" onClick={() => setIsModalOpen(true)}>
                        Review Application
                    </button>
                    <div className="rc-action-row">
                        <button className="rc-btn-secondary"><FaEnvelope /> Chat</button>
                        <button className="rc-btn-decline" onClick={handleDecline}>Decline</button>
                    </div>
                </div>
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