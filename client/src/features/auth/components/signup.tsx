import { Mail, Lock, User, UserPlus, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';

const SignUp = () => {
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();

  const checkStrength = (value: string) => {
    let score = 0;
    if (value.length > 5) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Call your backend / Firebase signup here

    // After successful account creation:
    navigate("/complete-profile");
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="floating-group">
          <User size={18}/>
          <input type="text" required placeholder=" " />
          <label>First name</label>
        </div>
        <div className="floating-group">
          <User size={18}/>
          <input type="text" required placeholder=" " />
          <label>Last name</label>
        </div>
      </div>

      <div className="floating-group">
        <Mail size={18}/>
        <input type="email" required placeholder=" " />
        <label>Email</label>
      </div>

     <div className="floating-group">
        <PhoneCall size={18}/>
        <input type="tel" required placeholder=" " />
        <label>Phone Number</label>
     </div>

      <div className="floating-group">
        <Lock size={18}/>
        <input
          type="password"
          onChange={(e)=>checkStrength(e.target.value)}
          required
          placeholder=" "
        />
        <label>Password</label>
      </div>

      <div className="strength-bar">
        <div className={`strength strength-${strength}`} />
      </div>

      <div className="floating-group">
        <Lock size={18}/>
        <input type="password" required placeholder=" " />
        <label>Confirm Password</label>
      </div>

      <label className="terms">
        <input type="checkbox" required /> I agree to Terms
      </label>

      <button type="submit" className="primary-btn ripple">
        <UserPlus size={18}/> Create Account
      </button>
    </form>
  );
};

export default SignUp;
