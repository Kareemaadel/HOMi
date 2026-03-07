import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const SignUp: React.FC = () => {
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const checkStrength = (value: string) => {
    let score = 0;
    if (value.length > 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'password') {
      checkStrength(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store signup data in sessionStorage to be used in CompleteProfile
    sessionStorage.setItem('signupData', JSON.stringify(formData));
    
    // Navigate to complete profile page where user will select role and complete registration
    navigate("/complete-profile");
  };

  return (
    <form className="form-layout-v2" onSubmit={handleSubmit}>
      <div className="input-row">
        <div className="input-block">
          <User size={18}/>
          <input 
            type="text" 
            name="firstName"
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="input-block">
          <User size={18}/>
          <input 
            type="text"
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <div className="input-block">
        <Mail size={18}/>
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="input-block">
        <PhoneCall size={18}/>
        <input 
          type="tel" 
          name="phone"
          placeholder="Phone Number" 
          value={formData.phone}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="input-block">
        <Lock size={18}/>
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          required 
        />
      </div>

      {/* Strength Indicator */}
      <div className="strength-meter">
        <div className={`strength-fill s-${strength}`} />
      </div>

      <label className="form-extras" style={{ justifyContent: 'flex-start', gap: '10px', cursor: 'pointer' }}>
        <input type="checkbox" required />
        <span>I agree to the <a href="#terms">Terms & Conditions</a></span>
      </label>

      <button type="submit" className="btn-primary-v2">
        <UserPlus size={18}/> 
        <span>Create Account</span>
      </button>
    </form>
  );
};

export default SignUp;