import React, { useCallback, useEffect, useState } from 'react';
import Header from '../../../../../components/global/header';
import Footer from '../../../../../components/global/footer';
import MaintenanceSideBar from '../../SideBar/MaintenanceSideBar';
import './JobRequests.css';
import {
    FaTools, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaMapMarkerAlt, FaUser, FaInfoCircle,
} from 'react-icons/fa';
import maintenanceService, {
    type MaintenanceJobApplication,
    type MaintenanceJobApplicationStatus,
} from '../../../../../services/maintenance.service';

const STATUS_FILTERS: { id: 'ALL' | MaintenanceJobApplicationStatus; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'WITHDRAWN', label: 'Withdrawn' },
];

function statusBadge(status: MaintenanceJobApplicationStatus) {
    switch (status) {
        case 'PENDING':
            return { cls: 'pending', icon: <FaHourglassHalf />, label: 'Pending' };
        case 'ACCEPTED':
            return { cls: 'accepted', icon: <FaCheckCircle />, label: 'Accepted' };
        case 'REJECTED':
            return { cls: 'rejected', icon: <FaTimesCircle />, label: 'Rejected' };
        case 'WITHDRAWN':
            return { cls: 'withdrawn', icon: <FaTimesCircle />, label: 'Withdrawn' };
    }
}

const JobRequests: React.FC = () => {
    const [filter, setFilter] = useState<'ALL' | MaintenanceJobApplicationStatus>('ALL');
    const [apps, setApps] = useState<MaintenanceJobApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const list = await maintenanceService.listMyApplications();
            setApps(list);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to load your applications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const filtered = filter === 'ALL' ? apps : apps.filter((a) => a.status === filter);

    const counts = {
        all: apps.length,
        pending: apps.filter((a) => a.status === 'PENDING').length,
        accepted: apps.filter((a) => a.status === 'ACCEPTED').length,
        rejected: apps.filter((a) => a.status === 'REJECTED').length,
    };

    return (
        <div className="maintenance-job-requests-page">
            <Header />

            <div className="maintenance-layout">
                <MaintenanceSideBar />

                <main className="job-requests-content">
                    <div className="job-requests-header">
                        <div>
                            <h1 className="page-title">My applications</h1>
                            <p className="page-subtitle">Track every job you've applied to. Accepted ones move to "My Jobs".</p>
                        </div>

                        <div className="job-requests-actions">
                            <div className="filter-group">
                                <span className="filter-label">Filter:</span>
                                <div className="filter-buttons">
                                    {STATUS_FILTERS.map((f) => (
                                        <button
                                            key={f.id}
                                            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
                                            onClick={() => setFilter(f.id)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="job-requests-summary">
                        <div className="summary-card">
                            <div className="summary-value">{counts.all}</div>
                            <div className="summary-label">Total applications</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value high">{counts.pending}</div>
                            <div className="summary-label">Pending review</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value active">{counts.accepted}</div>
                            <div className="summary-label">Accepted</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-value critical">{counts.rejected}</div>
                            <div className="summary-label">Rejected</div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12 }}>
                            {error}
                        </div>
                    )}

                    <div className="job-requests-grid">
                        {loading ? (
                            <div className="no-requests-found"><h3>Loading…</h3></div>
                        ) : filtered.length > 0 ? (
                            filtered.map((app) => {
                                const badge = statusBadge(app.status);
                                const req = app.request;
                                return (
                                    <div className="app-card" key={app.id}>
                                        <div className="app-card-top">
                                            <div className="app-icon"><FaTools /></div>
                                            <div className={`app-badge app-badge-${badge.cls}`}>
                                                {badge.icon} {badge.label}
                                            </div>
                                        </div>

                                        <h4 className="app-title">{req?.title ?? 'Maintenance request'}</h4>
                                        <p className="app-desc">{req?.description ?? ''}</p>

                                        <div className="app-meta">
                                            <div><FaUser /> {req?.tenant ? `${req.tenant.firstName} ${req.tenant.lastName}` : '—'}</div>
                                            {req?.property && <div><FaMapMarkerAlt /> {req.property.address}</div>}
                                        </div>

                                        <div className="app-price-row">
                                            <div>
                                                <span className="app-price-label">Your bid</span>
                                                <strong className="app-price-amount">EGP {Number(app.finalPrice).toLocaleString()}</strong>
                                            </div>
                                            {app.etaHours != null && (
                                                <div>
                                                    <span className="app-price-label">ETA</span>
                                                    <strong>{app.etaHours}h</strong>
                                                </div>
                                            )}
                                        </div>

                                        {app.coverNote && <p className="app-note"><FaInfoCircle /> "{app.coverNote}"</p>}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-requests-found">
                                <div className="empty-state-icon">📋</div>
                                <h3>No applications yet</h3>
                                <p>Browse the marketplace to find your first job and submit your final price.</p>
                                <button className="btn-clear-filter" onClick={() => window.location.href = '/available-jobs'}>
                                    Browse marketplace
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default JobRequests;
