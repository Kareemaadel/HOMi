import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FiActivity,
    FiAlertTriangle,
    FiCheck,
    FiFileText,
    FiHome,
    FiLogOut,
    FiMessageCircle,
    FiTool,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import adminService, { type PendingMaintenanceApplication } from '../../../services/admin.service';
import './adminDashboard.css';
import './AdminMaintenanceApprovals.css';

const AdminMaintenanceApprovals = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<PendingMaintenanceApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [selected, setSelected] = useState<PendingMaintenanceApplication | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const rows = await adminService.getPendingMaintenanceApplications();
            setItems(rows);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchItems();
    }, []);

    const review = async (action: 'APPROVE' | 'REJECT') => {
        if (!selected) return;
        if (action === 'REJECT' && !reason.trim()) {
            alert('Please add a rejection reason.');
            return;
        }
        await adminService.reviewMaintenanceApplication(selected.id, {
            action,
            rejectionReason: action === 'REJECT' ? reason : undefined,
        });
        setSelected(null);
        setReason('');
        void fetchItems();
    };

    const isImageData = (value: string | null | undefined) => Boolean(value && value.startsWith('data:image/'));
    const isPdfData = (value: string | null | undefined) => Boolean(value && value.startsWith('data:application/pdf'));

    const getAvatarSrc = (item: PendingMaintenanceApplication): string | null => {
        if (item.providerType === 'INDIVIDUAL' && isImageData(item.selfieImage)) {
            return item.selfieImage;
        }
        if (item.providerType === 'CENTER') {
            const firstImageDoc = (item.documentationFiles || []).find((file) => isImageData(file));
            return firstImageDoc || null;
        }
        return null;
    };

    const openInNewTab = (fileData: string) => {
        if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
            window.open(fileData, '_blank', 'noopener,noreferrer');
            return;
        }
        if (fileData.startsWith('data:')) {
            window.open(fileData, '_blank', 'noopener,noreferrer');
        }
    };

    const signOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        sessionStorage.removeItem('refreshToken');
        navigate('/admin/auth/login', { replace: true });
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand-card">
                    <p className="admin-brand-team">Admin Team</p>
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Maintenance approvals</p>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard"><FiHome /> Dashboard</NavLink>
                    <NavLink to="/admin/property-approvals"><FiFileText /> Property Approvals</NavLink>
                    <NavLink to="/admin/maintenance-approvals"><FiTool /> Maintenance Requests</NavLink>
                    <NavLink to="/admin/user-reports"><FiAlertTriangle /> User Reports</NavLink>
                    <NavLink to="/admin/user-management"><FiUsers /> User Management</NavLink>
                    <NavLink to="/admin/support-inbox"><FiMessageCircle /> Help Center</NavLink>
                    <NavLink to="/admin/activity-logs"><FiActivity /> Activity Logs</NavLink>
                </nav>
                <button className="admin-signout" type="button" onClick={signOut}><FiLogOut /> Sign out</button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Maintenance Provider Requests</h1>
                        <p>Approve or reject provider onboarding requests.</p>
                    </div>
                    <div className="admin-avatar">A</div>
                </header>
                <div className="admin-content">
                    {loading ? <div className="admin-state">Loading requests...</div> : (
                        <section className="panel maintenance-requests-panel">
                            {items.length === 0 ? <p>No pending requests.</p> : (
                                <div className="maintenance-requests-grid">
                                    {items.map((item) => {
                                        const avatarSrc = getAvatarSrc(item);
                                        return (
                                            <article key={item.id} className="maintenance-request-card">
                                                <div className="maintenance-card-header">
                                                    {avatarSrc ? (
                                                        <img src={avatarSrc} alt={`${item.firstName} ${item.lastName}`} className="maintenance-avatar" />
                                                    ) : (
                                                        <div className="maintenance-avatar-fallback">
                                                            {(item.firstName?.[0] || 'M').toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3>{item.firstName} {item.lastName}</h3>
                                                        <p>{item.providerType === 'CENTER' ? 'Center / Company' : 'Individual'}</p>
                                                    </div>
                                                </div>
                                                <div className="maintenance-card-body">
                                                    <p><span>Email</span> {item.email}</p>
                                                    <p><span>Category</span> {item.category}</p>
                                                    <p><span>Submitted</span> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="maintenance-card-footer">
                                                    <button type="button" onClick={() => setSelected(item)}>View Details</button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>

            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>Review request</h2>
                            <button type="button" onClick={() => setSelected(null)}><FiX size={22} /></button>
                        </div>
                        <div className="maintenance-detail-top">
                            {getAvatarSrc(selected) ? (
                                <img src={getAvatarSrc(selected) || ''} alt={`${selected.firstName} ${selected.lastName}`} className="maintenance-avatar detail" />
                            ) : (
                                <div className="maintenance-avatar-fallback detail">
                                    {(selected.firstName?.[0] || 'M').toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3>{selected.firstName} {selected.lastName}</h3>
                                <p>{selected.email}</p>
                                <p>{selected.phone}</p>
                            </div>
                        </div>
                        <div className="maintenance-detail-meta">
                            <p><span>Provider type</span> {selected.providerType}</p>
                            <p><span>Main category</span> {selected.category}</p>
                            {selected.providerType === 'CENTER' && (
                                <>
                                    <p><span>All categories</span> {(selected.categories || []).join(', ') || '-'}</p>
                                    <p><span>Employees</span> {selected.numberOfEmployees || '-'}</p>
                                    <p><span>Location</span> {selected.companyLocation || '-'}</p>
                                </>
                            )}
                        </div>
                        <p className="maintenance-notes">{selected.notes || 'No additional notes provided.'}</p>
                        {selected.providerType === 'INDIVIDUAL' && (
                            <div className="maintenance-media-grid">
                                {selected.selfieImage && (
                                    <div className="maintenance-media-item">
                                        <h4>Selfie</h4>
                                        {isImageData(selected.selfieImage) ? (
                                            <img src={selected.selfieImage} alt="Selfie" />
                                        ) : (
                                            <button type="button" onClick={() => openInNewTab(selected.selfieImage)}>Open File</button>
                                        )}
                                    </div>
                                )}
                                {selected.nationalIdFront && (
                                    <div className="maintenance-media-item">
                                        <h4>National ID Front</h4>
                                        {isImageData(selected.nationalIdFront) ? (
                                            <img src={selected.nationalIdFront} alt="National ID front" />
                                        ) : (
                                            <button type="button" onClick={() => openInNewTab(selected.nationalIdFront)}>Open File</button>
                                        )}
                                    </div>
                                )}
                                {selected.nationalIdBack && (
                                    <div className="maintenance-media-item">
                                        <h4>National ID Back</h4>
                                        {isImageData(selected.nationalIdBack) ? (
                                            <img src={selected.nationalIdBack} alt="National ID back" />
                                        ) : (
                                            <button type="button" onClick={() => openInNewTab(selected.nationalIdBack)}>Open File</button>
                                        )}
                                    </div>
                                )}
                                {selected.criminalRecordDocument && (
                                    <div className="maintenance-media-item">
                                        <h4>Criminal Record Certificate</h4>
                                        {isImageData(selected.criminalRecordDocument) ? (
                                            <img src={selected.criminalRecordDocument} alt="Criminal record" />
                                        ) : isPdfData(selected.criminalRecordDocument) ? (
                                            <iframe src={selected.criminalRecordDocument} title="Criminal record PDF" />
                                        ) : (
                                            <button type="button" onClick={() => openInNewTab(selected.criminalRecordDocument)}>Open File</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {selected.providerType === 'CENTER' && (
                            <div className="maintenance-media-grid">
                                {(selected.documentationFiles || []).map((item, idx) => (
                                    <div key={`doc-${idx}`} className="maintenance-media-item">
                                        <h4>Company Document {idx + 1}</h4>
                                        {isImageData(item) ? (
                                            <img src={item} alt={`Company document ${idx + 1}`} />
                                        ) : isPdfData(item) ? (
                                            <iframe src={item} title={`Company document ${idx + 1}`} />
                                        ) : (
                                            <button type="button" onClick={() => openInNewTab(item)}>Open File</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Rejection reason (required for reject)"
                            className="maintenance-reject-reason"
                        />
                        <div className="maintenance-review-actions">
                            <button type="button" className="reject-btn" onClick={() => void review('REJECT')}><FiX /> Reject</button>
                            <button type="button" className="approve-btn" onClick={() => void review('APPROVE')}><FiCheck /> Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMaintenanceApprovals;
