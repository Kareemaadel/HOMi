import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../../services/auth.service';

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
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-8">
        <div className="w-full max-w-[400px] text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
          </div>
          <h2 className="text-[28px] font-bold text-white mb-4">Password Reset!</h2>
          <p className="text-gray-400 text-[15px] mb-8">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-8">
      <div className="w-full max-w-[400px]">
        <div className="mb-10">
          <h2 className="text-[28px] font-bold text-white mb-4">Reset Password</h2>
          <p className="text-gray-400 text-[15px]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div className="mb-6">
            <label className="block text-gray-400 text-[14px] mb-3">New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full pl-12 pr-12 py-4 bg-[#1e293b] border border-[#334155] rounded-none 
                         text-[15px] text-gray-300 placeholder-gray-500
                         focus:outline-none focus:border-[#475569] transition-colors"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-400 text-[14px] mb-3">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full pl-12 pr-12 py-4 bg-[#1e293b] border border-[#334155] rounded-none 
                         text-[15px] text-gray-300 placeholder-gray-500
                         focus:outline-none focus:border-[#475569] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-[#0f172a] text-[15px] font-semibold rounded-none
                     border border-gray-200 hover:bg-gray-100 transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
