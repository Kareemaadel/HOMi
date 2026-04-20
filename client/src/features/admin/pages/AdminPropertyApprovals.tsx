import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCheck, FiCheckCircle, FiFileText, FiHome, FiLogOut, FiX, FiClock, FiAlertTriangle, FiActivity, FiMessageCircle, FiUsers } from 'react-icons/fi';
import adminService, { type PendingApprovalProperty } from '../../../services/admin.service';
import './adminDashboard.css';
import './AdminPropertyApprovals.css';

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        return response?.data?.message || fallback;
    }
    return fallback;
};

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
        } catch (error: unknown) {
            console.error('Failed to fetch pending properties', error);
            if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401) {
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
        } catch (error: unknown) {
            alert(getErrorMessage(error, 'Verification failed'));
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
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Moderation workspace</p>
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
                        <h1>Property Approvals</h1>
                        <p>Review submissions and verify listings quickly.</p>
                    </div>
                    <div className="admin-avatar">A</div>
                </header>

                {loading ? (
                    <div className="admin-state">Loading pending submissions...</div>
                ) : (
                    <div className="admin-content">
                        <section className="panel approval-panel">
                            <div className="approval-head">
                                <div>
                                    <h3>Pending Approval Queue</h3>
                                    <p>Moderate newly submitted properties.</p>
                                </div>
                                <div className="approval-controls">
                                    <label>
                                        <FiClock />
                                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                        </select>
                                    </label>
                                    <span>{pendingProperties.length} Pending</span>
                                </div>
                            </div>

                            {pendingProperties.length === 0 ? (
                                <div className="approval-empty">
                                    <FiCheckCircle size={44} />
                                    <h4>Queue is empty!</h4>
                                </div>
                            ) : (
                                <div className="approval-grid">
                                    {sortedProperties.map((prop) => (
                                        <article key={prop.id} className="approval-card">
                                            <div className="approval-card-image">
                                                <img src={prop.thumbnailUrl || PROPERTY_FALLBACK_IMAGE} alt={prop.title} />
                                                <span>{new Date(prop.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="approval-card-body">
                                                <h4>{prop.title}</h4>
                                                <p className="price">${Number(prop.monthlyPrice || 0).toLocaleString()}/mo</p>
                                                <p>{prop.address}</p>
                                                <p className="landlord">
                                                    Landlord: {(prop.landlord?.firstName || '').trim()} {(prop.landlord?.lastName || '').trim()} ({prop.landlord?.email})
                                                </p>
                                                <button type="button" onClick={() => setSelectedProperty(prop)}>Review Submission</button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>

            {selectedProperty && (
                <div className="modal-backdrop" onClick={() => setSelectedProperty(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>Review Property Submission</h2>
                            <button type="button" onClick={() => setSelectedProperty(null)}><FiX size={22} /></button>
                        </div>

                        <div className="approval-modal-body">
                            <div className="modal-preview">
                                <img src={selectedProperty.thumbnailUrl || PROPERTY_FALLBACK_IMAGE} alt={selectedProperty.title} />
                            </div>
                            <div className="modal-details">
                                <h3>{selectedProperty.title}</h3>
                                <p><b>Price:</b> ${Number(selectedProperty.monthlyPrice || 0).toLocaleString()}</p>
                                <p><b>Submitted:</b> {new Date(selectedProperty.createdAt).toLocaleString()}</p>
                                <p><b>Address:</b> {selectedProperty.address}</p>
                                <p><b>Furnishing:</b> {selectedProperty.furnishing || 'Not set'}</p>
                                <p><b>Type:</b> {selectedProperty.type || 'Not set'}</p>
                                <p className="description">{selectedProperty.description}</p>
                            </div>
                            <div className="modal-landlord">
                                <h3>Landlord</h3>
                                <p>{selectedProperty.landlord?.firstName} {selectedProperty.landlord?.lastName}</p>
                                <p>{selectedProperty.landlord?.email}</p>
                                <h4>Ownership Documents</h4>
                                {selectedProperty.ownershipDocs?.map((doc, i) => (
                                    <button type="button" key={doc.id || i} onClick={() => void openDocument(doc.documentUrl)}>
                                        <FiFileText /> View Document {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="approval-actions">
                            <label>Rejection Reason</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this property is being rejected..."
                            />
                            <div className="action-buttons">
                                <button type="button" className="reject-btn" onClick={() => handleVerifyClick('REJECT')} disabled={actionLoading}><FiX /> Reject</button>
                                <button type="button" className="approve-btn" onClick={() => handleVerifyClick('APPROVE')} disabled={actionLoading}><FiCheck /> Approve</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPropertyApprovals;
