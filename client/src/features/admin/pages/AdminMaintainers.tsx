import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService, { type AdminManagedMaintainer } from '../../../services/admin.service';
import AdminSidebar from '../components/AdminSidebar';
import './adminDashboard.css';
import './AdminUserManagement.css';
import './AdminMaintainers.css';

const AdminMaintainers = () => {
    const navigate = useNavigate();
    const [centers, setCenters] = useState<AdminManagedMaintainer[]>([]);
    const [individuals, setIndividuals] = useState<AdminManagedMaintainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [banUser, setBanUser] = useState<AdminManagedMaintainer | null>(null);
    const [banType, setBanType] = useState<'until' | 'unlimited'>('until');
    const [banUntil, setBanUntil] = useState('');
    const [banReason, setBanReason] = useState('Policy violation');
    const [banMessage, setBanMessage] = useState('Your maintainer account was restricted by HOMi admin.');
    const [customMessage, setCustomMessage] = useState('');
    const [banLoading, setBanLoading] = useState(false);

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

    const fetchMaintainers = async () => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getMaintainersForManagement();
            setCenters(data.centers);
            setIndividuals(data.individuals);
        } catch (fetchError: unknown) {
            setError('Failed to load maintainers.');
            if (typeof fetchError === 'object' && fetchError !== null && 'response' in fetchError && (fetchError as { response?: { status?: number } }).response?.status === 401) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchMaintainers();
    }, []);

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
            await fetchMaintainers();
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnban = async (userId: string) => {
        await adminService.unbanUser(userId);
        await fetchMaintainers();
    };

    const renderRows = (users: AdminManagedMaintainer[]) => users.map((user) => (
        <tr key={user.id}>
            <td>
                <div className="user-row-avatar">
                    {user.profile?.avatarUrl ? (
                        <img src={user.profile.avatarUrl} alt={`${user.profile.firstName} ${user.profile.lastName}`} />
                    ) : (
                        <span>{(user.profile?.firstName?.[0] || user.email[0] || 'M').toUpperCase()}</span>
                    )}
                </div>
            </td>
            <td>{user.id}</td>
            <td>{user.profile?.firstName || '-'}</td>
            <td>{user.profile?.lastName || '-'}</td>
            <td>{user.email}</td>
            <td>{user.profile?.phoneNumber || '-'}</td>
            <td>{user.providerType || '-'}</td>
            <td>{user.applicationStatus || '-'}</td>
            <td>{user.businessName || '-'}</td>
            <td>{user.category || '-'}</td>
            <td>{user.categories?.join(', ') || '-'}</td>
            <td>{user.numberOfEmployees ?? '-'}</td>
            <td>{user.companyLocation || '-'}</td>
            <td>{user.notes || '-'}</td>
            <td>{user.applicationSubmittedAt ? new Date(user.applicationSubmittedAt).toLocaleString() : '-'}</td>
            <td>{user.reviewedAt ? new Date(user.reviewedAt).toLocaleString() : '-'}</td>
            <td>{user.isBanned ? 'Yes' : 'No'}</td>
            <td>{user.banReason || '-'}</td>
            <td>{user.banUntil ? new Date(user.banUntil).toLocaleString() : 'Unlimited / N/A'}</td>
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
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Maintainers</h1>
                        <p>Full management for maintenance providers, split by provider type.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="admin-state">Loading maintainers...</div>
                ) : error ? (
                    <div className="admin-state">{error}</div>
                ) : (
                    <div className="admin-content user-management-content">
                        <section className="panel user-table-panel">
                            <div className="panel-head">
                                <h3>Centers ({centers.length})</h3>
                            </div>
                            <div className="user-table-wrap">
                                <table className="user-management-table maintainers-table">
                                    <thead>
                                        <tr>
                                            <th>Avatar</th><th>User ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th><th>Type</th>
                                            <th>Application Status</th><th>Business Name</th><th>Main Category</th><th>All Categories</th><th>Employees</th>
                                            <th>Location</th><th>Notes</th><th>Submitted At</th><th>Reviewed At</th><th>Banned</th><th>Ban Reason</th><th>Ban Until</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderRows(centers)}</tbody>
                                </table>
                            </div>
                        </section>

                        <section className="panel user-table-panel">
                            <div className="panel-head">
                                <h3>Individuals ({individuals.length})</h3>
                            </div>
                            <div className="user-table-wrap">
                                <table className="user-management-table maintainers-table">
                                    <thead>
                                        <tr>
                                            <th>Avatar</th><th>User ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th><th>Type</th>
                                            <th>Application Status</th><th>Business Name</th><th>Main Category</th><th>All Categories</th><th>Employees</th>
                                            <th>Location</th><th>Notes</th><th>Submitted At</th><th>Reviewed At</th><th>Banned</th><th>Ban Reason</th><th>Ban Until</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderRows(individuals)}</tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {banUser && (
                <div className="modal-backdrop" onClick={() => setBanUser(null)}>
                    <div className="ban-modal" onClick={(event) => event.stopPropagation()}>
                        <h3>Ban Maintainer</h3>
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
                        <input value={banReason} onChange={(e) => setBanReason(e.target.value)} />
                        <label>Message template</label>
                        <input value={banMessage} onChange={(e) => setBanMessage(e.target.value)} />
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

export default AdminMaintainers;
