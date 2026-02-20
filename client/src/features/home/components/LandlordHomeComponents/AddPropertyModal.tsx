import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FaTimes, FaBed, FaBath, FaParking, FaTree, FaImage, 
  FaMapMarkerAlt, FaChevronRight, FaChevronLeft, FaCloudUploadAlt, 
  FaCheckCircle, FaRocket, FaCalendarAlt, FaShieldAlt, FaChair, FaGavel 
} from 'react-icons/fa';
import './AddPropertyModal.css';

interface AddPropertyModalProps {
  onClose: () => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const amenitiesList = [
    "Pet Friendly", "Fitness Center", "Swimming Pool", "WiFi Included", 
    "Air Conditioning", "Smart Lock", "Balcony", "Laundry in Unit"
  ];

  const houseRules = [
    "No Smoking", "Pets Allowed", "Families Only", "Students Allowed",
    "No Parties", "Couple Friendly", "Work Professionals", "Quiet Hours (10PM-6AM)"
  ];

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handlePublish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      triggerConfetti();
    }, 1500);
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#2563eb', '#10b981', '#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#2563eb', '#10b981', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  return (
    <div className="property-modal-overlay" onClick={onClose}>
      <div className={`property-modal-container ${isSuccess ? 'success-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!isSuccess ? (
          <>
            <div className="property-modal-header">
              <div className="header-titles">
                <h2>List New Property</h2>
                <p>Step {step} of 3: {step === 1 ? "Basic Details" : step === 2 ? "Specifications" : "Final Touches"}</p>
              </div>
              <button className="close-btn" onClick={onClose}><FaTimes /></button>
            </div>

            <div className="modal-progress-bar">
              <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>

            <div className="modal-body-content">
              {step === 1 && (
                <div className="step-view animate-fade-in">
                  <div className="field-group">
                    <label>Property Title</label>
                    <input type="text" placeholder="e.g. Modern Sunset Loft" className="premium-input" />
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Type</label>
                      <select className="premium-select">
                        <option>Apartment</option>
                        <option>Villa</option>
                        <option>Student Room</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label><FaChair /> Furnishing</label>
                      <select className="premium-select">
                        <option>Fully Furnished</option>
                        <option>Semi-Furnished</option>
                        <option>Unfurnished</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Monthly Price ($)</label>
                      <input type="number" placeholder="2400" className="premium-input" />
                    </div>
                    <div className="field-group">
                      <label><FaShieldAlt /> Security Deposit ($)</label>
                      <input type="number" placeholder="1000" className="premium-input" />
                    </div>
                  </div>
                  <div className="field-group">
                    <label><FaCalendarAlt /> Availability Date</label>
                    <input type="date" className="premium-input" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-view animate-fade-in">
                  <div className="specs-grid">
                    <div className="spec-item"><FaBed /><input type="number" placeholder="Beds" /></div>
                    <div className="spec-item"><FaBath /><input type="number" placeholder="Baths" /></div>
                    <div className="spec-item"><FaTree /><input type="number" placeholder="Floor" /></div>
                    <div className="spec-item"><FaParking /><input type="number" placeholder="Parking" /></div>
                    <div className="spec-item"><span className="sqft-label">Sqft</span><input type="number" placeholder="Area" /></div>
                  </div>
                  <div className="field-group">
                    <label><FaMapMarkerAlt /> Detailed Location</label>
                    <textarea placeholder="Full address and unit number..." className="premium-textarea" rows={2}></textarea>
                  </div>
                  <div className="photo-upload-section">
                    <label><FaImage /> Property Photos</label>
                    <div className="upload-grid">
                      <div className="upload-placeholder"><FaCloudUploadAlt /><span>Upload</span></div>
                      {[1, 2, 3, 4].map(i => <div key={i} className="empty-photo-slot"></div>)}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-view animate-fade-in">
                  <div className="field-group">
                    <label>About Property</label>
                    <textarea placeholder="Describe the atmosphere..." className="premium-textarea" rows={3}></textarea>
                  </div>
                  <div className="dual-grid-section">
                    <div className="grid-col">
                      <label className="section-subtitle"><FaRocket /> Amenities</label>
                      <div className="chip-container">
                        {amenitiesList.map(item => (
                          <label key={item} className="amenity-chip mini">
                            <input type="checkbox" /> <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid-col">
                      <label className="section-subtitle"><FaGavel /> House Rules</label>
                      <div className="chip-container">
                        {houseRules.map(rule => (
                          <label key={rule} className="amenity-chip mini rule">
                            <input type="checkbox" /> <span>{rule}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="property-modal-footer">
              {step > 1 ? (
                <button className="btn-secondary" onClick={prevStep}><FaChevronLeft /> Back</button>
              ) : <div></div>}
              {step < 3 ? (
                <button className="btn-primary" onClick={nextStep}>Continue <FaChevronRight /></button>
              ) : (
                <button className="btn-success" onClick={handlePublish} disabled={loading}>
                  {loading ? <div className="spinner"></div> : <>Publish Property <FaRocket /></>}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="success-animation-view">
            <div className="checkmark-wrapper">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <div className="success-text-content">
              <h2>Property Published!</h2>
              <p>Your listing is now live and visible to potential tenants.</p>
              <button className="final-close-btn" onClick={onClose}>Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPropertyModal;