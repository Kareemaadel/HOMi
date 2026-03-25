import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';

export const GoogleLoginBtn = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError(null);

            try {
                const googleToken = tokenResponse.access_token;
                const response = await authService.loginWithGoogle(googleToken);

                console.log('✅ Google Login successful!', response);

                if (response.isNewUser) {
                    navigate('/complete-profile');
                } else if (response.user.role === 'TENANT') {
                    navigate('/', { state: { next: '/tenant-home', force: true } });
                } else if (response.user.role === 'LANDLORD') {
                    navigate('/', { state: { next: '/landlord-home', force: true } });
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error('❌ Google Login failed:', err);
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.message || 'Google login failed. Please try again.'
                    : 'Google login failed. Please try again.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.error('❌ Google Login Failed');
            setError('Google login failed. Please try again.');
        },
    });

    return (
        <>
            <button
                onClick={() => loginWithGoogle()}
                disabled={loading}
                type="button"
                className="social-pill"
            >
                {loading ? (
                    <>
                        <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #ccc', 
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <span>Signing in...</span>
                    </>
                ) : (
                    <>
                        <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Google</span>
                    </>
                )}
            </button>

            {error && (
                <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fee', 
                    color: '#c00', 
                    borderRadius: '4px',
                    marginTop: '12px',
                    fontSize: '14px',
                    gridColumn: '1 / -1'
                }}>
                    {error}
                </div>
            )}
        </>
    );
};
