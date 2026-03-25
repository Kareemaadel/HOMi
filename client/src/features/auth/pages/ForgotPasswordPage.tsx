import React, { useId, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../../services/auth.service';
import './ForgotPasswordPage.css';

function isValidEmail(value: string) {
  // pragmatic email check (good UX, not RFC-perfect)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const FieldError = ({ id, message }: { id: string; message: string }) => {
  return (
    <p id={id} className="fp-field-error" role="alert">
      {message}
    </p>
  );
};

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const emailInputId = useId();
  const emailErrorId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return null;
    if (!email.trim()) return 'Email is required.';
    if (!isValidEmail(email)) return 'Please enter a valid email address.';
    return null;
  }, [email, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim() || !isValidEmail(email)) return;
    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword({ email });
      console.log('✅ Password reset email sent!', response);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('❌ Password reset failed:', err);
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        errorMessage = data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fp-wrapper">
        <div className="fp-card fp-fade-in">
          <div className="fp-success-icon" aria-hidden="true">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="fp-title">Check your email</h1>
          <p className="fp-subtitle">
            If an account exists for <span className="fp-email">{email}</span>, you’ll receive a reset link shortly.
          </p>

          <button type="button" className="fp-btn-primary" onClick={() => navigate('/auth')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-wrapper">
      <div className="fp-card fp-fade-in">
        <button type="button" onClick={() => navigate('/auth')} className="fp-back-link">
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <header className="fp-header">
          <h1 className="fp-title">Forgot Password</h1>
          <p className="fp-subtitle">Enter your email to receive a reset link.</p>
        </header>

        <form onSubmit={handleSubmit} className="fp-form" noValidate>
          {error && (
            <div className="fp-error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="fp-field">
            <label htmlFor={emailInputId} className="fp-label">
              Email
            </label>

            <div className={`fp-input-wrap ${emailError ? 'has-error' : ''}`}>
              <Mail size={18} className="fp-input-icon" aria-hidden="true" />
              <input
                id={emailInputId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="mail@website.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? emailErrorId : undefined}
                disabled={loading}
              />
            </div>

            {emailError && <FieldError id={emailErrorId} message={emailError} />}
          </div>

          <button type="submit" disabled={loading} className="fp-btn-primary">
            {loading ? (
              <>
                <span className="fp-spinner" aria-hidden="true" />
                Sending…
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

