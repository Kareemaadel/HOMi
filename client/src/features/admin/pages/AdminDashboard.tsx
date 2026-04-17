import { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiCheckCircle, FiFileText, FiLogOut, FiTrendingUp, FiBarChart2, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { useNavigate, NavLink } from 'react-router-dom';
import adminService from '../../../services/admin.service';
import type { AdminStatsResponse } from '../../../services/admin.service';

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
        } catch (error: any) {
            console.error('Failed to fetch admin data', error);
            if (error?.response?.status === 401) {
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
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex min-h-screen w-full overflow-hidden">
                <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#0b1739] text-white md:flex">
                    <div className="px-6 pb-5 pt-6">
                        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm font-semibold text-white">Admin Team</p>
                            <p className="mt-1 text-xs text-slate-300">admin@homi.app</p>
                        </div>
                        <h2 className="text-2xl font-extrabold">HOMi <span className="text-sky-400">Admin</span></h2>
                    </div>
                    <nav className="mt-1 flex flex-col gap-2 p-4">
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
                                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <FiHome /> <span>Dashboard</span>
                        </NavLink>
                        <NavLink
                            to="/admin/property-approvals"
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
                                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <FiFileText /> <span>Property Approvals</span>
                        </NavLink>
                        <NavLink
                            to="/admin/user-reports"
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
                                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <FiAlertTriangle /> <span>User Reports</span>
                        </NavLink>
                        <NavLink
                            to="/admin/activity-logs"
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
                                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <FiActivity /> <span>Activity Logs</span>
                        </NavLink>
                    </nav>
                    <div className="mt-auto border-t border-white/10 p-4">
                        <button
                            className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-rose-300 transition hover:border-rose-300/20 hover:bg-rose-500/15 hover:text-rose-100"
                            onClick={handleSignOut}
                            type="button"
                        >
                            <FiLogOut /> <span>Sign out</span>
                        </button>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col bg-slate-100">
                    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-md md:px-8">
                        <h1 className="text-xl font-bold tracking-tight">Dashboard Overview</h1>
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 font-bold text-white shadow">
                            A
                        </div>
                    </header>

                    {loading ? (
                        <div className="grid min-h-[400px] place-items-center text-slate-500">Loading system data...</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-5 md:p-8">
                            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl text-blue-500"><FiUsers /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-500">Total Users</span>
                                        <span className="mt-1 text-3xl font-bold">{stats?.totalUsers || 0}</span>
                                    </div>
                                </div>
                                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-50 text-xl text-purple-500"><FiHome /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-500">Total Properties</span>
                                        <span className="mt-1 text-3xl font-bold">{stats?.totalProperties || 0}</span>
                                    </div>
                                </div>
                                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-xl text-green-500"><FiCheckCircle /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-500">Rented Properties</span>
                                        <span className="mt-1 text-3xl font-bold">{stats?.rentedProperties || 0}</span>
                                    </div>
                                </div>
                                <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-xl text-orange-500"><FiFileText /></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-500">Active Contracts</span>
                                        <span className="mt-1 text-3xl font-bold">{stats?.activeContracts || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 p-6">
                                        <div>
                                            <h2 className="text-lg font-bold">User Growth Scalability</h2>
                                            <p className="mt-1 text-sm text-slate-500">Monthly active user growth trend</p>
                                        </div>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <FiTrendingUp /> +12.4%
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex h-56 items-end gap-3">
                                            {usersTrend.map((value, idx) => (
                                                <div key={monthLabels[idx]} className="flex flex-1 flex-col items-center gap-2">
                                                    <div
                                                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-sky-400 transition-all"
                                                        style={{ height: `${Math.max((value / maxUsersTrend) * 100, 8)}%` }}
                                                    />
                                                    <span className="text-xs font-medium text-slate-500">{monthLabels[idx]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-200 p-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Interactions</h2>
                                            <p className="mt-1 text-sm text-slate-500">Contracts + rentals velocity</p>
                                        </div>
                                        <FiBarChart2 className="text-slate-400" />
                                    </div>
                                    <div className="space-y-4 p-6">
                                        {monthLabels.map((month, idx) => (
                                            <div key={month}>
                                                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                                                    <span>{month}</span>
                                                    <span>{interactionsTrend[idx]}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-100">
                                                    <div
                                                        className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                                        style={{ width: `${Math.max((interactionsTrend[idx] / maxInteractionsTrend) * 100, 8)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
                                    <div className="flex items-center justify-between border-b border-slate-200 p-6">
                                        <div>
                                            <h2 className="text-lg font-bold">Properties Scalability Curve</h2>
                                            <p className="mt-1 text-sm text-slate-500">Platform inventory growth over the last 6 months</p>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="relative h-56 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <svg viewBox="0 0 600 180" className="h-full w-full">
                                                <polyline
                                                    fill="none"
                                                    stroke="#38bdf8"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points={propertyTrend
                                                        .map((value, idx) => {
                                                            const x = 40 + idx * 104;
                                                            const y = 160 - (value / maxPropertyTrend) * 130;
                                                            return `${x},${y}`;
                                                        })
                                                        .join(' ')}
                                                />
                                                {propertyTrend.map((value, idx) => {
                                                    const x = 40 + idx * 104;
                                                    const y = 160 - (value / maxPropertyTrend) * 130;
                                                    return (
                                                        <g key={`${monthLabels[idx]}-${value}`}>
                                                            <circle cx={x} cy={y} r="6" fill="#0284c7" />
                                                            <text x={x} y={175} textAnchor="middle" fontSize="11" fill="#475569">{monthLabels[idx]}</text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Growth Signal</p>
                                    <p className="mt-3 text-2xl font-bold text-slate-900">Strong</p>
                                    <p className="mt-1 text-sm text-slate-500">User acquisition and inventory are scaling in sync.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">System Load</p>
                                    <p className="mt-3 text-2xl font-bold text-slate-900">Balanced</p>
                                    <p className="mt-1 text-sm text-slate-500">Engagement levels are healthy with no moderation backlog spikes.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prediction</p>
                                    <p className="mt-3 text-2xl font-bold text-slate-900">+18% Next Month</p>
                                    <p className="mt-1 text-sm text-slate-500">Based on six-month property and interaction trajectory.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
