// client/src/features/Settings/components/Security.tsx
import React, { useState } from 'react';
import './Security.css';
import { FaShieldVirus, FaFingerprint, FaHistory, FaKey, FaTimes, FaEye, FaEyeSlash, FaCheck, FaTimesCircle, FaGoogle } from 'react-icons/fa';
import { authService } from '../../../services/auth.service';

// Password requirement checks
const checks = [
    { key: 'length',    label: 'At least 8 characters',           test: (p: string) => p.length >= 8 },
    { key: 'upper',     label: 'At least one uppercase letter',    test: (p: string) => /[A-Z]/.test(p) },
    { key: 'lower',     label: 'At least one lowercase letter',    test: (p: string) => /[a-z]/.test(p) },
    { key: 'number',    label: 'At least one number',              test: (p: string) => /\d/.test(p) },
    { key: 'special',   label: 'At least one special character',   test: (p: string) => /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/]/.test(p) },
];

// Parse ZodError-style errors[] from the backend into a single readable string
function parseApiError(err: unknown): string {
    const e = err as {
        response?: {
            data?: {
                message?: string;
                errors?: { field: string; message: string }[];
                code?: string;
            };
        };
    };

    const data = e?.response?.data;
    if (!data) return 'Failed to change password. Please try again.';

    // Map backend error codes to user-friendly messages
    if (data.code === 'INVALID_CURRENT_PASSWORD') return 'Current password is incorrect.';
    if (data.code === 'SAME_PASSWORD') return 'New password must be different from your current one.';

    // Parse Zod validation errors (code === 'VALIDATION_ERROR')
    if (data.errors && data.errors.length > 0) {
        return data.errors[0].message;
    }

    return data.message || 'Failed to change password. Please try again.';
}

