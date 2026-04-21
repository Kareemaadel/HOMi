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
}

const SignIn: React.FC<SignInProps> = ({ rememberMe, onRememberMeChange }) => {
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
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ ...formData, rememberMe });

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

  const identifierTrimmed = formData.identifier.trim();
  const canTryPasskey = identifierTrimmed.length > 0 && passkeyService.isSupported();

  const handlePasskeySignIn = async () => {
    if (!identifierTrimmed) {
      setError('Enter your email or phone first.');
      return;
    }

    setPasskeyLoading(true);
    setError(null);

    try {
      await passkeyService.authenticateWithPasskey(identifierTrimmed, rememberMe);
      const nextPath = authService.resolvePostAuthRoute();
      navigate('/', { state: { next: nextPath, force: true } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.code === 'NO_PASSKEYS') {
        setError('No passkey is registered for this account. Sign in with your password and enable biometrics in Settings.');
        return;
      }
      if (axios.isAxiosError(err) && err.response?.data?.code === 'INVALID_CREDENTIALS') {
        setError('Account not found for this email or phone.');
        return;
      }
      const msg =
        err instanceof Error ? err.message : 'Passkey sign-in failed. Use your password or try again.';
      setError(msg);
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

      {canTryPasskey && (
        <button
          type="button"
          className="btn-secondary-v2"
          disabled={passkeyLoading || loading}
          onClick={handlePasskeySignIn}
        >
          <span>{passkeyLoading ? 'Verifying fingerprint / Face ID...' : 'Use fingerprint / Face ID'}</span>
        </button>
      )}
    </form>
  );
};

export default SignIn;
