import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaStar, FaWallet, FaCheckCircle, FaUser, FaInfoCircle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import maintenanceService, {
    type MaintenanceJobApplication,
    type MaintenanceRequest,
    type TenantMaintenanceContext,
} from '../../../../services/maintenance.service';
import './ApplicationsModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: MaintenanceRequest | null;
    onAccepted: (updated: MaintenanceRequest) => void;
}

const ApplicationsModal: React.FC<Props> = ({ isOpen, onClose, request, onAccepted }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<MaintenanceJobApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen || !request) return;
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const [apps, ctx] = await Promise.all([
                    maintenanceService.listApplicationsForRequest(request.id),
                    maintenanceService.getTenantContext().catch(() => null),
                ]);
                if (cancelled) return;
                setApplications(apps);
                if (ctx) setWalletBalance(ctx.walletBalance);
            } catch (err: any) {
                if (!cancelled) setError(err?.response?.data?.message ?? 'Failed to load applications.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [isOpen, request]);

    const sorted = useMemo(
        () =>
            [...applications].sort((a, b) => {
                const aRate = a.provider?.rating ?? 0;
                const bRate = b.provider?.rating ?? 0;
                if (bRate !== aRate) return bRate - aRate;
                return a.finalPrice - b.finalPrice;
            }),
        [applications]
    );

    const handleAccept = async (app: MaintenanceJobApplication) => {
        if (!request) return;
        if (walletBalance != null && walletBalance < app.finalPrice) {
            setError(
                `Your wallet balance (EGP ${walletBalance.toFixed(2)}) is below the bid (EGP ${app.finalPrice.toFixed(2)}). Please top up first.`
            );
            return;
        }
        setError(null);
        setAcceptingId(app.id);
        try {
            const updated = await maintenanceService.acceptApplication(app.id);
            onAccepted(updated);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Could not accept this application.');
        } finally {
            setAcceptingId(null);
        }
    };

    if (!isOpen || !request) return null;

    return (
        <div className="apps-modal-overlay" onClick={onClose}>
            <div className="apps-modal" onClick={(e) => e.stopPropagation()}>
                <header className="apps-modal-header">
                    <div>
                        <h2>Provider applications</h2>
                        <p>{request.title} — pick the best offer. The price will be held in escrow.</p>
                    </div>
                    <button className="apps-close-btn" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="apps-modal-balance">
                    <FaWallet />
                    <span>Wallet:</span>
                    <strong>{walletBalance != null ? `EGP ${walletBalance.toFixed(2)}` : '—'}</strong>
                    <button className="apps-topup-btn" onClick={() => navigate('/balance')}>Top up</button>
                </div>

                {error && <div className="apps-modal-error">{error}</div>}

                <div className="apps-modal-body">
                    {loading ? (
                        <div className="apps-modal-empty">Loading applications…</div>
                    ) : sorted.length === 0 ? (
                        <div className="apps-modal-empty">
                            <FaInfoCircle /> No applications yet. We'll notify you the moment maintainers start applying.
                        </div>
                    ) : (
                        sorted.map((app) => {
                            const fullName = `${app.provider?.firstName ?? ''} ${app.provider?.lastName ?? ''}`.trim();
                            const insufficient = walletBalance != null && walletBalance < app.finalPrice;
                            return (
                                <div key={app.id} className="app-card">
                                    <div className="app-card-left">
                                        <div className="app-avatar">
                                            {app.provider?.avatarUrl ? (
                                                <img src={app.provider.avatarUrl} alt={fullName} />
                                            ) : (
                                                <FaUser />
                                            )}
                                        </div>
                                        <div className="app-info">
                                            <div className="app-name-row">
                                                <h4>{app.provider?.businessName ?? fullName ?? 'Maintainer'}</h4>
                                                <span className="app-type">
                                                    {app.provider?.providerType === 'CENTER' ? 'Center' : 'Individual'}
                                                </span>
                                            </div>
                                            <div className="app-rating-row">
                                                <FaStar />
                                                <span>{(app.provider?.rating ?? 0).toFixed(1)}</span>
                                                <span className="muted">({app.provider?.ratingsCount ?? 0} reviews)</span>
                                                {app.provider?.category && <span className="muted">• {app.provider.category}</span>}
                                            </div>
                                            {app.coverNote && <p className="app-note">{app.coverNote}</p>}
                                            {app.priceBreakdown && (
                                                <div className="app-breakdown">
                                                    <strong>Price breakdown:</strong> {app.priceBreakdown}
                                                </div>
                                            )}
                                            <div className="app-meta">
                                                {app.etaHours != null && (
                                                    <span><FaClock /> ETA {app.etaHours}h</span>
                                                )}
                                                <span>Submitted {new Date(app.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="app-card-right">
                                        <div className="app-price">
                                            <span className="app-price-label">Final price</span>
                                            <strong>EGP {app.finalPrice.toFixed(2)}</strong>
                                        </div>
                                        <button
                                            className="app-accept-btn"
                                            disabled={!!acceptingId || insufficient}
                                            onClick={() => handleAccept(app)}
                                        >
                                            {acceptingId === app.id ? 'Approving…' : insufficient ? 'Top up wallet' : (
                                                <><FaCheckCircle /> Approve & escrow</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationsModal;