const Security: React.FC = () => {
    const isGoogleUser = localStorage.getItem('authProvider') === 'google';
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Track whether the user has started typing the new password (to show checklist)
    const newPasswordTouched = newPassword.length > 0;
    const allChecksPassed = checks.every(c => c.test(newPassword));

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setMessage(null);
    };

    const handleOpen = () => { resetForm(); setShowPasswordForm(true); };
    const handleClose = () => { setShowPasswordForm(false); resetForm(); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // ── Client-side validation ──────────────────────────────────────────
        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Please enter your current password.' });
            return;
        }
        if (!newPassword) {
            setMessage({ type: 'error', text: 'Please enter a new password.' });
            return;
        }
        if (!allChecksPassed) {
            const failed = checks.filter(c => !c.test(newPassword)).map(c => c.label);
            setMessage({ type: 'error', text: `Password must have: ${failed.join(', ')}.` });
            return;
        }
        if (currentPassword === newPassword) {
            setMessage({ type: 'error', text: 'New password must be different from your current one.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        // ── API call ────────────────────────────────────────────────────────
        setSaving(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setTimeout(() => handleClose(), 2000);
        } catch (err: unknown) {
            setMessage({ type: 'error', text: parseApiError(err) });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="security-grid-layout">
            <div className="security-status-hero">
                <div className="safety-meter">
                    <svg viewBox="0 0 36 36" className="circular-chart blue">
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="circle" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="percentage">85%</div>
                </div>
                <div className="status-meta">
                    <h3>Security Score: Good</h3>
                    <p>Your account is well protected. Enable 2FA to reach 100%.</p>
                </div>
            </div>

            <div className="security-tools-grid">
                <div className="tool-card">
                    <div className="tool-icon-box"><FaKey /></div>
                    <h4>Password</h4>
                    {isGoogleUser ? (
                        <>
                            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                                You signed in with Google. Your password is managed by Google and cannot be changed here.
                            </p>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                marginTop: 8, fontSize: 12, fontWeight: 600,
                                color: '#4285F4',
                            }}>
                                <FaGoogle style={{ fontSize: 13 }} />
                                Google Account
                            </div>
                        </>
                    ) : (
                        <>
                            <p>Change your secure passphrase</p>
                            <button className="tool-btn" onClick={handleOpen}>Update</button>
                        </>
                    )}
                </div>
                <div className="tool-card active">
                    <div className="tool-icon-box"><FaFingerprint /></div>
                    <h4>2FA Auth</h4>
                    <p>Biometric or SMS verification</p>
                    <button className="tool-btn">Manage</button>
                </div>
                <div className="tool-card">
                    <div className="tool-icon-box"><FaHistory /></div>
                    <h4>Complete Profile</h4>
                    <p>Finish setting up your account</p>
                    <button
                        className="tool-btn"
                        onClick={() => window.location.href = '/complete-profile'}
                    >
                        Continue
                    </button>
                </div>
            </div>

            {/* ── Change Password Modal ─────────────────────────────────────── */}
            {showPasswordForm && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 20,
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                >
                    <div style={{
                        background: 'var(--bg-card, #1e2433)',
                        borderRadius: 18,
                        padding: '32px 36px',
                        width: '100%', maxWidth: 460,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
                        position: 'relative',
                        color: 'var(--text-primary, #f1f5f9)',
                    }}>
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted, #94a3b8)',
                                cursor: 'pointer', fontSize: 18, padding: 4,
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 11,
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <FaShieldVirus style={{ color: '#fff', fontSize: 18 }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Change Password</h3>
                                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted, #94a3b8)' }}>Keep your account secure</p>
                            </div>
                        </div>

                        {/* Status message */}
                        {message && (
                            <div style={{
                                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                                fontSize: 13, fontWeight: 500,
                                background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                color: message.type === 'success' ? '#4ade80' : '#f87171',
                                border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Current Password */}
                            <PasswordField
                                label="Current Password"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                show={showCurrent}
                                toggle={() => setShowCurrent(v => !v)}
                            />

                            {/* New Password */}
                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={setNewPassword}
                                show={showNew}
                                toggle={() => setShowNew(v => !v)}
                            />

                            {/* Password strength checklist — shown while typing */}
                            {newPasswordTouched && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: 10,
                                    padding: '12px 16px',
                                    marginBottom: 16,
                                    marginTop: -8,
                                }}>
                                    {checks.map(c => {
                                        const passed = c.test(newPassword);
                                        return (
                                            <div key={c.key} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                fontSize: 12, fontWeight: 500,
                                                color: passed ? '#4ade80' : '#94a3b8',
                                                padding: '3px 0',
                                                transition: 'color 0.2s',
                                            }}>
                                                {passed
                                                    ? <FaCheck style={{ fontSize: 10, flexShrink: 0 }} />
                                                    : <FaTimesCircle style={{ fontSize: 10, flexShrink: 0, color: '#ef4444' }} />
                                                }
                                                {c.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Confirm New Password */}
                            <PasswordField
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                show={showConfirm}
                                toggle={() => setShowConfirm(v => !v)}
                                hint={
                                    confirmPassword.length > 0 && confirmPassword !== newPassword
                                        ? 'Passwords do not match'
                                        : undefined
                                }
                            />

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    style={{
                                        flex: 1, padding: '11px 0', borderRadius: 9,
                                        border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                                        background: 'transparent',
                                        color: 'var(--text-secondary, #cbd5e1)',
                                        cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '11px 0', borderRadius: 9,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        color: '#fff',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: 14, fontWeight: 600,
                                        opacity: saving ? 0.7 : 1,
                                        transition: 'opacity 0.2s',
                                    }}
                                >
                                    {saving ? 'Updating…' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Reusable password input field ─────────────────────────────────────────────
interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    toggle: () => void;
    hint?: string;   // optional inline error hint below the field
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChange, show, toggle, hint }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{
            display: 'block', fontSize: 13, fontWeight: 500,
            marginBottom: 6, color: 'var(--text-secondary, #cbd5e1)',
        }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '11px 42px 11px 14px',
                    borderRadius: 9,
                    border: `1px solid ${hint ? 'rgba(239,68,68,0.5)' : 'var(--border-color, rgba(255,255,255,0.1))'}`,
                    background: 'var(--bg-input, rgba(255,255,255,0.05))',
                    color: 'inherit',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                }}
            />
            <button
                type="button"
                onClick={toggle}
                style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', fontSize: 14,
                }}
            >
                {show ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
        {hint && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#f87171', fontWeight: 500 }}>
                {hint}
            </p>
        )}
    </div>
);

export default Security;