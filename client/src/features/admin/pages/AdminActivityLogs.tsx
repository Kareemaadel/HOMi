import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiActivity, FiAlertTriangle, FiFileText, FiHome, FiLogOut, FiMessageCircle, FiSearch, FiX, FiUsers } from 'react-icons/fi';
import adminService, { type ActivityLogItem, type AdminPropertyDetails, type AdminUserProfileDetails } from '../../../services/admin.service';
import './adminDashboard.css';
import './AdminActivityLogs.css';

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string }; status?: number } }).response;
        return response?.data?.message || fallback;
    }
    return fallback;
};

const AdminActivityLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<AdminUserProfileDetails | null>(null);
    const [propertyModalOpen, setPropertyModalOpen] = useState(false);
    const [propertyLoading, setPropertyLoading] = useState(false);
    const [propertyError, setPropertyError] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<AdminPropertyDetails | null>(null);

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

    const fetchLogs = async (targetPage: number) => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await adminService.getActivityLogs({ page: targetPage, limit: 60 });
            setLogs(response.data);
            setPage(response.pagination.page);
            setTotalPages(Math.max(1, response.pagination.totalPages));
        } catch (fetchError: unknown) {
            setError(getErrorMessage(fetchError, 'Failed to load activity logs'));
            if (typeof fetchError === 'object' && fetchError !== null && 'response' in fetchError && (fetchError as { response?: { status?: number } }).response?.status === 401) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchLogs(1);
    }, []);

    const filteredLogs = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return logs;
        return logs.filter((log) =>
            log.action.toLowerCase().includes(term) ||
            log.description.toLowerCase().includes(term) ||
            (log.actorEmail || '').toLowerCase().includes(term) ||
            (log.entityType || '').toLowerCase().includes(term)
        );
    }, [logs, query]);

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authProvider');
        sessionStorage.removeItem('refreshToken');
        navigate('/admin/auth/login', { replace: true });
    };

    const canOpenProfile = (log: ActivityLogItem) =>
        Boolean(log.actorUserId) && ['TENANT', 'LANDLORD'].includes((log.actorRole || '').toUpperCase());

    const handleShowProfile = async (log: ActivityLogItem) => {
        if (!log.actorUserId || !canOpenProfile(log)) return;
        setProfileModalOpen(true);
        setProfileLoading(true);
        setProfileError(null);
        setSelectedProfile(null);
        try {
            const profile = await adminService.getUserProfile(log.actorUserId);
            setSelectedProfile(profile);
        } catch (fetchError: unknown) {
            setProfileError(getErrorMessage(fetchError, 'Failed to load profile'));
        } finally {
            setProfileLoading(false);
        }
    };

    const getPropertyIdFromLog = (log: ActivityLogItem): string | null => {
        const metadataPropertyId = log.metadata && typeof log.metadata.propertyId === 'string'
            ? log.metadata.propertyId
            : null;
        if (metadataPropertyId) return metadataPropertyId;
        if (log.action === 'RENTAL_REQUEST_CREATED' && log.description.includes('property')) {
            const match = log.description.match(/[a-f0-9-]{36}/i);
            return match?.[0] || null;
        }
        return null;
    };

    const handleOpenProperty = async (propertyId: string) => {
        setPropertyModalOpen(true);
        setPropertyLoading(true);
        setPropertyError(null);
        setSelectedProperty(null);
        try {
            const property = await adminService.getPropertyDetails(propertyId);
            setSelectedProperty(property);
        } catch (fetchError: unknown) {
            setPropertyError(getErrorMessage(fetchError, 'Failed to load property details'));
        } finally {
            setPropertyLoading(false);
        }
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Audit and visibility</p>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard"><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/user-management"><FiUsers /> User Management</NavLink>
                    <NavLink to="/admin/support-inbox"><FiMessageCircle /> Help Center</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-signout" onClick={handleSignOut} type="button">
                    <FiLogOut /> Sign out
                </button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>System Activity Timeline</h1>
                    <p>Comprehensive timeline of tenant, landlord, and admin actions.</p>
                </header>

                <section className="admin-logs-toolbar">
                    <div className="admin-logs-search">
                        <FiSearch />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Filter by action, description, actor email, entity..."
                        />
                    </div>
                </section>

                {loading ? (
                    <div className="admin-logs-state">Loading activity logs...</div>
                ) : error ? (
                    <div className="admin-logs-state admin-logs-error">{error}</div>
                ) : (
                    <section className="admin-logs-table-wrap">
                        <table className="admin-logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Actor</th>
                                    <th>Action</th>
                                    <th>Entity / Profile</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td>
                                            <div className="actor-col">
                                                <span className="role-pill">{log.actorRole || 'SYSTEM'}</span>
                                                <span>{log.actorEmail || 'System process'}</span>
                                            </div>
                                        </td>
                                        <td><code>{log.action}</code></td>
                                        <td>
                                            {canOpenProfile(log) ? (
                                                <button type="button" className="show-profile-btn" onClick={() => void handleShowProfile(log)}>
                                                    Show Profile
                                                </button>
                                            ) : (
                                                <span>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}</span>
                                            )}
                                        </td>
                                        <td>
                                            {log.action === 'RENTAL_REQUEST_CREATED' && getPropertyIdFromLog(log) ? (
                                                <div className="log-description-with-link">
                                                    <span>Tenant submitted rental request for property</span>
                                                    <button
                                                        type="button"
                                                        className="property-link-btn"
                                                        onClick={() => void handleOpenProperty(getPropertyIdFromLog(log) as string)}
                                                    >
                                                        {getPropertyIdFromLog(log)}
                                                    </button>
                                                </div>
                                            ) : (
                                                log.description
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                <footer className="admin-logs-pagination">
                    <button type="button" onClick={() => void fetchLogs(page - 1)} disabled={page <= 1 || loading}>
                        Previous
                    </button>
                    <span>Page {page} / {totalPages}</span>
                    <button type="button" onClick={() => void fetchLogs(page + 1)} disabled={page >= totalPages || loading}>
                        Next
                    </button>
                </footer>
            </main>

            {profileModalOpen && (
                <div className="modal-backdrop" onClick={() => setProfileModalOpen(false)}>
                    <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="profile-close" onClick={() => setProfileModalOpen(false)}><FiX /></button>
                        {profileLoading ? (
                            <div className="profile-state">Loading profile...</div>
                        ) : profileError ? (
                            <div className="profile-state profile-error">{profileError}</div>
                        ) : selectedProfile ? (
                            <div className="profile-content">
                                <div className="profile-top">
                                    <img
                                        src={selectedProfile.profile?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=DBEAFE&color=1E40AF'}
                                        alt="User avatar"
                                    />
                                    <div>
                                        <h3>
                                            {selectedProfile.profile?.firstName || ''} {selectedProfile.profile?.lastName || ''}
                                        </h3>
                                        <p>{selectedProfile.email}</p>
                                        <p>{selectedProfile.role}</p>
                                    </div>
                                </div>
                                <div className="profile-grid">
                                    <p><b>Verified:</b> {selectedProfile.isVerified ? 'Yes' : 'No'}</p>
                                    <p><b>Email Verified:</b> {selectedProfile.emailVerified ? 'Yes' : 'No'}</p>
                                    <p><b>Phone:</b> {selectedProfile.profile?.phoneNumber || 'Not provided'}</p>
                                    <p><b>Joined:</b> {new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                                    <p><b>Location:</b> {selectedProfile.profile?.currentLocation || 'Hidden until verification'}</p>
                                    <p><b>Gender:</b> {selectedProfile.profile?.gender || 'Hidden until verification'}</p>
                                    <p><b>Birthdate:</b> {selectedProfile.profile?.birthdate || 'Hidden until verification'}</p>
                                    <p><b>National ID:</b> {selectedProfile.profile?.nationalId || 'Hidden until verification'}</p>
                                </div>
                                {selectedProfile.profile?.bio && (
                                    <div className="profile-bio">
                                        <b>Bio</b>
                                        <p>{selectedProfile.profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {propertyModalOpen && (
                <div className="modal-backdrop" onClick={() => setPropertyModalOpen(false)}>
                    <div className="profile-modal property-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="profile-close" onClick={() => setPropertyModalOpen(false)}><FiX /></button>
                        {propertyLoading ? (
                            <div className="profile-state">Loading property...</div>
                        ) : propertyError ? (
                            <div className="profile-state profile-error">{propertyError}</div>
                        ) : selectedProperty ? (
                            <div className="property-content">
                                <h3>{selectedProperty.title}</h3>
                                <p><b>Property ID:</b> {selectedProperty.id}</p>
                                <p><b>Status:</b> {selectedProperty.status}</p>
                                <p><b>Address:</b> {selectedProperty.address}</p>
                                <p><b>Price:</b> ${Number(selectedProperty.monthlyPrice || 0).toLocaleString()}/month</p>
                                <p><b>Description:</b> {selectedProperty.description}</p>
                                {selectedProperty.deletedAt && (
                                    <p><b>Deleted At:</b> {new Date(selectedProperty.deletedAt).toLocaleString()}</p>
                                )}
                                <div className="property-landlord-box">
                                    <h4>Landlord Info</h4>
                                    <p><b>Name:</b> {selectedProperty.landlord ? `${selectedProperty.landlord.firstName || ''} ${selectedProperty.landlord.lastName || ''}`.trim() || 'Unavailable' : 'Unavailable'}</p>
                                    <p><b>Email:</b> {selectedProperty.landlord?.email || 'Unavailable'}</p>
                                    <p><b>Landlord ID:</b> {selectedProperty.landlordId}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActivityLogs;
