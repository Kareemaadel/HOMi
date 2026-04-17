import { useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiFileText, FiHome, FiLogOut, FiShield, FiTrash2 } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import adminService, { type ListingReport } from '../../../services/admin.service';

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
        } catch (fetchError: any) {
            setError(fetchError?.response?.data?.message || 'Failed to load reports');
            if (fetchError?.response?.status === 401) {
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
        } catch (removeError: any) {
            alert(removeError?.response?.data?.message || 'Failed to remove listing');
        } finally {
            setActionLoading(false);
        }
    };

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
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isActive ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]' : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
                            <FiHome /> <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/property-approvals" className={({ isActive }) => `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isActive ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]' : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
                            <FiFileText /> <span>Property Approvals</span>
                        </NavLink>
                        <NavLink to="/admin/user-reports" className={({ isActive }) => `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isActive ? 'border-sky-400/40 bg-sky-500/20 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]' : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
                            <FiAlertTriangle /> <span>User Reports</span>
                        </NavLink>
                    </nav>
                    <div className="mt-auto border-t border-white/10 p-4">
                        <button className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-rose-300 transition hover:border-rose-300/20 hover:bg-rose-500/15 hover:text-rose-100" onClick={handleSignOut} type="button">
                            <FiLogOut /> <span>Sign out</span>
                        </button>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col bg-slate-100">
                    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-md md:px-8">
                        <h1 className="text-xl font-bold tracking-tight">User Listing Reports</h1>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">{openReports.length} Open</span>
                    </header>

                    {loading ? (
                        <div className="grid min-h-[400px] place-items-center text-slate-500">Loading reports...</div>
                    ) : error ? (
                        <div className="grid min-h-[400px] place-items-center text-rose-600">{error}</div>
                    ) : reports.length === 0 ? (
                        <div className="grid min-h-[400px] place-items-center text-slate-500">No reports submitted yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 p-5 md:p-8 xl:grid-cols-2">
                            {reports.map((report) => (
                                <article key={report.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-500">Reason</p>
                                            <p className="mt-1 text-sm font-bold text-slate-900">{reasonLabel[report.reason]}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${report.status === 'OPEN' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{report.status}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 p-5">
                                        <img src={report.property.thumbnailUrl || PROPERTY_FALLBACK_IMAGE} alt={report.property.title} className="h-28 w-full rounded-xl object-cover" />
                                        <div>
                                            <h3 className="text-base font-bold">{report.property.title}</h3>
                                            <p className="mt-1 text-sm text-slate-600">{report.property.address}</p>
                                            <p className="mt-1 text-sm font-semibold">${report.property.monthlyPrice.toLocaleString()}/mo</p>
                                            <p className="mt-2 text-xs text-slate-500">Reported by: {report.reporter ? `${report.reporter.firstName || ''} ${report.reporter.lastName || ''}`.trim() || report.reporter.email : 'Unknown user'}</p>
                                        </div>
                                    </div>
                                    <div className="px-5 pb-5">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                            {report.details}
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setSelectedReport(report)}>
                                                <FiShield /> Review
                                            </button>
                                            <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600" onClick={() => setSelectedReport(report)} disabled={report.status === 'ACTIONED'}>
                                                <FiTrash2 /> Remove Listing
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {selectedReport && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 p-4" onClick={() => setSelectedReport(null)}>
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <h2 className="text-lg font-bold">Moderation Action</h2>
                        <p className="mt-2 text-sm text-slate-700">
                            Remove listing <span className="font-semibold">"{selectedReport.property.title}"</span> based on this report?
                        </p>
                        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{selectedReport.details}</p>
                        <div className="mt-5 flex gap-3">
                            <button type="button" className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setSelectedReport(null)}>
                                Cancel
                            </button>
                            <button type="button" className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60" onClick={handleRemoveListing} disabled={actionLoading || selectedReport.status === 'ACTIONED'}>
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
