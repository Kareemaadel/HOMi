import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './EmailVerificationPage.css';
import { authService } from '../../../services/auth.service';

const RESEND_COOLDOWN = 60; // seconds

const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const locationState = location.state as { email?: string; role?: string } | null;
    const email: string = locationState?.email || '';
    const targetRole = locationState?.role;

    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);

    // --- AUTOMATIC REDIRECTION LOGIC ---
    useEffect(() => {
        const forceRouteToStep3 = () => {
            console.log("Signal received! Routing to step 3...");
            // Hardcoding the return URL and step to guarantee it goes to the right place
            navigate('/complete-profile', { 
                state: { step: 3, role: targetRole },
                replace: true 
            });
        };

        // 1. BroadcastChannel Listener (Using new secret channel name)
        let bc: BroadcastChannel | null = null;
        if ('BroadcastChannel' in window) {
            bc = new BroadcastChannel('homi_secret_channel');
            bc.onmessage = (event) => {
                if (event.data === 'GO_TO_STEP_3') {
                    forceRouteToStep3();
                }
            };
        }

        // 2. LocalStorage Listener (Using new secret key)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'WAKE_UP_TAB_1_STEP_3' && e.newValue) {
                localStorage.removeItem('WAKE_UP_TAB_1_STEP_3'); 
                forceRouteToStep3();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            if (bc) bc.close();
        };
    }, [navigate, targetRole]);
    // -----------------------------------

    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

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

    return (
        <div className="email-verify-wrapper">
            <div className="email-verify-card">
                <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />

                <h1>Check your inbox</h1>
                <p className="subtitle">We sent a verification link to</p>
                <div className="ev-email-highlight">{email || 'your email address'}</div>

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
                        <span>This page will automatically redirect you to the next step.</span>
                    </div>
                </div>

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

                <p style={{ marginTop: 24, fontSize: 12, color: '#475569' }}>
                    Didn't get the email? Check your spam folder or make sure you used the right address.
                </p>
            </div>
        </div>
    );
};

export default EmailVerificationPage;