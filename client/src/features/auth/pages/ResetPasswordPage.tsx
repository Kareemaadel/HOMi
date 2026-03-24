// client/src/features/auth/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios'; // Added axios import to fix your existing type error
import { authService } from '../../../services/auth.service';
import './ResetPasswordPage.css'; // Importing our new custom CSS

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: formData.password,
      });
      console.log('✅ Password reset successful!', response);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Password reset failed. The link may have expired.'
        : 'Password reset failed. The link may have expired.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-auth-wrapper">
        <div className="reset-auth-card text-center">
          <div className="reset-success-icon-wrapper">
            <CheckCircle2 size={48} className="reset-success-icon" />
          </div>
          <h2 className="reset-title">Password Reset!</h2>
          <p className="reset-subtitle">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-auth-wrapper">
      <div className="reset-auth-card">
        <div className="reset-header">
          <h2 className="reset-title">Reset Password</h2>
          <p className="reset-subtitle">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-form">
          {error && (
            <div className="reset-error-banner">
              {error}
            </div>
          )}

          <div className="reset-input-group">
            <label>New Password</label>
            <div className="reset-input-wrapper">
              <div className="reset-input-icon left">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="reset-input-icon right"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="reset-input-group">
            <label>Confirm Password</label>
            <div className="reset-input-wrapper">
              <div className="reset-input-icon left">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="reset-input-icon right"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="reset-submit-btn"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;