import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import './EmailVerificationPage.css';
import { authService } from '../../../services/auth.service';

const RESEND_COOLDOWN = 60; // seconds

type LocationState = {
    email?: string;
    role?: string;
    returnUrl?: string;
    step?: number;
} | null;

const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token')?.trim() || null;

    const locationState = location.state as LocationState;

    const resolveRoleForStep3 = useCallback((): 'tenant' | 'landlord' => {
        const r = (locationState?.role ?? '').toString().toLowerCase();
        if (r === 'landlord') return 'landlord';
        if (r === 'tenant') return 'tenant';
        const cr = authService.getCurrentUser()?.user?.role?.toUpperCase();
        return cr === 'LANDLORD' ? 'landlord' : 'tenant';
    }, [locationState?.role]);

    const displayEmail = useMemo(() => {
        const fromNav = locationState?.email;
        if (fromNav) return fromNav;
        try {
            const cached = authService.getCurrentUser();
            return cached?.user?.email || '';
        } catch {
            return '';
        }
    }, [locationState?.email]);

    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);

    const [verifyPhase, setVerifyPhase] = useState<'idle' | 'loading' | 'success' | 'error'>(() =>
        searchParams.get('token')?.trim() ? 'loading' : 'idle'
    );
    const [verifyError, setVerifyError] = useState<string | null>(null);

    useEffect(() => {
        if (!tokenFromUrl) return;

        let cancelled = false;
        setVerifyPhase('loading');
        setVerifyError(null);

        (async () => {
            try {
                await authService.verifyEmail(tokenFromUrl);
                if (cancelled) return;

                if (authService.isAuthenticated()) {
                    try {
                        await authService.getProfile();
                    } catch {
                        // New device / expired JWT — email is still verified server-side
                    }
                }

                if (cancelled) return;
                setVerifyPhase('success');

                // Wakes other tabs only (StorageEvent does not fire in this tab).
                localStorage.setItem('WAKE_UP_TAB_1_STEP_3', Date.now().toString());

                navigate('/verify-email', { replace: true, state: location.state });
            } catch (err) {
                if (cancelled) return;

                const errData =
                    axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
                        ? (err.response.data as { code?: string; message?: string })
                        : undefined;

                if (errData?.code === 'INVALID_VERIFICATION_TOKEN' && authService.isAuthenticated()) {
                    try {
                        const { user } = await authService.getProfile();
                        if (user.emailVerified) {
                            setVerifyPhase('success');
                            localStorage.setItem('WAKE_UP_TAB_1_STEP_3', Date.now().toString());
                            navigate('/verify-email', { replace: true, state: location.state });
                            return;
                        }
                    } catch {
                        /* fall through to error UI */
                    }
                }

                setVerifyPhase('error');
                let msg =
                    'This link is invalid or has expired. You can request a new verification email below.';
                if (errData?.message) msg = errData.message;
                setVerifyError(msg);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [tokenFromUrl, navigate, location.state]);

    useEffect(() => {
        const forceRouteToStep3 = () => {
            navigate('/complete-profile', {
                state: { step: 3, role: resolveRoleForStep3() },
                replace: true,
            });
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'WAKE_UP_TAB_1_STEP_3' && e.newValue) {
                localStorage.removeItem('WAKE_UP_TAB_1_STEP_3');
                forceRouteToStep3();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate, resolveRoleForStep3]);

    /** After a successful verify-from-link flow, continue to complete profile step 3 automatically. */
    useEffect(() => {
        if (verifyPhase !== 'success') return;

        const t = window.setTimeout(() => {
            navigate('/complete-profile', {
                replace: true,
                state: { step: 3, role: resolveRoleForStep3() },
            });
        }, 1600);

        return () => window.clearTimeout(t);
    }, [verifyPhase, navigate, resolveRoleForStep3]);

    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
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

    const handleContinueProfile = () => {
        navigate('/complete-profile', {
            state: { step: 3, role: resolveRoleForStep3() },
            replace: false,
        });
    };

    if (verifyPhase === 'loading') {
        return (
            <div className="email-verify-wrapper">
                <div className="email-verify-card">
                    <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />
                    <Loader2
                        size={48}
                        color="#2563eb"
                        style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}
                    />
                    <h1>Verifying your email…</h1>
                    <p className="subtitle">Please wait a moment while we confirm your address.</p>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (verifyPhase === 'success') {
        return (
            <div className="email-verify-wrapper">
                <div className="email-verify-card">
                    <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />

                    <h1>Check your inbox</h1>
                    <p className="subtitle">We sent a verification link to</p>
                    <div className="ev-email-highlight">{displayEmail || 'your email address'}</div>

                    <div className="ev-success" style={{ marginBottom: 24 }}>
                        <div className="ev-success-icon">
                            <CheckCircle size={40} />
                        </div>
                        <p style={{ color: '#15803d', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                            Your account is now verified
                        </p>
                        <p style={{ color: '#475569', fontSize: '0.95rem', margin: '8px 0 0', lineHeight: 1.5 }}>
                            You can continue the Complete profile flow from step 3.
                        </p>
                    </div>

                    <button type="button" className="ev-btn-primary" onClick={handleContinueProfile}>
                        Continue complete profile
                    </button>
                </div>
            </div>
        );
    }

    if (verifyPhase === 'error') {
        return (
            <div className="email-verify-wrapper">
                <div className="email-verify-card">
                    <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />

                    <h1>Check your inbox</h1>
                    <p className="subtitle">We sent a verification link to</p>
                    <div className="ev-email-highlight">{displayEmail || 'your email address'}</div>

                    <div
                        style={{
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid rgba(248, 113, 113, 0.25)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <XCircle size={40} color="#dc2626" />
                        <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>Could not verify</p>
                        <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                            {verifyError}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ev-btn-primary"
                        onClick={handleResend}
                        disabled={!canResend || resending}
                    >
                        {resending ? 'Sending…' : 'Resend verification email'}
                    </button>
                    {!canResend && (
                        <p className="ev-timer">
                            Resend available in&nbsp;
                            <span className="ev-countdown">{countdown}s</span>
                        </p>
                    )}
                    {resendError && (
                        <p style={{ color: '#f87171', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                            {resendError}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="email-verify-wrapper">
            <div className="email-verify-card">
                <img src="/logo.png" alt="HOMi logo" className="ev-logo-image" />

                <h1>Check your inbox</h1>
                <p className="subtitle">We sent a verification link to</p>
                <div className="ev-email-highlight">{displayEmail || 'your email address'}</div>

                <div className="ev-steps">
                    <div className="ev-step">
                        <div className="ev-step-num">1</div>
                        <span>
                            Open your email inbox and look for a message from <strong>HOMi</strong>
                        </span>
                    </div>
                    <div className="ev-step">
                        <div className="ev-step-num">2</div>
                        <span>
                            Click the <strong>&quot;Verify My Email&quot;</strong> button inside the email
                        </span>
                    </div>
                    <div className="ev-step">
                        <div className="ev-step-num">3</div>
                        <span>
                            You&apos;ll return here; this page will show when your account is verified.
                        </span>
                    </div>
                </div>

                {resent ? (
                    <div className="ev-success">
                        <div className="ev-success-icon">
                            <CheckCircle size={32} />
                        </div>
                        <p style={{ color: '#4ade80', fontWeight: 600, fontSize: 14 }}>
                            Verification email sent again!
                        </p>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
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
                    Didn&apos;t get the email? Check your spam folder or make sure you used the right address.
                </p>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
