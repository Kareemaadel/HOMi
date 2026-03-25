import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { authService } from '../../services/auth.service';
import './AuthModal.css';

interface AuthModalProps {
    /** Called when the modal should close (user dismissed without logging in) */
    onClose?: () => void;
    /** If false the X close button is hidden — useful for full-page guards */
    closeable?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, closeable = true }) => {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword]     = useState('');
    const [showPwd, setShowPwd]       = useState(false);
    const [loading, setLoading]       = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    // ── Email / Phone + Password login ────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) {
            setError('Please fill in both fields.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authService.login({
                identifier: identifier.trim(),
                password,
                rememberMe,
            });
            // Navigate to the correct home for the role
            if (res.user.role === 'LANDLORD') {
                navigate('/landlord-home', { replace: true });
            } else {
                navigate('/tenant-home', { replace: true });
            }
        } catch (err) {
            let msg = 'Sign in failed. Please check your credentials.';
            if (axios.isAxiosError(err)) {
                const data = err.response?.data;
                if (Array.isArray(data?.errors) && data.errors.length > 0) {
                    msg = data.errors[0].message;
                } else if (data?.message) {
                    msg = data.message;
                }
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Google login ──────────────────────────────────────────────────────────
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError(null);
            try {
                const res = await authService.loginWithGoogle(tokenResponse.access_token, rememberMe);
                if (res.user.role === 'LANDLORD') {
                    navigate('/landlord-home', { replace: true });
                } else {
                    navigate('/tenant-home', { replace: true });
                }
            } catch {
                setError('Google sign-in failed. Please try again.');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => setError('Google sign-in failed. Please try again.'),
    });

    return (
        <div className="auth-modal-overlay" onClick={closeable ? onClose : undefined}>
            <div
                className="auth-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                {closeable && onClose && (
                    <button className="auth-modal-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                )}

                {/* Logo */}
                <div className="auth-modal-logo">
                    <img src="/logo.png" alt="HOMi" />
                </div>

                <h2 className="auth-modal-title">Welcome to HOMi</h2>
                <p className="auth-modal-subtitle">Sign in to continue</p>

                {/* Error */}
                {error && <div className="auth-modal-error">{error}</div>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="auth-modal-field">
                        <label>Email or Phone</label>
                        <input
                            type="text"
                            placeholder="you@example.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-modal-field">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                style={{ paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(v => !v)}
                                style={{
                                    position: 'absolute', right: 14, top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', fontSize: 14, color: '#94a3b8',
                                }}
                                tabIndex={-1}
                            >
                                {showPwd ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <label className="auth-modal-remember" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: 14, color: '#64748b' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading || googleLoading}
                        />
                        Remember me
                    </label>

                    <button
                        type="submit"
                        className="auth-modal-submit"
                        disabled={loading || googleLoading}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-modal-divider">or</div>

                {/* Google */}
                <button
                    className="auth-modal-google"
                    onClick={() => loginWithGoogle()}
                    disabled={loading || googleLoading}
                >
                    {googleLoading ? (
                        <span>Signing in…</span>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                {/* Sign up link */}
                <div className="auth-modal-footer">
                    Don't have an account?{' '}
                    <button onClick={() => navigate('/auth')}>Create one free</button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
