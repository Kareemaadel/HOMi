import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  FaTimes, FaBed, FaBath, FaParking, FaImage, 
  FaMapMarkerAlt, FaChevronRight, FaChevronLeft, FaCloudUploadAlt, 
  FaRocket, FaCalendarAlt, FaShieldAlt, FaChair, 
  FaMapMarkedAlt, FaCity, FaBuilding, FaLayerGroup,
  FaTools, FaUserTie, FaUserAlt
} from 'react-icons/fa';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// CSS Import
import './AddPropertyModal.css';

// Fix for Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const EGYPT_BOUNDS = L.latLngBounds(
  L.latLng(21.9, 24.6), 
  L.latLng(31.7, 36.9)
);

interface AddPropertyModalProps {
  onClose: () => void;
}

const SearchField = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    const geocoder = L.Control.Geocoder.nominatim();
    // @ts-ignore
    const control = L.Control.geocoder({
      geocoder,
      defaultMarkGeocode: false,
      placeholder: "Search in Egypt...",
    })
      .on('markgeocode', (e: any) => {
        const { center } = e.geocode;
        if (EGYPT_BOUNDS.contains(center)) {
          map.setView(center, 16);
          onLocationSelect(center.lat, center.lng);
        } else {
          alert("Please select a location within Egypt.");
        }
      })
      .addTo(map);
    return () => { map.removeControl(control); };
  }, [map, onLocationSelect]);
  return null;
};

