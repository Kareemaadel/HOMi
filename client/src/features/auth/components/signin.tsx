import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import type { LoginRequest } from '../../../types/auth.types';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginRequest>({
    identifier: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      
      console.log('✅ Login successful!', response);
      
      // Navigate based on user role
      if (response.user.role === 'TENANT') {
        navigate('/', { state: { next: '/tenant-home', force: true } });
      } else if (response.user.role === 'LANDLORD') {
        navigate('/', { state: { next: '/landlord-home', force: true } });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-layout-v2" onSubmit={handleSubmit}>
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <div className="input-block">
        <Mail size={18} />
        <input 
          type="text" 
          name="identifier"
          placeholder="Email Address or Phone" 
          value={formData.identifier}
          onChange={handleChange}
          disabled={loading}
          required 
        />
      </div>

      <div className="input-block">
        <Lock size={18} />
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
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

      <button type="submit" className="btn-primary-v2" disabled={loading}>
        <LogIn size={18}/> 
        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
      </button>
    </form>
  );
};

export default SignIn;