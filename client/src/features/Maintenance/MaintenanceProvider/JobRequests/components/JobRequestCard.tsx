import React from 'react';
import './JobRequestCard.css';

export interface JobRequestCardProps {
  id: string;
  issueType: string;
  description: string;
  requesterName: string;
  requesterRole: 'Tenant' | 'Landlord';
  propertyLocation: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  price: number | string;
  dateRequested: string;
  onViewDetails?: (id: string) => void;
}

const JobRequestCard: React.FC<JobRequestCardProps> = ({
  id,
  issueType,
  description,
  requesterName,
  requesterRole,
  propertyLocation,
  urgency,
  price,
  dateRequested,
  onViewDetails
}) => {
  const getUrgencyClass = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'Low': return 'urgency-low';
      case 'Medium': return 'urgency-medium';
      case 'High': return 'urgency-high';
      case 'Critical': return 'urgency-critical';
      default: return 'urgency-low';
    }
  };

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🟠';
      case 'Critical': return '🔴';
      default: return '🟢';
    }
  };

  return (
    <div className="job-request-card">
      <div className="job-card-header">
        <div className="job-issue-wrapper">
          <span className="job-issue-icon">🔧</span>
          <h3 className="job-issue-type">{issueType}</h3>
        </div>
        <span className={`job-urgency ${getUrgencyClass(urgency)}`}>
          {getUrgencyIcon(urgency)} {urgency}
        </span>
      </div>

      <div className="job-card-body">
        <p className="job-description">{description}</p>
        
        <div className="job-details-grid">
          <div className="job-detail-item">
            <span className="detail-label">Requester</span>
            <span className="detail-value">{requesterName} <span className="requester-role">({requesterRole})</span></span>
          </div>
          
          <div className="job-detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value location-text">
              <i className="fas fa-map-marker-alt location-icon"></i> 
              {propertyLocation}
            </span>
          </div>
          
          <div className="job-detail-item">
            <span className="detail-label">Est. Price</span>
            <span className="detail-value price-text">
              {typeof price === 'number' ? `EGP ${price.toLocaleString()}` : price}
            </span>
          </div>
          
          <div className="job-detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value date-text">{dateRequested}</span>
          </div>
        </div>
      </div>

      <div className="job-card-footer">
        <button 
          className="btn-view-details" 
          onClick={() => onViewDetails && onViewDetails(id)}
        >
          View more details
        </button>
      </div>
    </div>
  );
};

export default JobRequestCard;
