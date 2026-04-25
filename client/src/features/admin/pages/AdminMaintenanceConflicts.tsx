import React, { useCallback, useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiUser, FiHome, FiImage, FiX, FiTool } from 'react-icons/fi';
import maintenanceService, {
    type MaintenanceRequest,
    type MaintenanceConflictResolution,
} from '../../../services/maintenance.service';
import AdminSidebar from '../components/AdminSidebar';
import './adminDashboard.css';
import './AdminMaintenanceConflicts.css';

const AdminMaintenanceConflicts: React.FC = () => {
    const [items, setItems] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [resolving, setResolving] = useState<MaintenanceConflictResolution | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const rows = await maintenanceService.listConflicts({ all: showAll });
            setItems(rows);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to load conflicts.');
        } finally {
            setLoading(false);
        }
    }, [showAll]);

    useEffect(() => { void fetchItems(); }, [fetchItems]);

    const resolve = async (resolution: MaintenanceConflictResolution) => {
        if (!selected?.conflict) return;
        try {
            setResolving(resolution);
            const updated = await maintenanceService.resolveConflict(selected.conflict.id, {
                resolution,
                adminNotes: adminNotes.trim() || null,
            });
            setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSelected(null);
            setAdminNotes('');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to resolve.');
        } finally {
            setResolving(null);
        }
    };

    const renderUser = (label: string, party: any) => {
        if (!party) return null;
        const name = party.businessName ?? `${party.firstName ?? ''} ${party.lastName ?? ''}`.trim();
        return (
            <div className="amc-party">
                <div className="amc-party-avatar">
                    {party.avatarUrl ? <img src={party.avatarUrl} alt={name} /> : <FiUser />}
                </div>
                <div>
                    <span className="amc-party-label">{label}</span>
                    <strong>{name || '—'}</strong>
                    {party.phone && <small>{party.phone}</small>}
                </div>
            </div>
        );
    };

    return (
        <div className="admin-shell">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1><FiAlertTriangle style={{ marginRight: 8, color: '#ef4444' }} /> Maintenance Conflicts</h1>
                        <p>Review disputes between tenants and maintainers and decide who should be charged.</p>
                    </div>
                    <label className="amc-toggle">
                        <input
                            type="checkbox"
                            checked={showAll}
                            onChange={(e) => setShowAll(e.target.checked)}
                        />
                        Show resolved
                    </label>
                </header>

                {error && <div className="amc-error">{error}</div>}

                {loading ? (
                    <p>Loading…</p>
                ) : items.length === 0 ? (
                    <div className="amc-empty">
                        <FiCheck size={28} />
                        <p>No open conflicts. Great work!</p>
                    </div>
                ) : (
                    <div className="amc-list">
                        {items.map((req) => {
                            const conflict = req.conflict;
                            return (
                                <div key={req.id} className="amc-card">
                                    <div className="amc-card-head">
                                        <div>
                                            <span className="amc-card-tag">{req.category}</span>
                                            <h3>{req.title}</h3>
                                            <p>{req.description}</p>
                                        </div>
                                        <div className="amc-card-price">
                                            <span>Disputed amount</span>
                                            <strong>EGP {Number(req.escrowAmount ?? req.agreedPrice ?? 0).toFixed(2)}</strong>
                                            <span className={`amc-status amc-status-${conflict?.status?.toLowerCase()}`}>
                                                {conflict?.status === 'OPEN' ? 'Open' : 'Resolved'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="amc-grid">
                                        {renderUser('Tenant', req.tenant)}
                                        {renderUser('Landlord', req.landlord)}
                                        {renderUser('Maintainer', req.provider)}
                                        {req.property && (
                                            <div className="amc-party">
                                                <div className="amc-party-avatar"><FiHome /></div>
                                                <div>
                                                    <span className="amc-party-label">Property</span>
                                                    <strong>{req.property.title}</strong>
                                                    <small>{req.property.address}</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {conflict && (
                                        <div className="amc-conflict-info">
                                            <div>
                                                <span className="amc-conflict-label">Tenant says:</span>
                                                <p>{conflict.tenantReason}</p>
                                            </div>
                                            {conflict.providerCompletionNotes && (
                                                <div>
                                                    <span className="amc-conflict-label">Maintainer says:</span>
                                                    <p>{conflict.providerCompletionNotes}</p>
                                                </div>
                                            )}
                                            {conflict.adminNotes && conflict.status === 'RESOLVED' && (
                                                <div>
                                                    <span className="amc-conflict-label">Admin notes:</span>
                                                    <p>{conflict.adminNotes}</p>
                                                </div>
                                            )}
                                            {conflict.status === 'RESOLVED' && (
                                                <div>
                                                    <span className="amc-conflict-label">Resolution:</span>
                                                    <p>
                                                        {conflict.resolution === 'CHARGE_TENANT'
                                                            ? 'Tenant was charged — money released to maintainer.'
                                                            : 'Maintainer absorbed cost — refund to tenant.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="amc-images">
                                        <div>
                                            <span className="amc-images-label"><FiImage /> Issue photos</span>
                                            <div className="amc-thumbs">
                                                {req.images.length === 0 && <small>No photos</small>}
                                                {req.images.map((u, i) => (
                                                    <a key={i} href={u} target="_blank" rel="noreferrer">
                                                        <img src={u} alt={`issue ${i + 1}`} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="amc-images-label"><FiTool /> Completion photos</span>
                                            <div className="amc-thumbs">
                                                {req.completionImages.length === 0 && <small>No photos</small>}
                                                {req.completionImages.map((u, i) => (
                                                    <a key={i} href={u} target="_blank" rel="noreferrer">
                                                        <img src={u} alt={`completion ${i + 1}`} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {conflict?.status === 'OPEN' && (
                                        <div className="amc-actions">
                                            <button className="amc-btn amc-btn-primary" onClick={() => setSelected(req)}>
                                                Resolve case
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {selected && (
                    <div className="amc-overlay" onClick={() => setSelected(null)}>
                        <div className="amc-modal" onClick={(e) => e.stopPropagation()}>
                            <header>
                                <h2>Resolve dispute</h2>
                                <button className="amc-close" onClick={() => setSelected(null)}><FiX /></button>
                            </header>
                            <p>
                                Decide who should bear the EGP {Number(selected.escrowAmount ?? selected.agreedPrice ?? 0).toFixed(2)} in escrow for "
                                <strong>{selected.title}</strong>".
                            </p>
                            <textarea
                                placeholder="Notes (visible to both parties)…"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={4}
                            />
                            <div className="amc-actions">
                                <button
                                    className="amc-btn amc-btn-success"
                                    disabled={!!resolving}
                                    onClick={() => resolve('CHARGE_TENANT')}
                                >
                                    {resolving === 'CHARGE_TENANT' ? 'Releasing…' : 'Charge tenant — pay maintainer'}
                                </button>
                                <button
                                    className="amc-btn amc-btn-danger"
                                    disabled={!!resolving}
                                    onClick={() => resolve('CHARGE_PROVIDER')}
                                >
                                    {resolving === 'CHARGE_PROVIDER' ? 'Refunding…' : 'Charge maintainer — refund tenant'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminMaintenanceConflicts;
