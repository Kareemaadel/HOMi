import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AccountBannedPage.css';

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
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (state.isUnlimited) return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [state.isUnlimited]);

    const remainingMs = useMemo(() => {
        if (state.isUnlimited) return null;
        if (state.banUntil) {
            return Math.max(0, new Date(state.banUntil).getTime() - now);
        }
        if (typeof state.remainingMs === 'number') {
            return Math.max(0, state.remainingMs);
        }
        return null;
    }, [state.isUnlimited, state.banUntil, state.remainingMs, now]);

    const countdown = useMemo(() => {
        if (state.isUnlimited || remainingMs === null) {
            return { days: '--', hours: '--', minutes: '--', seconds: '--' };
        }
        const totalSeconds = Math.floor(remainingMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return {
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        };
    }, [state.isUnlimited, remainingMs]);

    return (
        <div className="banned-page-shell">
            <div className="banned-card">
                <div className="banned-brand">
                    <img src="/logo.png" alt="HOMi Logo" />
                    <span>Account Restriction Notice</span>
                </div>

                <h1>Your account is temporarily restricted</h1>
                <p className="banned-subtitle">
                    Please review the details below. You can contact support if you believe this action is incorrect.
                </p>

                <div className="banned-reason-line">
                    <span>Reason</span>
                    <strong>{state.reason || 'Policy violation'}</strong>
                </div>

                <div className="banned-timer-wrap">
                    <span className="timer-label">{state.isUnlimited ? 'Ban Duration' : 'Time Remaining'}</span>
                    {state.isUnlimited ? (
                        <div className="timer-unlimited">Unlimited</div>
                    ) : (
                        <div className="timer-grid">
                            <div><strong>{countdown.days}</strong><span>Days</span></div>
                            <div><strong>{countdown.hours}</strong><span>Hours</span></div>
                            <div><strong>{countdown.minutes}</strong><span>Minutes</span></div>
                            <div><strong>{countdown.seconds}</strong><span>Seconds</span></div>
                        </div>
                    )}
                    <p className="ban-until">Ban until: {state.banUntil ? new Date(state.banUntil).toLocaleString() : 'Unlimited'}</p>
                </div>

                <blockquote className="banned-message">
                    "{state.message || 'No message was provided by the moderation team.'}"
                </blockquote>

                <div className="banned-actions">
                    <button type="button" className="back-auth-btn" onClick={() => navigate('/auth', { replace: true })}>
                        Back to Sign in
                    </button>
                    <button type="button" className="contact-us-btn" onClick={() => navigate('/get-help')}>
                        Contact Us <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountBannedPage;
