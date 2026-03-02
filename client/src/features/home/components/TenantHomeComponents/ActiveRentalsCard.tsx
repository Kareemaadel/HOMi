import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaWifi, FaBed, FaBath, FaArrowRight } from 'react-icons/fa';
import './ActiveRentalsCard.css';
import { useNavigate } from 'react-router-dom';



interface RentalSpecs {
  label: string;
  icon: React.ReactNode;
}

const ActiveRentalsCard: React.FC = () => {
  const leaseProgress = 65; 
  
  const specs: RentalSpecs[] = [
    { label: "2 Bed", icon: <FaBed /> },
    { label: "3 Bath", icon: <FaBath /> },
    { label: "WiFi Incl.", icon: <FaWifi /> },
  ];

    const navigate = useNavigate();
  
    const handleDetailsClick = () => {
      // Navigate exactly to /active-properties as requested
      navigate('/active-properties');
    };

  return (
    <div className="card-base rental-card-premium">
      <div className="ribbon-wrapper">
        <span className="ribbon-text">Primary Residence</span>
      </div>

      <div className="rental-grid">
        {/* Left: Media Section */}
        <div className="rental-media">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600" 
            alt="Skyline Penthouse" 
            className="rental-img"
          />
          <div className="rental-price-tag">
            <span className="price-amt">$2,400</span>
            <span className="price-unit">/mo</span>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="rental-info">
          <div className="rental-top-content">
            <header className="rental-header">
              <h3 className="rental-title">Skyline Penthouse B</h3>
              <p className="rental-address">
                <FaMapMarkerAlt className="icon-subtle" /> 782 Liberty St, New York, NY
              </p>
            </header>

            <div className="lease-section">
              <div className="lease-header">
                <div className="lease-label">
                  <FaCalendarAlt /> Lease Progress
                </div>
                <span className="lease-remaining">8 months left</span>
              </div>
              <div className="progress-container">
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${leaseProgress}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <span className="progress-pct">{leaseProgress}%</span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Specs + Manage Button */}
          <footer className="rental-footer">
            <div className="specs-row">
              {specs.map((spec, index) => (
                <div key={index} className="spec-tag">
                  <span className="spec-icon">{spec.icon}</span>
                  <span>{spec.label}</span>
                </div>
              ))}
            </div>
            
            <button className="btn-manage-circle" title="Manage Rental" onClick={handleDetailsClick}>
              <FaArrowRight />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ActiveRentalsCard;