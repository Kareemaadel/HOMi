import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './authPage.css';

type BannedState = {
    reason?: string;
    message?: string;
    banUntil?: string | null;
    remainingMs?: number | null;
    isUnlimited?: boolean;
};

const AccountBannedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as BannedState;

    const remainingText = useMemo(() => {
        if (state.isUnlimited) return 'Unlimited';
        if (!state.remainingMs || state.remainingMs <= 0) return 'Unknown';
        const totalMinutes = Math.floor(state.remainingMs / 60000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;
        return `${days}d ${hours}h ${minutes}m`;
    }, [state.isUnlimited, state.remainingMs]);

    return (
        <div className="auth-split-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: 620, width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <h1 style={{ marginTop: 0 }}>Your account is banned</h1>
                <p><b>Reason:</b> {state.reason || 'Policy violation'}</p>
                <p><b>Remaining time:</b> {remainingText}</p>
                <p><b>Ban until:</b> {state.banUntil ? new Date(state.banUntil).toLocaleString() : 'Unlimited'}</p>
                <p><b>Message from admin:</b> {state.message || 'No message was provided.'}</p>
                <button
                    type="button"
                    onClick={() => navigate('/auth', { replace: true })}
                    style={{ marginTop: 14, border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 14px', background: '#f8fafc', cursor: 'pointer' }}
                >
                    Back to Sign in
                </button>
            </div>
        </div>
    );
};

export default AccountBannedPage;
