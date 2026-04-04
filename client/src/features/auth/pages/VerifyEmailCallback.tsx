import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmailCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); 
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verifyUserEmail = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                // Confirm the email via backend
                await authService.verifyEmail(token); 
                setStatus('success');

                // Send signal to other tab to proceed to step 3
                localStorage.setItem('WAKE_UP_TAB_1_STEP_3', Date.now().toString());
                if ('BroadcastChannel' in window) {
                    const bc = new BroadcastChannel('homi_secret_channel');
                    bc.postMessage('GO_TO_STEP_3');
                    bc.close();
                }
            } catch (error) {
                console.error("Verification failed", error);
                setStatus('error');
            }
        };

        verifyUserEmail();
    }, [token]);

    const containerStyle: React.CSSProperties = {
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', textAlign: 'center', backgroundColor: '#f8fafc', padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white', padding: '40px', borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        maxWidth: '400px', width: '100%'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {status === 'verifying' && (
                    <>
                        <Loader2 size={48} color="#3b82f6" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                        <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>Verifying your email...</h2>
                        <p style={{ color: '#64748b' }}>Please wait a moment while we confirm your details.</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <CheckCircle size={56} color="#4ade80" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: '#0f172a', marginBottom: '12px' }}>Email Verified! 🎉</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.5', marginBottom: '8px' }}>
                            Email verified successfully! You can now complete your profile verification.
                        </p>
                        <p style={{ color: '#10b981', lineHeight: '1.5', fontWeight: 500, marginTop: '16px', backgroundColor: '#d1fae5', padding: '12px', borderRadius: '8px' }}>
                            Verified, you can go back to HOMi page now.
                        </p>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <XCircle size={56} color="#f87171" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: '#0f172a', marginBottom: '12px' }}>Verification Failed</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                            The verification link may have expired or is invalid. Please return to the previous tab and request a new one.
                        </p>
                    </>
                )}
            </div>
            <style>
                {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
            </style>
        </div>
    );
};

export default VerifyEmailCallback;