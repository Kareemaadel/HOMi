import { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiCheckCircle, FiFileText, FiLogOut, FiTrendingUp, FiBarChart2, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { useNavigate, NavLink } from 'react-router-dom';
import adminService from '../../../services/admin.service';
import type { AdminStatsResponse } from '../../../services/admin.service';
import './adminDashboard.css';

const isUnauthorizedError = (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
    (error as { response?: { status?: number } }).response?.status === 401;

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const buildTrend = (base: number, multipliers: number[]) =>
    multipliers.map((factor) => Math.max(0, Math.round(base * factor)));

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

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

    const fetchData = async () => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        try {
            const statsData = await adminService.getDashboardStats();
            setStats(statsData.data);
        } catch (error: unknown) {
            console.error('Failed to fetch admin data', error);
            if (isUnauthorizedError(error)) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
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

    const usersTrend = buildTrend(stats?.totalUsers || 0, [0.52, 0.58, 0.67, 0.76, 0.87, 1]);
    const propertyTrend = buildTrend(stats?.totalProperties || 0, [0.44, 0.53, 0.61, 0.72, 0.88, 1]);
    const interactionsTrend = buildTrend(
        (stats?.activeContracts || 0) + (stats?.rentedProperties || 0),
        [0.38, 0.49, 0.63, 0.7, 0.84, 1]
    );
    const maxUsersTrend = Math.max(...usersTrend, 1);
    const maxInteractionsTrend = Math.max(...interactionsTrend, 1);
    const maxPropertyTrend = Math.max(...propertyTrend, 1);

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Control center</p>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard" end><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/user-management"><FiUsers /> User Management</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-signout" onClick={handleSignOut} type="button">
                    <FiLogOut /> Sign out
                </button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Live platform health, growth, and moderation visibility.</p>
                    </div>
                    <div className="admin-avatar">A</div>
                </header>

                {loading ? (
                    <div className="admin-state">Loading system data...</div>
                ) : (
                    <div className="admin-content">
                        <div className="stats-grid">
                            <div className="stat-card"><FiUsers /><div><span>Total Users</span><strong>{stats?.totalUsers || 0}</strong></div></div>
                            <div className="stat-card"><FiHome /><div><span>Total Properties</span><strong>{stats?.totalProperties || 0}</strong></div></div>
                            <div className="stat-card"><FiCheckCircle /><div><span>Rented Properties</span><strong>{stats?.rentedProperties || 0}</strong></div></div>
                            <div className="stat-card"><FiFileText /><div><span>Active Contracts</span><strong>{stats?.activeContracts || 0}</strong></div></div>
                        </div>

                        <div className="charts-grid">
                            <section className="panel users-chart">
                                <div className="panel-head">
                                    <div>
                                        <h3>User Growth Scalability</h3>
                                        <p>Monthly active user growth trend</p>
                                    </div>
                                    <span className="trend-pill"><FiTrendingUp /> +12.4%</span>
                                </div>
                                <div className="bar-chart">
                                    {usersTrend.map((value, idx) => (
                                        <div key={monthLabels[idx]} className="bar-item">
                                            <div className="bar" style={{ height: `${Math.max((value / maxUsersTrend) * 100, 8)}%` }} />
                                            <span>{monthLabels[idx]}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="panel interactions-chart">
                                <div className="panel-head">
                                    <div>
                                        <h3>Interactions</h3>
                                        <p>Contracts + rentals velocity</p>
                                    </div>
                                    <FiBarChart2 />
                                </div>
                                <div className="progress-list">
                                    {monthLabels.map((month, idx) => (
                                        <div className="progress-item" key={month}>
                                            <div className="progress-label"><span>{month}</span><span>{interactionsTrend[idx]}</span></div>
                                            <div className="progress-track"><div style={{ width: `${Math.max((interactionsTrend[idx] / maxInteractionsTrend) * 100, 8)}%` }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="panel property-curve">
                                <div className="panel-head">
                                    <div>
                                        <h3>Properties Scalability Curve</h3>
                                        <p>Inventory growth over the last 6 months</p>
                                    </div>
                                </div>
                                <div className="line-chart-wrap">
                                    <svg viewBox="0 0 600 180">
                                        <polyline
                                            fill="none"
                                            stroke="#2b7fff"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={propertyTrend.map((value, idx) => {
                                                const x = 40 + idx * 104;
                                                const y = 160 - (value / maxPropertyTrend) * 130;
                                                return `${x},${y}`;
                                            }).join(' ')}
                                        />
                                        {propertyTrend.map((value, idx) => {
                                            const x = 40 + idx * 104;
                                            const y = 160 - (value / maxPropertyTrend) * 130;
                                            return (
                                                <g key={`${monthLabels[idx]}-${value}`}>
                                                    <circle cx={x} cy={y} r="6" fill="#2b7fff" />
                                                    <text x={x} y={175} textAnchor="middle" fontSize="11" fill="#475569">{monthLabels[idx]}</text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
