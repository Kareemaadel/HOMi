import React from 'react';
import { FaCheckCircle, FaUserCircle, FaBriefcase, FaCalendarAlt, FaPaw, FaEnvelope } from 'react-icons/fa';
import './RequestCard.css';

const RequestCard = ({ data }: any) => {
    const { applicant, property, moveInDate, pets, message } = data;

    return (
        <div className="request-card">
            <div className="request-card-left">
                <div className="applicant-profile">
                    <div className="avatar-wrapper">
                        <img src={applicant.image} alt={applicant.name} />
                        <div className="match-badge">{applicant.matchScore}% Match</div>
                    </div>
                    <div className="applicant-info">
                        <h3>{applicant.name} <FaCheckCircle className="verified-icon" /></h3>
                        <p className="occupation"><FaBriefcase /> {applicant.occupation} at {applicant.company}</p>
                    </div>
                </div>

                <div className="application-details">
                    <div className="detail-pill">
                        <label>Monthly Income</label>
                        <span>{applicant.income}</span>
                    </div>
                    <div className="detail-pill">
                        <label>Credit Score</label>
                        <span className={applicant.creditScore > 700 ? 'score-high' : 'score-mid'}>
                            {applicant.creditScore}
                        </span>
                    </div>
                    <div className="detail-pill">
                        <label>Property</label>
                        <span>{property.name} ({property.unit})</span>
                    </div>
                </div>

                <div className="message-box">
                    <p>"{message}"</p>
                </div>
            </div>

            <div className="request-card-right">
                <div className="quick-specs">
                    <div className="spec-item">
                        <FaCalendarAlt /> <span>Move-in: <strong>{moveInDate}</strong></span>
                    </div>
                    <div className="spec-item">
                        <FaPaw /> <span>Pets: <strong>{pets}</strong></span>
                    </div>
                </div>

                <div className="action-stack">
                    <button className="approve-btn">Approve Application</button>
                    <div className="secondary-actions">
                        <button className="chat-btn"><FaEnvelope /> Chat</button>
                        <button className="decline-btn">Decline</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;