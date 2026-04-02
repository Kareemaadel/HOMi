// client\src\features\MyProperties\components\ManagePropertyModal.tsx
import React, { useState, useMemo } from 'react';
import { 
  FaTimes, FaSave, FaTrashAlt, FaHome, FaDollarSign, 
  FaClipboardList, FaImages, FaExclamationTriangle,
  FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaShieldAlt, FaCheckCircle, FaWrench
} from 'react-icons/fa';
import './ManagePropertyModal.css';

interface ManagePropertyModalProps {
  property: any;
  onClose: () => void;
  initialTab?: string;
}

const ManagePropertyModal: React.FC<ManagePropertyModalProps> = ({ property, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'general');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 1. Initial State for Comparison (Dirty Checking)
  // Included the full 10-item maintenance list here
  const initialState = useMemo(() => ({
    name: property.name || '',
    price: property.price?.toString().replace(/[^0-9]/g, '') || '',
    address: property.address || '',
    status: property.status === 'published' ? 'available' : property.status === 'rented' ? 'rented' : 'maintenance',
    beds: property.beds || 0,
    baths: property.baths || 0,
    sqft: property.sqft || 0,
    maintenance: property.maintenance || {
        structural: 'Landlord',
        appliances: 'Tenant',
        utilities: 'Tenant',
        plumbing: 'Landlord',
        electrical: 'Landlord',
        hvac: 'Landlord',
        pest: 'Tenant',
        exterior: 'Landlord',
        common: 'Landlord',
        security: 'Landlord'
    }
  }), [property]);

  // 2. Form State
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 3. Logic to check if any data has changed (Dirty State)
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  }, [formData, initialState]);

  // 4. Validation Logic
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Property name is required";
    if (!formData.address.trim()) newErrors.address = "Address cannot be empty";
    if (Number(formData.price) < 100) newErrors.price = "Rent must be at least $100";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      if (errors.name || errors.address) setActiveTab('general');
      else if (errors.price) setActiveTab('financials');
      return;
    }

    setLoading(true);
    try {
      import('../../../services/property.service').then(async ({ propertyService }) => {
        let backendStatus = 'Draft';
        if (formData.status === 'available') backendStatus = 'Published';
        if (formData.status === 'rented') backendStatus = 'Rented';

        const payload = {
          title: formData.name,
          address: formData.address,
          monthly_price: Number(formData.price),
          status: backendStatus,
          specifications: {
            bedrooms: formData.beds,
            bathrooms: formData.baths,
            area_sqft: formData.sqft
          }
        };

        const res = await propertyService.updateProperty(property.id, payload);
        if (res.success) {
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            if (property.onUpdate) {
              property.onUpdate();
            }
            onClose();
          }, 2000);
        }
      }).catch(err => console.error("Error loading service", err));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper dictionary for clean display names
  const maintenanceDisplayNames: Record<string, string> = {
      structural: 'Structural Repairs', appliances: 'Interior Appliances', 
      utilities: 'Utility Bills', plumbing: 'Plumbing', 
      electrical: 'Electrical', hvac: 'HVAC / Air', 
      pest: 'Pest Control', exterior: 'Exterior Maintenance', 
      common: 'Common Areas', security: 'Security Systems'
  };

  return (
    <div className="manage-modal-overlay" onClick={onClose}>
      <div className="manage-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className={`success-toast ${showToast ? 'show' : ''}`}>
           <FaCheckCircle /> <span>Changes saved successfully!</span>
        </div>

        <aside className="manage-modal-sidebar">
          <div className="sidebar-header">
            <div className="property-mini-avatar"><FaHome /></div>
            <div>
              <h3>Unit Manager</h3>
              <p>v2.4.0</p>
            </div>
          </div>
          
          <nav className="manage-nav">
            <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
              <FaHome /> General Info { (errors.name || errors.address) && <span className="err-dot" /> }
            </button>
            <button className={activeTab === 'financials' ? 'active' : ''} onClick={() => setActiveTab('financials')}>
              <FaDollarSign /> Pricing & Deposit { errors.price && <span className="err-dot" /> }
            </button>
            <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>
              <FaClipboardList /> Rules & Perks
            </button>
            <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>
              <FaImages /> Media Assets
            </button>
            <button className={activeTab === 'maintenance' ? 'active' : ''} onClick={() => setActiveTab('maintenance')}>
              <FaWrench /> Maintenance Details
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="delete-property-btn"><FaTrashAlt /> Delete Listing</button>
          </div>
        </aside>

        <main className="manage-modal-main">
          <header className="main-header">
            <div className="header-text">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}</h2>
              <p>Property ID: <span className="id-badge">#PRP-{property.id || '9921'}</span></p>
            </div>
            <button className="close-circle-btn" onClick={onClose}><FaTimes /></button>
          </header>

          <div className="manage-content-scroll">
            
            {/* --- GENERAL INFO TAB --- */}
            {activeTab === 'general' && (
              <div className="manage-view animate-fade-in">
                <div className="manage-card-group">
                  <div className={`manage-field ${errors.name ? 'has-error' : ''}`}>
                    <label>Property Marketing Title</label>
                    <div className="m-input-with-icon">
                      <FaHome className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="m-input" 
                      />
                    </div>
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>

                  <div className="manage-grid-2">
                    <div className="manage-field">
                      <label>Status</label>
                      <select 
                        className="m-select" 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="manage-field">
                      <label>Furnishing</label>
                      <select className="m-select">
                        <option>Fully Furnished</option>
                        <option>Semi-Furnished</option>
                        <option>Unfurnished</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`manage-card-group ${errors.address ? 'has-error' : ''}`}>
                  <label className="group-label"><FaMapMarkerAlt /> Location Details</label>
                  <textarea 
                    className="m-textarea" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                  {errors.address && <span className="error-msg">{errors.address}</span>}
                </div>

                <div className="manage-card-group specs-edit-row">
                   <div className="mini-spec">
                      <FaBed />
                      <input type="number" value={formData.beds} onChange={(e) => setFormData({...formData, beds: Number(e.target.value)})} />
                   </div>
                   <div className="mini-spec">
                      <FaBath />
                      <input type="number" value={formData.baths} onChange={(e) => setFormData({...formData, baths: Number(e.target.value)})} />
                   </div>
                   <div className="mini-spec">
                      <FaRulerCombined />
                      <input type="number" value={formData.sqft} onChange={(e) => setFormData({...formData, sqft: Number(e.target.value)})} />
                   </div>
                </div>
              </div>
            )}

            {/* --- PRICING TAB --- */}
            {activeTab === 'financials' && (
              <div className="manage-view animate-fade-in">
                <div className="financial-card-status">
                   <FaExclamationTriangle />
                   <p>Adjustments reflect in real-time on all public channels.</p>
                </div>
                
                <div className="financial-display-grid">
                  <div className={`price-input-wrapper ${errors.price ? 'has-error' : ''}`}>
                    <label>Monthly Rent</label>
                    <div className="input-row">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                      <span className="period">/mo</span>
                    </div>
                    {errors.price && <span className="error-msg">{errors.price}</span>}
                  </div>
                  <div className="price-input-wrapper">
                    <label>Security Deposit</label>
                    <div className="input-row">
                      <span className="currency-symbol">$</span>
                      <input type="number" defaultValue={1200} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- RULES TAB --- */}
            {activeTab === 'rules' && (
              <div className="manage-view animate-fade-in">
                 <div className="manage-card-group">
                    <h4 className="section-subtitle">Core Amenities</h4>
                    <div className="selection-grid">
                        {['WiFi Included', 'Swimming Pool', 'Gym Access', 'Smart Lock', 'Pet Friendly'].map(perk => (
                          <label key={perk} className="selection-card">
                            <input type="checkbox" defaultChecked={perk === 'WiFi Included'} />
                            <div className="indicator"></div>
                            <span>{perk}</span>
                          </label>
                        ))}
                    </div>
                 </div>
              </div>
            )}

            {/* --- MEDIA TAB --- */}
            {activeTab === 'media' && (
              <div className="manage-view animate-fade-in">
                <div className="manage-card-group">
                   <div className="media-manager-header">
                      <label>Property Gallery</label>
                      <span>{property.images?.length || 1} / 10 Photos</span>
                   </div>
                   <div className="media-manager-grid">
                      {property.images && property.images.length > 0 ? (
                        property.images.map((img: any, idx: number) => (
                           <div className="media-card" key={img.id || idx}>
                             <img src={img.image_url || img.imageUrl} alt="Property" />
                             <div className="remove-overlay"><FaTrashAlt /></div>
                           </div>
                        ))
                      ) : (
                        <div className="media-card">
                          <img src="/rentblue.jpg" alt="Property" />
                          <div className="remove-overlay"><FaTrashAlt /></div>
                        </div>
                      )}
                      <div className="add-media-btn">
                        <FaImages size={24} />
                        <span>Upload New</span>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* --- MAINTENANCE TAB (EDITABLE & SCROLLABLE) --- */}
            {activeTab === 'maintenance' && (
                <div className="manage-view animate-fade-in">
                    <div className="manage-card-group">
                        <p className="section-instruction" style={{marginBottom: '12px', fontSize: '0.9rem', color: '#64748b'}}>
                            Assign who is financially and physically responsible for the following items. This will be publicly visible to applicants.
                        </p>
                        <div className="responsibility-box scrollable">
                            {Object.entries(formData.maintenance).map(([key, value]) => (
                                <div className="resp-row" key={key}>
                                    <span>{maintenanceDisplayNames[key]}</span>
                                    <select 
                                        className="m-select compact"
                                        style={{ width: '120px', padding: '6px', fontSize: '0.85rem' }}
                                        value={value as string}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            maintenance: { ...formData.maintenance, [key]: e.target.value }
                                        })}
                                    >
                                        <option value="Landlord">Landlord</option>
                                        <option value="Tenant">Tenant</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

          </div>

          <footer className="main-footer">
             <button 
                className="m-btn-cancel" 
                onClick={() => setFormData(initialState)} 
                disabled={!isDirty || loading}
             >
                Discard Changes
             </button>
             <button 
                className="m-btn-save" 
                onClick={handleUpdate} 
                disabled={!isDirty || loading}
             >
                {loading ? <div className="spinner-mini"></div> : <><FaSave /> Save Changes</>}
             </button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ManagePropertyModal;