import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();

  const checkStrength = (value: string) => {
    let score = 0;
    if (value.length > 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/complete-profile");
  };

  return (
    <form className="form-layout-v2" onSubmit={handleSubmit}>
      <div className="input-row">
        <div className="input-block">
          <User size={18}/>
          <input type="text" placeholder="First Name" required />
        </div>
        <div className="input-block">
          <User size={18}/>
          <input type="text" placeholder="Last Name" required />
        </div>
      </div>

      <div className="input-block">
        <Mail size={18}/>
        <input type="email" placeholder="Email" required />
      </div>

      <div className="input-block">
        <PhoneCall size={18}/>
        <input type="tel" placeholder="Phone Number" required />
      </div>

      <div className="input-block">
        <Lock size={18}/>
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => checkStrength(e.target.value)}
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