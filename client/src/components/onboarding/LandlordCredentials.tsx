import { useState } from 'react';
import { Building, Phone, Mail, MapPin } from 'lucide-react';

export default function LandlordCredentials({ onNext }: { onNext:()=>void }) {
  const [formData, setFormData] = useState({
    agencyName: '',
    contactNumber: '',
    email: '',
    location: '',
    yearsOfExperience: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isComplete = formData.agencyName && formData.contactNumber && formData.email && formData.location;

  return (
    <div className="step">
      <h2>🏢 Landlord Information</h2>
      <p style={{color: '#666', marginBottom: '20px'}}>Tell us about your rental business</p>
      
      <div className="form-group">
        <label>Agency/Owner Name *</label>
        <input 
          name="agencyName"
          value={formData.agencyName}
          onChange={handleChange}
          placeholder="Your name or agency name" 
        />
      </div>

      <div className="form-group">
        <label>Contact Number *</label>
        <input 
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          type="tel"
          placeholder="+1 (555) 000-0000" 
        />
      </div>

      <div className="form-group">
        <label>Email Address *</label>
        <input 
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="your@email.com" 
        />
      </div>

      <div className="form-group">
        <label>Primary Location *</label>
        <input 
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country" 
        />
      </div>

      <div className="form-group">
        <label>Years of Experience</label>
        <select name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="0-2">0-2 years</option>
          <option value="2-5">2-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>

      <button onClick={onNext} disabled={!isComplete} className="primary-btn">Next</button>
    </div>
  );
}
