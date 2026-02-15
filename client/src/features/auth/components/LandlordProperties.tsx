import { useState } from 'react';
import { Home, DollarSign, FileText, Bed, Bath, Zap } from 'lucide-react';

export default function LandlordProperties({ onNext }: { onNext:()=>void }) {
  const [property, setProperty] = useState({
    title: '',
    price: '',
    bedrooms: '1',
    bathrooms: '1',
    description: '',
    amenities: [] as string[]
  });

  const amenitiesList = ['WiFi', 'Parking', 'Pool', 'Gym', 'AC', 'Furnished', 'Garden'];

  const handleAmenityToggle = (amenity: string) => {
    setProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const isComplete = property.title && property.price && property.description;

  return (
    <div className="step">
      <h2>🏠 Add Your First Property</h2>
      <p style={{color: '#666', marginBottom: '20px'}}>List your first property to get started</p>
      
      <div className="form-group">
        <label>Property Title *</label>
        <input 
          value={property.title}
          onChange={(e) => setProperty({...property, title: e.target.value})}
          placeholder="e.g., Cozy 2BR Apartment in Downtown" 
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monthly Price (USD) *</label>
          <input 
            value={property.price}
            onChange={(e) => setProperty({...property, price: e.target.value})}
            type="number"
            placeholder="1500" 
          />
        </div>
        <div className="form-group">
          <label>Bedrooms</label>
          <select value={property.bedrooms} onChange={(e) => setProperty({...property, bedrooms: e.target.value})}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </div>
        <div className="form-group">
          <label>Bathrooms</label>
          <select value={property.bathrooms} onChange={(e) => setProperty({...property, bathrooms: e.target.value})}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea 
          value={property.description}
          onChange={(e) => setProperty({...property, description: e.target.value})}
          placeholder="Describe your property, location, and any special features..." 
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Amenities</label>
        <div className="amenities-grid">
          {amenitiesList.map(amenity => (
            <button
              key={amenity}
              onClick={() => handleAmenityToggle(amenity)}
              className={`amenity-btn ${property.amenities.includes(amenity) ? 'active' : ''}`}
              type="button"
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onNext} disabled={!isComplete} className="primary-btn">Finish Setup</button>
    </div>
  );
}
