import React from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

const SignIn: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic here
  };

  return (
    <form className="form-layout-v2" onSubmit={handleSubmit}>
      <div className="input-block">
        <Mail size={18} />
        <input 
          type="email" 
          placeholder="Email Address" 
          required 
        />
      </div>

      <div className="input-block">
        <Lock size={18} />
        <input 
          type="password" 
          placeholder="Password" 
          required 
        />
      </div>

      <div className="form-extras">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" /> 
          <span>Remember me</span>
        </label>
        <a href="#forgot">Forgot password?</a>
      </div>

      <button type="submit" className="btn-primary-v2">
        <LogIn size={18}/> 
        <span>Sign In</span>
      </button>
    </form>
  );
};

export default SignIn;