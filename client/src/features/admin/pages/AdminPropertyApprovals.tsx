import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCheck, FiCheckCircle, FiFileText, FiHome, FiLogOut, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import adminService, { type PendingApprovalProperty } from '../../../services/admin.service';

const openDocument = async (documentUrl: string) => {
    if (!documentUrl) return;

    // Standard URL documents can be opened directly.
    if (documentUrl.startsWith('http://') || documentUrl.startsWith('https://')) {
        window.open(documentUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    // Browsers often block direct window.open(data:...) and keep about:blank.
    // Convert to Blob URL first, then open.
    if (documentUrl.startsWith('data:')) {
        try {
            const response = await fetch(documentUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank', 'noopener,noreferrer');
            return;
        } catch (error) {
            console.error('Failed to open base64 document', error);
            alert('Could not open this document. Please try again.');
            return;
        }
    }

    window.open(documentUrl, '_blank', 'noopener,noreferrer');
};

const PROPERTY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80';
type SortOrder = 'newest' | 'oldest';

const AdminPropertyApprovals = () => {
    const navigate = useNavigate();
    const [pendingProperties, setPendingProperties] = useState<PendingApprovalProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<PendingApprovalProperty | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

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

    const fetchPending = async () => {
        if (!hasValidAdminSession()) {
            navigate('/admin/auth/login', { replace: true });
            return;
        }
        setLoading(true);
        try {
            const properties = await adminService.getPendingProperties();
            setPendingProperties(properties);
        } catch (error: any) {
            console.error('Failed to fetch pending properties', error);
            if (error?.response?.status === 401) {
                navigate('/admin/auth/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchPending();
    }, []);

    const handleVerifyClick = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedProperty) return;
        if (action === 'REJECT' && !rejectionReason.trim()) {
            alert('A rejection reason is required.');
            return;
        }

        setActionLoading(true);
        try {
            await adminService.verifyProperty(selectedProperty.id, {
                action,
                rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
            });
            setSelectedProperty(null);
            setRejectionReason('');
            void fetchPending();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Verification failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authProvider');
        sessionStorage.removeItem('refreshToken');
        navigate('/admin/auth/login', { replace: true });
    };

    const sortedProperties = [...pendingProperties].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

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
                    <h1 className="text-xl font-bold tracking-tight">Property Approvals</h1>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 font-bold text-white shadow">
                        A
                    </div>
                </header>

                {loading ? (
                    <div className="grid min-h-[400px] place-items-center text-slate-500">Loading pending submissions...</div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-5 md:p-8">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/70 p-6">
                                <div>
                                    <h2 className="text-xl font-bold">Pending Approval Queue</h2>
                                    <p className="mt-1 text-sm text-slate-500">Review and moderate newly submitted properties.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        <FiClock /> Sort by
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                            className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                        </select>
                                    </div>
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{pendingProperties.length} Pending</span>
                                </div>
                            </div>

                            {pendingProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-slate-500">
                                    <FiCheckCircle size={48} className="mb-4 text-green-500" />
                                    <h3 className="mb-2 text-xl font-semibold text-slate-900">Queue is empty!</h3>
                                    <p>All properties have been reviewed.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {sortedProperties.map((prop) => (
                                        <article key={prop.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={prop.thumbnailUrl || PROPERTY_FALLBACK_IMAGE}
                                                    alt={prop.title}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                                                    {new Date(prop.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-base font-semibold">{prop.title}</h3>
                                            </div>
                                            <p className="mt-1 text-lg font-bold text-slate-900">${Number(prop.monthlyPrice || 0).toLocaleString()}/mo</p>
                                            <p className="text-sm text-slate-700">{prop.address}</p>
                                            <p className="mt-1 text-sm text-slate-700">
                                                Landlord: {(prop.landlord?.firstName || '').trim()} {(prop.landlord?.lastName || '').trim()} ({prop.landlord?.email})
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Added at: {new Date(prop.createdAt).toLocaleString()}
                                            </p>
                                            <div className="mt-4">
                                                <button
                                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                                    onClick={() => setSelectedProperty(prop)}
                                                >
                                                    Review Submission
                                                </button>
                                            </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm" onClick={() => setSelectedProperty(null)}>
                    <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <h2 className="text-xl font-bold">Review Property Submission</h2>
                            <button className="text-slate-500 transition hover:text-slate-700" onClick={() => setSelectedProperty(null)}><FiX size={22} /></button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                                <div className="xl:col-span-1">
                                    <h3 className="mb-3 border-b-2 border-slate-200 pb-2 text-lg font-semibold">Listing Preview</h3>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                                        <img
                                            src={selectedProperty.thumbnailUrl || PROPERTY_FALLBACK_IMAGE}
                                            alt={selectedProperty.title}
                                            className="h-56 w-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-3 border-b-2 border-slate-200 pb-2 text-lg font-semibold">Property Details</h3>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Title:</span> {selectedProperty.title}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Price:</span> ${Number(selectedProperty.monthlyPrice || 0).toLocaleString()}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Submitted:</span> {new Date(selectedProperty.createdAt).toLocaleString()}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Address:</span> {selectedProperty.address}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Furnishing:</span> {selectedProperty.furnishing || 'Not set'}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Type:</span> {selectedProperty.type || 'Not set'}</div>
                                    <div className="mt-4">
                                        <span className="mr-2 text-sm font-semibold text-slate-500">Description:</span>
                                        <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed">{selectedProperty.description}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-3 border-b-2 border-slate-200 pb-2 text-lg font-semibold">Landlord Details</h3>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Name:</span> {selectedProperty.landlord?.firstName} {selectedProperty.landlord?.lastName}</div>
                                    <div className="mb-2 text-sm"><span className="mr-2 font-semibold text-slate-500">Email:</span> {selectedProperty.landlord?.email}</div>

                                    <h3 className="mb-3 mt-6 border-b-2 border-slate-200 pb-2 text-lg font-semibold">Ownership Documents ({selectedProperty.ownershipDocs?.length || 0})</h3>
                                    <div className="flex flex-col gap-3">
                                        {selectedProperty.ownershipDocs?.map((doc, i) => (
                                            <button
                                                type="button"
                                                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                key={doc.id || i}
                                                onClick={() => void openDocument(doc.documentUrl)}
                                            >
                                                <FiFileText /> View Document {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Rejection Reason (if rejecting)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why this property is being rejected..."
                                        className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-500 focus:ring-2"
                                    />
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                                        onClick={() => handleVerifyClick('REJECT')}
                                        disabled={actionLoading}
                                    >
                                        <FiX /> Reject Submission
                                    </button>
                                    <button
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
                                        onClick={() => handleVerifyClick('APPROVE')}
                                        disabled={actionLoading}
                                    >
                                        <FiCheck /> Approve Listing
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AdminPropertyApprovals;
