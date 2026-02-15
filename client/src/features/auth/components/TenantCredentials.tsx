import { useState } from 'react';
import { DollarSign, MapPin, Home, Users } from 'lucide-react';

export default function TenantCredentials({ onNext }: { onNext:()=>void }) {
  const [preferences, setPreferences] = useState({
    budgetMin: '',
    budgetMax: '',
    city: '',
    propertyType: '',
    moveInDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const isComplete = preferences.budgetMin && preferences.budgetMax && preferences.city && preferences.propertyType;

  return (
    <div className="step">
      <h2>🔍 Your Rental Preferences</h2>
      <p style={{color: '#666', marginBottom: '20px'}}>Help us find the perfect home for you</p>
      
      <div className="form-group">
        <label>Budget Range (USD) *</label>
        <div className="form-row">
          <input 
            name="budgetMin"
            value={preferences.budgetMin}
            onChange={handleChange}
            type="number"
            placeholder="Min: 500" 
          />
          <input 
            name="budgetMax"
            value={preferences.budgetMax}
            onChange={handleChange}
            type="number"
            placeholder="Max: 2000" 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Preferred City *</label>
        <input 
          name="city"
          value={preferences.city}
          onChange={handleChange}
          placeholder="e.g., New York, Los Angeles" 
        />
      </div>

      <div className="form-group">
        <label>Property Type *</label>
        <select name="propertyType" value={preferences.propertyType} onChange={handleChange}>
          <option value="">Select property type...</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="shared">Shared Room</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div className="form-group">
        <label>Move-in Date</label>
        <input 
          name="moveInDate"
          value={preferences.moveInDate}
          onChange={handleChange}
          type="date"
        />
      </div>

      <button onClick={onNext} disabled={!isComplete} className="primary-btn">Next</button>
    </div>
  );
}