const MapEventsHandler = ({ setPosition, position, onLocationSelect }: any) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setMaxBounds(EGYPT_BOUNDS);
  }, [map]);
  useMapEvents({
    click(e) {
      if (EGYPT_BOUNDS.contains(e.latlng)) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return position === null ? null : <Marker position={[position.lat, position.lng]} />;
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [furnishing, setFurnishing] = useState('Fully Furnished');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [floor, setFloor] = useState('');
  const [parking, setParking] = useState('');
  const [sqft, setSqft] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [streetName, setStreetName] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [unitApt, setUnitApt] = useState('');
  const [aboutProperty, setAboutProperty] = useState('');
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [isMapActive, setIsMapActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Maintenance State
  const [maintenance, setMaintenance] = useState<Record<string, 'landlord' | 'tenant'>>({
    "Structural Repairs": 'landlord',
    "Interior Appliances": 'tenant',
    "Utility Bills": 'tenant',
    "Plumbing": 'landlord',
    "Electrical": 'landlord',
    "HVAC/Air": 'landlord',
    "Pest Control": 'tenant',
    "Exterior Maintenance": 'landlord',
    "Common Areas": 'landlord',
    "Security Systems": 'landlord',
  });

  const amenitiesList = ["Pet Friendly", "Fitness Center", "Swimming Pool", "WiFi Included", "Air Conditioning", "Smart Lock", "Balcony", "Laundry in Unit"];
  const houseRules = ["No Smoking", "Pets Allowed", "Families Only", "Students Allowed", "No Parties", "Couple Friendly", "Work Professionals", "Quiet Hours (10PM-6AM)"];

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imagesToAdd = files.slice(0, 5 - uploadedImages.length);
    const encodedImages = await Promise.all(imagesToAdd.map(readFileAsDataUrl));

    setUploadedImages((prev) => [...prev, ...encodedImages].slice(0, 5));
    event.target.value = '';
  };

  const toggleMaintenance = (type: string, role: 'landlord' | 'tenant') => {
    setMaintenance(prev => ({ ...prev, [type]: role }));
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setPosition({ lat, lng });
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const addr = data.address;
      setCity(addr.city || addr.state || addr.governorate || '');
      setArea(addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '');
    } catch (error) {
      console.error("Geocoding failed", error);
    }
  };

  const handlePublish = () => {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one property image from your device.');
      return;
    }

    const imagesPayload = uploadedImages.map((image, index) => ({
      image_url: image,
      is_main: index === 0,
    }));
    console.log('Prepared images payload for backend:', imagesPayload);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      triggerConfetti();
    }, 1500);
  };

  const loadExampleProperty = () => {
    setTitle('Modern 2BR in Downtown Cairo');
    setPropertyType('Apartment');
    setFurnishing('Fully Furnished');
    setMonthlyPrice('1500');
    setSecurityDeposit('3000');
    setAvailabilityDate('2026-04-01');
    setBeds('2');
    setBaths('2');
    setFloor('5');
    setParking('1');
    setSqft('1200');
    setCity('Cairo');
    setArea('Downtown');
    setStreetName('Tahrir Street');
    setBuildingNumber('3');
    setUnitApt('Apt 12');
    setAboutProperty('Spacious apartment with modern amenities in downtown Cairo.');
    setPosition({ lat: 30.0444, lng: 31.2357 });
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
      <div className={`property-modal-container ${isSuccess ? 'success-mode' : ''} ${step === 4 ? 'wide-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!isSuccess ? (
          <>
            <div className="property-modal-header">
              <div className="header-titles">
                <h2>List New Property</h2>
                <p>Step {step} of 4: {
                  step === 1 ? "Basic Details" : 
                  step === 2 ? "Specifications" : 
                  step === 3 ? "Location Details" : "Responsibility & Finalize"
                }</p>
              </div>
              <button className="example-fill-btn" onClick={loadExampleProperty}>
                Load Example Property
              </button>
              <button className="close-btn" onClick={onClose}><FaTimes /></button>
            </div>

            <div className="modal-progress-bar">
              <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>

            <div className="modal-body-content">
              {step === 1 && (
                <div className="step-view animate-fade-in">
                  <div className="field-group">
                    <label>Property Title</label>
                    <input type="text" placeholder="e.g. Modern Sunset Loft" className="premium-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Type</label>
                      <select className="premium-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Student Room">Student Room</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label><FaChair /> Furnishing</label>
                      <select className="premium-select" value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Monthly Price ($)</label>
                      <input type="number" placeholder="2400" className="premium-input" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label><FaShieldAlt /> Security Deposit ($)</label>
                      <input type="number" placeholder="1000" className="premium-input" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} />
                    </div>
                  </div>
                  <div className="field-group">
                    <label><FaCalendarAlt /> Availability Date</label>
                    <input type="date" className="premium-input" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-view animate-fade-in">
                  <div className="specs-grid">
                    <div className="spec-item"><FaBed /><input type="number" placeholder="Beds" value={beds} onChange={(e) => setBeds(e.target.value)} /></div>
                    <div className="spec-item"><FaBath /><input type="number" placeholder="Baths" value={baths} onChange={(e) => setBaths(e.target.value)} /></div>
                    <div className="spec-item"><FaLayerGroup /><input type="number" placeholder="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} /></div>
                    <div className="spec-item"><FaParking /><input type="number" placeholder="Parking" value={parking} onChange={(e) => setParking(e.target.value)} /></div>
                    <div className="spec-item"><span className="sqft-label">Sqft</span><input type="number" placeholder="Area" value={sqft} onChange={(e) => setSqft(e.target.value)} /></div>
                  </div>
                  <div className="photo-upload-section">
                    <label><FaImage /> Property Photos</label>
                    <div className="upload-grid">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesSelected}
                        style={{ display: 'none' }}
                      />
                      <button type="button" className="upload-placeholder" onClick={handleUploadClick}>
                        <FaCloudUploadAlt />
                        <span>Upload</span>
                      </button>
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="uploaded-photo-slot">
                          <img src={img} alt={`Property ${index + 1}`} />
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 4 - uploadedImages.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="empty-photo-slot"></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-view animate-fade-in">
                  <div className={`map-picker-container ${isMapActive ? 'active-map' : ''}`}>
                    {!isMapActive ? (
                      <div className="map-placeholder">
                        <FaMapMarkedAlt size={40} />
                        {position ? (
                          <div className="coord-badge">
                            Location Set: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                          </div>
                        ) : (
                          <p>Pinpoint the location in Egypt</p>
                        )}
                        <button className="map-trigger-btn" onClick={() => setIsMapActive(true)}>
                          {position ? "Change Location" : "Open Interactive Map"}
                        </button>
                      </div>
                    ) : (
                      <div className="leaflet-wrapper" style={{ height: '300px', width: '100%', position: 'relative' }}>
                        <MapContainer 
                          center={[26.8206, 30.8025]} 
                          zoom={6} 
                          maxBounds={EGYPT_BOUNDS}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <SearchField onLocationSelect={handleLocationSelect} />
                          <MapEventsHandler position={position} onLocationSelect={handleLocationSelect} />
                        </MapContainer>
                        <button className="confirm-map-btn" onClick={() => setIsMapActive(false)}>Confirm Location</button>
                      </div>
                    )}
                  </div>

                  <div className="address-grid-structured">
                    <div className="field-group">
                      <label><FaCity /> City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Cairo" className="premium-input" />
                    </div>
                    <div className="field-group">
                      <label><FaMapMarkerAlt /> Area / Neighborhood</label>
                      <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Maadi" className="premium-input" />
                    </div>
                    <div className="field-group">
                      <label>Street Name</label>
                      <input type="text" placeholder="Street 9" className="premium-input" value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                    </div>
                    <div className="form-row-triple">
                        <div className="field-group">
                            <label><FaBuilding /> Bldg #</label>
                            <input type="text" placeholder="102" className="premium-input" value={buildingNumber} onChange={(e) => setBuildingNumber(e.target.value)} />
                        </div>
                        <div className="field-group">
                            <label>Floor</label>
                            <input type="text" placeholder="12" className="premium-input" value={floor} onChange={(e) => setFloor(e.target.value)} />
                        </div>
                        <div className="field-group">
                            <label>Unit/Apt</label>
                            <input type="text" placeholder="4B" className="premium-input" value={unitApt} onChange={(e) => setUnitApt(e.target.value)} />
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="step-view animate-fade-in step-four-layout">
                  <div className="maintenance-box">
                    <div className="section-header-flex">
                      <FaTools className="header-icon" />
                      <div>
                        <label className="section-subtitle">Maintenance Responsibilities</label>
                        <p className="section-desc">Who handles these tasks?</p>
                      </div>
                    </div>
                    
                    <div className="maintenance-grid">
                      {Object.entries(maintenance).map(([type, assigned]) => (
                        <div key={type} className="maintenance-card">
                          <span className="m-title">{type}</span>
                          <div className="m-toggle-group">
                            <button 
                              className={`m-btn ${assigned === 'landlord' ? 'active landlord' : ''}`}
                              onClick={() => toggleMaintenance(type, 'landlord')}
                            >
                              <FaUserTie /> L
                            </button>
                            <button 
                              className={`m-btn ${assigned === 'tenant' ? 'active tenant' : ''}`}
                              onClick={() => toggleMaintenance(type, 'tenant')}
                            >
                              <FaUserAlt /> T
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="final-details-box">
                    <div className="field-group">
                      <label>About Property</label>
                      <textarea placeholder="Describe the atmosphere..." className="premium-textarea" rows={3} value={aboutProperty} onChange={(e) => setAboutProperty(e.target.value)}></textarea>
                    </div>
                    <div className="dual-grid-section">
                      <div className="grid-col">
                        <label className="section-subtitle">Amenities</label>
                        <div className="chip-container">
                          {amenitiesList.map(item => (
                            <label key={item} className="amenity-chip mini">
                              <input type="checkbox" /> <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid-col">
                        <label className="section-subtitle">House Rules</label>
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
                </div>
              )}
            </div>

            <div className="property-modal-footer">
              {step > 1 ? (
                <button className="btn-secondary" onClick={prevStep}><FaChevronLeft /> Back</button>
              ) : <div />}
              {step < 4 ? (
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
                <h2>Listing Live!</h2>
                <p>Your property is now being shown to thousands of potential tenants.</p>
                <button className="final-close-btn" onClick={onClose}>Done</button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPropertyModal;