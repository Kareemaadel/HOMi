// client/src/features/Settings/components/MyProfile.tsx
import React, { useState, useEffect } from 'react';
import './MyProfile.css';
import { FaCamera, FaIdBadge, FaEnvelope, FaPhone } from 'react-icons/fa';
import { authService } from '../../../services/auth.service';
import type { UserResponse, ProfileResponse } from '../../../types/auth.types';

const MyProfile: React.FC = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.getProfile();
                setUser(data.user);
                setProfile(data.profile);
                setFirstName(data.profile.firstName);
                setLastName(data.profile.lastName);
                setPhone(data.profile.phoneNumber);
            } catch {
                // Fall back to locally-cached data if the request fails
                const cached = authService.getCurrentUser();
                if (cached) {
                    setUser(cached.user);
                    setProfile(cached.profile);
                    setFirstName(cached.profile.firstName);
                    setLastName(cached.profile.lastName);
                    setPhone(cached.profile.phoneNumber);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // Only send fields that have actually changed vs the stored original.
            // This prevents 400 errors from the backend when nothing changed,
            // and avoids sending an empty phone (Google OAuth users may have none).
            const cached = authService.getCurrentUser();
            const orig = cached?.profile;
            const payload: { firstName?: string; lastName?: string; phone?: string } = {};

            if (firstName !== (orig?.firstName ?? '')) payload.firstName = firstName;
            if (lastName !== (orig?.lastName ?? '')) payload.lastName = lastName;
            // Only include phone if it's non-empty AND different from original
            if (phone && phone !== (orig?.phoneNumber ?? '')) payload.phone = phone;

            if (Object.keys(payload).length === 0) {
                setMessage({ type: 'success', text: 'No changes to save.' });
                setSaving(false);
                setTimeout(() => setMessage(null), 3000);
                return;
            }

            const updated = await authService.updateProfile(payload);
            setUser(updated.user);
            setProfile(updated.profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to update profile. Please try again.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setSaving(false);
            // Auto-clear the message after 4 seconds
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const getRoleLabel = (role?: string) => {
        if (role === 'LANDLORD') return 'Landlord';
        if (role === 'TENANT') return 'Tenant';
        return role ?? 'Member';
    };

    const formatDate = (date?: Date | string) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${firstName} ${lastName}`.trim() || 'User'
    )}&background=6366f1&color=fff&size=150`;

    const [avatarSrc, setAvatarSrc] = useState<string>(profile?.avatarUrl || fallbackAvatar);

    // Sync avatar when profile loads
    useEffect(() => {
        setAvatarSrc(profile?.avatarUrl || fallbackAvatar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.avatarUrl]);

    if (loading) {
        return (
            <div className="profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="loading-spinner" style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-identity-card">
                <div className="avatar-main-wrapper">
                    <img
                        src={avatarSrc}
                        alt="Profile"
                        onError={() => setAvatarSrc(fallbackAvatar)}
                        referrerPolicy="no-referrer"
                    />
                    <button className="edit-btn-floating"><FaCamera /></button>
                </div>
                <div className="identity-text">
                    <h3>{`${firstName} ${lastName}`.trim() || 'User'}</h3>
                    <p>{getRoleLabel(user?.role)}</p>
                </div>
                <div className="identity-stats">
                    <div className="stat">
                        <span>Active Since</span>
                        <strong>{formatDate(user?.createdAt)}</strong>
                    </div>
                    <div className="stat">
                        <span>Points</span>
                        <strong>{profile?.gamificationPoints ?? 0}</strong>
                    </div>
                </div>
            </div>

            <div className="profile-edit-surface">
                <div className="form-section-title">Personal Details</div>

                {message && (
                    <div
                        style={{
                            padding: '10px 16px',
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 14,
                            fontWeight: 500,
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#15803d' : '#dc2626',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <div className="input-group-modern">
                    <div className="modern-field">
                        <FaIdBadge className="field-icon" />
                        <div className="field-content">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                            />
                        </div>
                    </div>
                    <div className="modern-field">
                        <FaIdBadge className="field-icon" />
                        <div className="field-content">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                    <div className="modern-field">
                        <FaEnvelope className="field-icon" />
                        <div className="field-content">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={user?.email ?? ''}
                                readOnly
                                style={{ opacity: 0.65, cursor: 'not-allowed' }}
                                title="Email cannot be changed here"
                            />
                        </div>
                    </div>
                    <div className="modern-field">
                        <FaPhone className="field-icon" />
                        <div className="field-content">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="prime-save-button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default MyProfile;