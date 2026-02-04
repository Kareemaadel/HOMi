// MaintenanceRequests.tsx
import './MaintenanceRequests.css';

const MaintenanceRequests = () => (
  <div className="card-base maintenance-compact">
    <div className="maintenance-header">
      <div className="title-group">
        <h3>Maintenance</h3>
        <span className="request-id">#REQ-992</span>
      </div>
      <button className="view-all-link">View History</button>
    </div>

    <div className="request-card-premium">
      {/* Left Side: Information */}
      <div className="request-main-info">
        <div className="category-icon">🛠️</div>
        <div className="details">
          <p className="subject">Kitchen Faucet Leak</p>
          <div className="tech-assigned">
            <img src="https://i.pravatar.cc/150?u=tech" alt="Worker" />
            <span>Mike Ross is arriving at <strong>2:00 PM</strong></span>
          </div>
        </div>
      </div>

      {/* Right Side: Compact Status Step */}
      <div className="status-container">
        <div className="status-pill-highlight">In Progress</div>
        <div className="mini-steps">
          <div className="m-step done"></div>
          <div className="m-step active"></div>
          <div className="m-step"></div>
        </div>
      </div>
    </div>
  </div>
);

export default MaintenanceRequests;
