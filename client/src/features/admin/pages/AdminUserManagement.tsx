import { useEffect, useState } from 'react';
import { FiActivity, FiAlertTriangle, FiFileText, FiHome, FiLogOut, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import adminService, { type AdminManagedUser } from '../../../services/admin.service';
import './adminDashboard.css';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const [landlords, setLandlords] = useState<AdminManagedUser[]>([]);
    const [tenants, setTenants] = useState<AdminManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [banUser, setBanUser] = useState<AdminManagedUser | null>(null);
    const [banType, setBanType] = useState<'until' | 'unlimited'>('until');
    const [banUntil, setBanUntil] = useState('');
    const [banReason, setBanReason] = useState('Fake national ID');
    const [banMessage, setBanMessage] = useState('Your account was flagged for fake identity data.');
    const [banLoading, setBanLoading] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    const mockMessages = [
        { reason: 'Fake national ID', message: 'Your account was flagged for fake identity data.' },
        { reason: 'Scam activity', message: 'Your account has been suspended due to scam reports.' },
        { reason: 'Fake data', message: 'Your account has inconsistent information that violates policy.' },
        { reason: 'Abusive behavior', message: 'Your account is restricted due to abusive behavior.' },
    ];

    const hasValidAdminSession = () => {
        const token = localStorage.getItem('accessToken');
        const rawUser = localStorage.getItem('user');
        if (!token || !rawUser) return false;
        try {
            const parsed = JSON.parse(rawUser) as { role?: string };
            return parsed.role === 'ADMIN';
        } catch {
            return false;
        }
    };

    const fetchUsers = async () => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getUsersForManagement();
            setLandlords(data.landlords);
            setTenants(data.tenants);
        } catch (fetchError: unknown) {
            setError('Failed to load users');
            if (typeof fetchError === 'object' && fetchError !== null && 'response' in fetchError && (fetchError as { response?: { status?: number } }).response?.status === 401) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authProvider');
        sessionStorage.removeItem('refreshToken');
        navigate('/admin/auth/login', { replace: true });
    };

    const handleBan = async () => {
        if (!banUser) return;
        setBanLoading(true);
        try {
            await adminService.banUser(banUser.id, {
                banUntil: banType === 'unlimited' ? null : banUntil || null,
                reason: banReason,
                message: customMessage.trim() || banMessage,
            });
            setBanUser(null);
            setCustomMessage('');
            await fetchUsers();
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnban = async (userId: string) => {
        await adminService.unbanUser(userId);
        await fetchUsers();
    };

    const renderUserRows = (users: AdminManagedUser[]) =>
        users.map((user) => (
            <tr key={user.id}>
                <td>
                    <div className="user-row-avatar">
                        {user.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt={`${user.profile.firstName} ${user.profile.lastName}`} />
                        ) : (
                            <span>{(user.profile?.firstName?.[0] || user.email[0] || 'U').toUpperCase()}</span>
                        )}
                    </div>
                </td>
                <td>{user.id}</td>
                <td>{user.profile?.firstName || '-'}</td>
                <td>{user.profile?.lastName || '-'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                <td>{user.isVerified ? 'Yes' : 'No'}</td>
                <td>{user.emailVerificationTokenExpires ? new Date(user.emailVerificationTokenExpires).toLocaleString() : '-'}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>{new Date(user.updatedAt).toLocaleString()}</td>
                <td>{user.deletedAt ? new Date(user.deletedAt).toLocaleString() : '-'}</td>
                <td>{user.profile?.id || '-'}</td>
                <td>{user.profile?.phoneNumber || '-'}</td>
                <td>{user.profile?.bio || '-'}</td>
                <td>{user.profile?.currentLocation || '-'}</td>
                <td>{user.profile?.gender || '-'}</td>
                <td>{user.profile?.birthdate || '-'}</td>
                <td>{user.profile?.nationalIdEncrypted || '-'}</td>
                <td>{user.profile?.nationalIdDecrypted || '-'}</td>
                <td>{user.profile?.gamificationPoints ?? '-'}</td>
                <td>{user.profile?.preferredBudgetMin ?? '-'}</td>
                <td>{user.profile?.preferredBudgetMax ?? '-'}</td>
                <td>{user.profile?.walletBalance ?? '-'}</td>
                <td>{user.profile?.walletPendingOrderId ?? '-'}</td>
                <td>{user.profile?.walletPendingAmountCents ?? '-'}</td>
                <td>{user.profile?.walletPendingSaveCard ? 'Yes' : 'No'}</td>
                <td>{user.profile?.createdAt ? new Date(user.profile.createdAt).toLocaleString() : '-'}</td>
                <td>{user.profile?.updatedAt ? new Date(user.profile.updatedAt).toLocaleString() : '-'}</td>
                <td>{user.isBanned ? 'Yes' : 'No'}</td>
                <td>{user.banReason || '-'}</td>
                <td>{user.banUntil ? new Date(user.banUntil).toLocaleString() : 'Unlimited / N/A'}</td>
                <td>{user.banMessage || '-'}</td>
                <td>
                    {user.isBanned ? (
                        <button type="button" className="ban-btn unban" onClick={() => void handleUnban(user.id)}>Unban</button>
                    ) : (
                        <button type="button" className="ban-btn" onClick={() => setBanUser(user)}>Ban</button>
                    )}
                </td>
            </tr>
        ));

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>User management center</p>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard"><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/user-management"><FiUsers /> User Management</NavLink>
                    <NavLink to="/admin/support-inbox"><FiMessageCircle /> Help Center</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-signout" onClick={handleSignOut} type="button"><FiLogOut /> Sign out</button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Full system data for landlords and tenants.</p>
                    </div>
                    <div className="admin-avatar">A</div>
                </header>

                {loading ? (
                    <div className="admin-state">Loading users...</div>
                ) : error ? (
                    <div className="admin-state">{error}</div>
                ) : (
                    <div className="admin-content user-management-content">
                        <section className="panel user-table-panel">
                            <div className="panel-head">
                                <h3>Landlords ({landlords.length})</h3>
                            </div>
                            <div className="user-table-wrap">
                                <table className="user-management-table">
                                    <thead>
                                        <tr>
                                            <th>Avatar</th><th>User ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th><th>Email Verified</th><th>Account Verified</th>
                                            <th>Email Verify Expires</th><th>User Created</th><th>User Updated</th><th>User Deleted</th>
                                            <th>Profile ID</th><th>Phone</th><th>Bio</th><th>Location</th><th>Gender</th>
                                            <th>Birthdate</th><th>National ID (Encrypted)</th><th>National ID (Decrypted)</th><th>Gamification Points</th><th>Budget Min</th><th>Budget Max</th>
                                            <th>Wallet Balance</th><th>Wallet Pending Order</th><th>Wallet Pending Amount Cents</th><th>Wallet Pending Save Card</th><th>Profile Created</th><th>Profile Updated</th><th>Banned</th><th>Ban Reason</th><th>Ban Until</th><th>Ban Message</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderUserRows(landlords)}</tbody>
                                </table>
                            </div>
                        </section>

                        <section className="panel user-table-panel">
                            <div className="panel-head">
                                <h3>Tenants ({tenants.length})</h3>
                            </div>
                            <div className="user-table-wrap">
                                <table className="user-management-table">
                                    <thead>
                                        <tr>
                                            <th>Avatar</th><th>User ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th><th>Email Verified</th><th>Account Verified</th>
                                            <th>Email Verify Expires</th><th>User Created</th><th>User Updated</th><th>User Deleted</th>
                                            <th>Profile ID</th><th>Phone</th><th>Bio</th><th>Location</th><th>Gender</th>
                                            <th>Birthdate</th><th>National ID (Encrypted)</th><th>National ID (Decrypted)</th><th>Gamification Points</th><th>Budget Min</th><th>Budget Max</th>
                                            <th>Wallet Balance</th><th>Wallet Pending Order</th><th>Wallet Pending Amount Cents</th><th>Wallet Pending Save Card</th><th>Profile Created</th><th>Profile Updated</th><th>Banned</th><th>Ban Reason</th><th>Ban Until</th><th>Ban Message</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderUserRows(tenants)}</tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {banUser && (
                <div className="modal-backdrop" onClick={() => setBanUser(null)}>
                    <div className="ban-modal" onClick={(event) => event.stopPropagation()}>
                        <h3>Ban User</h3>
                        <p>{banUser.email}</p>
                        <label>Ban duration</label>
                        <select value={banType} onChange={(e) => setBanType(e.target.value as 'until' | 'unlimited')}>
                            <option value="until">Until date</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                        {banType === 'until' && (
                            <>
                                <label>Ban until</label>
                                <input type="datetime-local" value={banUntil} onChange={(e) => setBanUntil(e.target.value)} />
                            </>
                        )}
                        <label>Reason</label>
                        <select
                            value={banReason}
                            onChange={(e) => {
                                const selected = mockMessages.find((m) => m.reason === e.target.value);
                                setBanReason(e.target.value);
                                if (selected) setBanMessage(selected.message);
                            }}
                        >
                            {mockMessages.map((m) => (
                                <option key={m.reason} value={m.reason}>{m.reason}</option>
                            ))}
                        </select>
                        <label>Message template</label>
                        <select
                            value={banMessage}
                            onChange={(e) => setBanMessage(e.target.value)}
                        >
                            {mockMessages.map((m) => (
                                <option key={m.message} value={m.message}>{m.message}</option>
                            ))}
                        </select>
                        <label>Custom message (optional)</label>
                        <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Write your own message..." />
                        <div className="ban-actions">
                            <button type="button" onClick={() => setBanUser(null)}>Cancel</button>
                            <button type="button" className="ban-btn" onClick={() => void handleBan()} disabled={banLoading}>
                                {banLoading ? 'Banning...' : 'Confirm Ban'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
