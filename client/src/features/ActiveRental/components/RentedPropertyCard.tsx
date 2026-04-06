import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import './RentedPropertyCard.css';

interface RentedPropertyProps {
  property: {
    id: string;
    title: string;
    address: string;
    leaseEnd: string;
    image: string;
    status: 'Active' | 'Expiring Soon' | 'Pending Renewal';
  };
}

const RentedPropertyCard: React.FC<RentedPropertyProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/active-rental?contractId=${encodeURIComponent(property.id)}`);
  };

  return (
    <div className="rented-property-card" onClick={handleDetailsClick}>
      <div className="card-image-wrapper">
        <img src={property.image} alt={property.title} className="property-thumb" />
        <span className={`status-badge ${property.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {property.status}
        </span>
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
    </div>
  );
};

export default RentedPropertyCard;