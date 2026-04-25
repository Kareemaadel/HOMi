import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaMapMarkerAlt, FaUser, FaPhone, FaCar, FaCheckCircle } from 'react-icons/fa';
import maintenanceService, {
    type MaintenanceRequest,
    type MaintenanceLocationData,
} from '../../../../services/maintenance.service';
import socketService from '../../../../services/socket.service';
import './LiveTrackingModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: MaintenanceRequest | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

const LiveTrackingModal: React.FC<Props> = ({ isOpen, onClose, request }) => {
    const [location, setLocation] = useState<MaintenanceLocationData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !request) return;
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const cur = await maintenanceService.getCurrentLocation(request.id);
                if (!cancelled) setLocation(cur);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();

        socketService.connect();
        socketService.joinMaintenanceRequest(request.id);

        const handler = (payload: { requestId: string; lat: number; lng: number; reportedAt: string }) => {
            if (payload.requestId !== request.id) return;
            setLocation((prev) => ({
                lat: payload.lat,
                lng: payload.lng,
                reportedAt: payload.reportedAt,
                accuracyM: prev?.accuracyM ?? null,
                heading: prev?.heading ?? null,
                speed: prev?.speed ?? null,
            }));
        };
        socketService.onMaintenanceLocation(handler);

        return () => {
            cancelled = true;
            socketService.offMaintenanceLocation(handler);
            socketService.leaveMaintenanceRequest(request.id);
        };
    }, [isOpen, request]);

    const distanceKm = useMemo(() => {
        if (!location || !request?.property?.lat || !request?.property?.lng) return null;
        return haversineKm(location.lat, location.lng, request.property.lat, request.property.lng);
    }, [location, request]);

    if (!isOpen || !request) return null;

    const provider = request.provider;
    const fullName = `${provider?.firstName ?? ''} ${provider?.lastName ?? ''}`.trim();
    const status = request.status;
    const arrived = distanceKm != null && distanceKm < 0.1;

    return (
        <div className="lt-modal-overlay" onClick={onClose}>
            <div className="lt-modal" onClick={(e) => e.stopPropagation()}>
                <header className="lt-modal-header">
                    <div>
                        <h2>Live tracking</h2>
                        <p>
                            {status === 'EN_ROUTE'
                                ? 'Your maintainer is on the way to your property.'
                                : status === 'IN_PROGRESS'
                                ? 'Your maintainer arrived and is working on the issue.'
                                : 'Tracking the maintainer for this issue.'}
                        </p>
                    </div>
                    <button className="lt-close-btn" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="lt-modal-body">
                    <div className="lt-provider-card">
                        <div className="lt-avatar">
                            {provider?.avatarUrl ? <img src={provider.avatarUrl} alt={fullName} /> : <FaUser />}
                        </div>
                        <div className="lt-provider-info">
                            <h4>{provider?.businessName ?? fullName ?? 'Maintainer'}</h4>
                            <span className="lt-provider-type">{provider?.providerType === 'CENTER' ? 'Center' : 'Individual'}</span>
                            {provider?.phone && (
                                <a href={`tel:${provider.phone}`} className="lt-provider-phone">
                                    <FaPhone /> {provider.phone}
                                </a>
                            )}
                        </div>
                        <div className="lt-status-pill">
                            {arrived ? 'Arrived' : status === 'EN_ROUTE' ? 'En route' : status === 'IN_PROGRESS' ? 'Working' : status}
                        </div>
                    </div>

                    <div className="lt-map-placeholder">
                        {loading ? (
                            <span>Loading position…</span>
                        ) : location ? (
                            <div className="lt-position-card">
                                <FaMapMarkerAlt />
                                <div>
                                    <strong>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</strong>
                                    <small>Last update {new Date(location.reportedAt).toLocaleTimeString()}</small>
                                </div>
                            </div>
                        ) : (
                            <span>Waiting for the maintainer to start sharing location…</span>
                        )}

                        {request.property && (
                            <div className="lt-property-card">
                                <FaMapMarkerAlt />
                                <div>
                                    <strong>{request.property.title}</strong>
                                    <small>{request.property.address}</small>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lt-stats">
                        <div className="lt-stat">
                            <span className="lt-stat-label">Distance to property</span>
                            <strong>{distanceKm == null ? '—' : `${distanceKm.toFixed(2)} km`}</strong>
                        </div>
                        <div className="lt-stat">
                            <span className="lt-stat-label">Status</span>
                            <strong>
                                {arrived ? <><FaCheckCircle /> Arrived</> : <><FaCar /> {status.replace('_', ' ')}</>}
                            </strong>
                        </div>
                        <div className="lt-stat">
                            <span className="lt-stat-label">Speed</span>
                            <strong>{location?.speed != null ? `${(location.speed * 3.6).toFixed(0)} km/h` : '—'}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingModal;
