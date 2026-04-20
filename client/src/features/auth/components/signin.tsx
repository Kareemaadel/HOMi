import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../../services/auth.service';
import type { LoginRequest } from '../../../types/auth.types';
import { passkeyService } from '../../../services/passkey.service';

interface SignInProps {
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  passkeyEnabled?: boolean;
}

const SignIn: React.FC<SignInProps> = ({ rememberMe, onRememberMeChange, passkeyEnabled = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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
      const response = await authService.login({ ...formData, rememberMe });
      
      console.log('✅ Login successful!', response);

      const nextPath = authService.resolvePostAuthRoute(response);
      navigate('/', { state: { next: nextPath, force: true } });
    } catch (err) {
      console.error('❌ Login failed:', err);
      if (axios.isAxiosError(err) && err.response?.data?.code === 'ACCOUNT_BANNED') {
        navigate('/account-banned', { state: err.response.data.details || {} });
        return;
      }
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Login failed. Please check your credentials.'
        : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    setError(null);

    try {
      const restored = await authService.tryRestoreSession();
      if (!restored) {
        setError('No saved secure session found. Sign in with password first, then you can use biometrics next time.');
        return;
      }

      const ok = await passkeyService.authenticateSavedPasskeyForCurrentUser();
      if (!ok) {
        setError('Biometric verification failed. Please try again or use your password.');
        return;
      }

      const nextPath = authService.resolvePostAuthRoute();
      navigate('/', { state: { next: nextPath, force: true } });
    } catch {
      setError('Biometric sign in failed. Please use your password.');
    } finally {
      setPasskeyLoading(false);
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
        <label className="remember-me-label">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            disabled={loading}
          />
          <span className="remember-me-text">Remember me</span>
        </label>
        <a href="/forgot-password" className="auth-forgot-link">Forgot password?</a>
      </div>

      <button type="submit" className="btn-primary-v2" disabled={loading}>
        <LogIn size={18}/> 
        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
      </button>

      {passkeyEnabled && (
        <button
          type="button"
          className="btn-secondary-v2"
          disabled={passkeyLoading || loading}
          onClick={handlePasskeySignIn}
        >
          <span>{passkeyLoading ? 'Verifying fingerprint/Face ID...' : 'Use fingerprint / Face ID'}</span>
        </button>
      )}
    </form>
  );
};

export default SignIn;