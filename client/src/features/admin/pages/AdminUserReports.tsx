import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiAlertTriangle, FiFileText, FiHome, FiLogOut, FiShield, FiTrash2, FiUsers } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import adminService, { type ListingReport } from '../../../services/admin.service';
import './adminDashboard.css';
import './AdminUserReports.css';

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string }; status?: number } }).response;
        return response?.data?.message || fallback;
    }
    return fallback;
};

const PROPERTY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80';

const reasonLabel: Record<ListingReport['reason'], string> = {
    SCAM_OR_FRAUD: 'Scam or fraud',
    MISLEADING_INFORMATION: 'Misleading information',
    FAKE_PHOTOS: 'Fake photos',
    DUPLICATE_LISTING: 'Duplicate listing',
    OFFENSIVE_CONTENT: 'Offensive content',
    UNAVAILABLE_OR_ALREADY_RENTED: 'Unavailable or already rented',
    OTHER: 'Other',
};

const AdminUserReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<ListingReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ListingReport | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const fetchReports = async () => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.getListingReports();
            setReports(data);
        } catch (fetchError: unknown) {
            setError(getErrorMessage(fetchError, 'Failed to load reports'));
            if (typeof fetchError === 'object' && fetchError !== null && 'response' in fetchError && (fetchError as { response?: { status?: number } }).response?.status === 401) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchReports();
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

    const openReports = useMemo(() => reports.filter((report) => report.status === 'OPEN'), [reports]);

    const handleRemoveListing = async () => {
        if (!selectedReport) return;
        setActionLoading(true);
        try {
            await adminService.removeListingFromReport(selectedReport.id);
            setSelectedReport(null);
            await fetchReports();
        } catch (removeError: unknown) {
            alert(getErrorMessage(removeError, 'Failed to remove listing'));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Report investigation center</p>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard"><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/user-management"><FiUsers /> User Management</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-signout" onClick={handleSignOut} type="button"><FiLogOut /> Sign out</button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>User Listing Reports</h1>
                        <p>Open queue only - resolved reports are hidden automatically.</p>
                    </div>
                    <span className="reports-open-pill">{openReports.length} Open</span>
                </header>

                {loading ? (
                    <div className="admin-state">Loading reports...</div>
                ) : error ? (
                    <div className="admin-state reports-error">{error}</div>
                ) : openReports.length === 0 ? (
                    <div className="admin-state">No open reports right now.</div>
                ) : (
                    <div className="admin-content reports-grid">
                        {openReports.map((report) => (
                            <article key={report.id} className="report-card">
                                <div className="report-head">
                                    <div>
                                        <small>Reason</small>
                                        <h3>{reasonLabel[report.reason]}</h3>
                                    </div>
                                    <span>{report.status}</span>
                                </div>
                                <div className="report-property">
                                    <img src={report.property.thumbnailUrl || PROPERTY_FALLBACK_IMAGE} alt={report.property.title} />
                                    <div>
                                        <h4>{report.property.title}</h4>
                                        <p>{report.property.address}</p>
                                        <p>${report.property.monthlyPrice.toLocaleString()}/mo</p>
                                        <p className="reporter">
                                            Reported by: {report.reporter ? `${report.reporter.firstName || ''} ${report.reporter.lastName || ''}`.trim() || report.reporter.email : 'Unknown user'}
                                        </p>
                                    </div>
                                </div>
                                <div className="report-details">{report.details}</div>
                                <div className="report-actions">
                                    <button type="button" onClick={() => setSelectedReport(report)}><FiShield /> Review</button>
                                    <button type="button" className="danger" onClick={() => setSelectedReport(report)}><FiTrash2 /> Remove Listing</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {selectedReport && (
                <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
                    <div className="report-modal" onClick={(event) => event.stopPropagation()}>
                        <h2>Moderation Action</h2>
                        <p>Remove listing "{selectedReport.property.title}" based on this report?</p>
                        <div className="report-details">{selectedReport.details}</div>
                        <div className="report-actions">
                            <button type="button" onClick={() => setSelectedReport(null)}>Cancel</button>
                            <button type="button" className="danger" onClick={handleRemoveListing} disabled={actionLoading}>
                                {actionLoading ? 'Removing...' : 'Confirm Remove Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserReports;
