import React from 'react';
import './JobCard.css';
import { 
    FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, 
    FaCheckCircle, FaSpinner, FaTimesCircle, FaUser, FaTools 
} from 'react-icons/fa';

export type JobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Canceled';

export interface JobCardProps {
    id: string;
    issueType: string;
    description: string;
    requesterName: string;
    requesterRole: 'Tenant' | 'Landlord';
    propertyLocation: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    price: number | string;
    dateRequested: string;
    status: JobStatus;
    finishDate?: string;
    onViewDetails?: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
    id,
    issueType,
    description,
    requesterName,
    requesterRole,
    propertyLocation,
    urgency,
    price,
    dateRequested,
    status,
    finishDate,
    onViewDetails
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'Scheduled': return <FaCalendarAlt />;
            case 'In Progress': return <FaSpinner className="spin-icon" />;
            case 'Completed': return <FaCheckCircle />;
            case 'Canceled': return <FaTimesCircle />;
            default: return null;
        }
    };

    return (
        <div className={`my-job-card status-${status.toLowerCase().replace(' ', '-')}`}>
            <div className="job-card-header">
                <div className="job-type-group">
                    <span className={`urgency-indicator ${urgency.toLowerCase()}`}></span>
                    <span className="job-type-text"><FaTools /> {issueType}</span>
                </div>
                <div className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon()} <span>{status}</span>
                </div>
            </div>

            <div className="job-card-body">
                <h4 className="job-title-desc">{description}</h4>
                
                <div className="job-meta-info">
                    <div className="meta-row">
                        <FaUser className="meta-icon" />
                        <span className="meta-text">{requesterName} <small>({requesterRole})</small></span>
                    </div>
                    <div className="meta-row">
                        <FaMapMarkerAlt className="meta-icon" />
                        <span className="meta-text location-truncate">{propertyLocation}</span>
                    </div>
                </div>

                <div className="job-dates-container">
                    <div className="date-block">
                        <label>Requested</label>
                        <div className="date-value">{dateRequested}</div>
                    </div>
                    {status !== 'Canceled' && finishDate && (
                        <div className="date-block">
                            <label>{status === 'Completed' ? 'Finished On' : 'Scheduled For'}</label>
                            <div className="date-value highlight">{finishDate}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="job-card-footer">
                <div className="job-price-tag">
                    {typeof price === 'number' ? `$${price}` : price}
                </div>
                <button className="job-details-btn" onClick={() => onViewDetails?.(id)}>
                    View Details
                </button>
            </div>
        </div>
    );
};

export default JobCard;
