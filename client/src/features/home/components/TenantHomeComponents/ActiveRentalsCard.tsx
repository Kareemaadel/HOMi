// ActiveRentalsCard.tsx
import './ActiveRentalsCard.css';

const ActiveRentalsCard = () => (
  <div className="card-base rental-card-premium">
    <div className="card-badge-top">Primary Residence</div>
    <div className="rental-main-content">
      <div className="image-container">
        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400" alt="Home" />
        <div className="image-overlay-price">$2,400/mo</div>
      </div>
      <div className="rental-details">
        <h3>Skyline Penthouse B</h3>
        <p className="address">📍 782 Liberty St, New York, NY 10004</p>
        
        <div className="lease-progress-container">
          <div className="lease-meta">
            <span>Lease Progress</span>
            <span>8 months left</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width: '65%'}}></div>
          </div>
        </div>

        <div className="amenities-tags">
          <span>2 Bed</span> <span>3 Bath</span> <span>WiFi Incl.</span>
        </div>
      </div>
    </div>
  </div>
);
export default ActiveRentalsCard;