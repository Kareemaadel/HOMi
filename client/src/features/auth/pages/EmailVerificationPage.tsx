import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './EmailVerificationPage.css';
import { authService } from '../../../services/auth.service';

const RESEND_COOLDOWN = 60; // seconds

const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Email comes via navigation state: navigate('/verify-email', { state: { email } })
    const email: string = (location.state as { email?: string })?.email || '';

    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const [resendError, setResendError] = useState<string | null>(null);

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        setResendError(null);
        try {
            await authService.sendVerificationEmail();
            setResent(true);
            setCanResend(false);
            setCountdown(RESEND_COOLDOWN);
            setTimeout(() => setResent(false), 4000);
        } catch {
            setResendError('Failed to send email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleContinue = () => {
        // Skip verification — navigate to the home page
        // The backend allows unverified users to access most features
        navigate('/');
    };

    return (
        <div className="email-verify-wrapper">
            <div className="email-verify-card">
                {/* Icon */}
                <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />

                <h1>Check your inbox</h1>
                <p className="subtitle">We sent a verification link to</p>
                <div className="ev-email-highlight">{email || 'your email address'}</div>

                {/* Steps */}
                <div className="ev-steps">
                    <div className="ev-step">
                        <div className="ev-step-num">1</div>
                        <span>Open your email inbox and look for a message from <strong>HOMi</strong></span>
                    </div>
                    <div className="ev-step">
                        <div className="ev-step-num">2</div>
                        <span>Click the <strong>"Verify Email"</strong> button inside the email</span>
                    </div>
                    <div className="ev-step">
                        <div className="ev-step-num">3</div>
                        <span>You'll be redirected back to HOMi automatically</span>
                    </div>
                </div>

                {/* Resend button */}
                {resent ? (
                    <div className="ev-success">
                        <div className="ev-success-icon"><CheckCircle size={32} /></div>
                        <p style={{ color: '#4ade80', fontWeight: 600, fontSize: 14 }}>
                            Verification email sent again!
                        </p>
                    </div>
                ) : (
                    <>
                        <button
                            className="ev-btn-primary"
                            onClick={handleResend}
                            disabled={!canResend || resending}
                        >
                            {resending ? 'Sending…' : 'Resend verification email'}
                        </button>

                        {resendError && (
                            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                                {resendError}
                            </p>
                        )}

                        {!canResend && (
                            <p className="ev-timer">
                                Resend available in&nbsp;
                                <span className="ev-countdown">{countdown}s</span>
                            </p>
                        )}
                    </>
                )}

                {/* Skip */}
                <button className="ev-btn-secondary" onClick={handleContinue}>
                    Skip for now, continue to HOMi
                </button>

                <p style={{ marginTop: 20, fontSize: 12, color: '#475569' }}>
                    Didn't get the email? Check your spam folder or make sure you used the right address.
                </p>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
