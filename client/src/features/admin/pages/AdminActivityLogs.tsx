import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiActivity, FiAlertTriangle, FiFileText, FiHome, FiLogOut, FiSearch } from 'react-icons/fi';
import adminService, { type ActivityLogItem } from '../../../services/admin.service';
import './AdminActivityLogs.css';

const AdminActivityLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
        } catch (fetchError: any) {
            setError(fetchError?.response?.data?.message || 'Failed to load activity logs');
            if (fetchError?.response?.status === 401) {
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

    return (
        <div className="admin-logs-layout">
            <aside className="admin-logs-sidebar">
                <div className="admin-logs-brand">
                    <div className="admin-logs-team">Admin Team</div>
                    <h2>HOMi <span>Admin</span></h2>
                </div>
                <nav className="admin-logs-nav">
                    <NavLink to="/admin/dashboard"><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-logs-signout" onClick={handleSignOut} type="button">
                    <FiLogOut /> Sign out
                </button>
            </aside>

            <main className="admin-logs-main">
                <header className="admin-logs-header">
                    <h1>System Activity Timeline</h1>
                    <p>Comprehensive timeline of tenant, landlord, and admin actions across HOMi.</p>
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
                                    <th>Entity</th>
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
                                        <td>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}</td>
                                        <td>{log.description}</td>
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
        </div>
    );
};

export default AdminActivityLogs;
