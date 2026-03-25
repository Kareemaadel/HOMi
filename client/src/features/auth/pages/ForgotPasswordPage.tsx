import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import axios from 'axios';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword({ email });
      console.log('✅ Password reset email sent!', response);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to send reset email. Please try again.'
        : 'Failed to send reset email. Please try again.';
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
              <Mail size={40} className="text-green-400" />
            </div>
          </div>
          <h2 className="text-[28px] font-bold text-white mb-4">Check your email</h2>
          <p className="text-gray-400 text-[15px] mb-8">
            We've sent a password reset link to <span className="text-white font-medium">{email}</span>
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-white text-[#0f172a] text-[15px] font-semibold rounded-none
                     border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-8">
      <div className="w-full max-w-[400px]">
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back to Login</span>
        </button>

        <div className="mb-10">
          <h2 className="text-[28px] font-bold text-white mb-4">Forgot Password?</h2>
          <p className="text-gray-400 text-[15px]">
            No worries! Enter your email address and we'll send you instructions to reset your password.
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
            <label className="block text-gray-400 text-[14px] mb-3">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@website.com"
                className="w-full pl-12 pr-5 py-4 bg-[#1e293b] border border-[#334155] rounded-none 
                         text-[15px] text-gray-300 placeholder-gray-500
                         focus:outline-none focus:border-[#475569] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-[#0f172a] text-[15px] font-semibold rounded-none
                     border border-gray-200 hover:bg-gray-100 transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid #0f172a', 
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
