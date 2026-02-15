// interface SignInProps {
//   onToggle: () => void;
// }
import {  Mail, Lock, LogIn, User, UserPlus } from 'lucide-react';
import './signin.css';

const SignIn = () => 
    {
  return (
    
    <form className="form">
        
      <div className="floating-group">
        <Mail size={18} />
        <input type="email" required />
        <label>Email address</label>
      </div>

      <div className="floating-group">
        <Lock size={18} />
        <input type="password" required />
        <label>Password</label>
      </div>

      <div className="form-options">
        <label><input type="checkbox" /> Remember me</label>
        <a href="#">  Forgot password?</a>
      </div>

      <button type="submit" className="primary-btn ripple">
        <LogIn size={18}/> Sign In
      </button>
    </form>
  );
};

export default SignIn;