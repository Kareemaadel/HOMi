import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaChevronRight, FaHome } from 'react-icons/fa';
import './RentedPropertyCard.css';

interface RentedPropertyProps {
  property: {
    id: string;
    title: string;
    address: string;
    leaseEnd: string;
    image: string | null;
    status: 'Active' | 'Expiring Soon' | 'Pending Renewal' | 'Ended';
    latePayments?: boolean;
  };
}

const RentedPropertyCard: React.FC<RentedPropertyProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/active-rental?contractId=${encodeURIComponent(property.id)}`);
  };

  return (
    <button type="button" className="rented-property-card" onClick={handleDetailsClick}>
      <div className="card-image-wrapper">
        {property.image ? (
          <img src={property.image} alt={property.title} className="property-thumb" />
        ) : (
          <div className="property-thumb property-thumb-placeholder" aria-label="Property image unavailable">
            <FaHome />
            <span>No image uploaded</span>
          </div>
        )}
        <span className={`status-badge ${property.status.toLowerCase().replaceAll(' ', '-')}`}>
          {property.status}
        </span>
        {property.latePayments && (
          <span className="status-badge late-payments">Late Payments</span>
        )}
      </div>
      
      <div className="card-body">
        <div className="card-main-info">
          <h3>{property.title}</h3>
          <p className="address-text">
            <FaMapMarkerAlt className="icon-sm" /> {property.address}
          </p>
        </div>

        <div className="card-footer-meta">
          <div className="lease-meta">
            <FaCalendarAlt className="icon-sm" />
            <span>Ends: <strong>{property.leaseEnd}</strong></span>
          </div>
          <button className="view-details-arrow" aria-label="View Details">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </button>
  );
};

export default RentedPropertyCard;