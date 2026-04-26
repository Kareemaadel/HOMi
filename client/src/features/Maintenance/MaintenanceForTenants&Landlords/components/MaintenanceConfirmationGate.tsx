import React, { useEffect, useState, useCallback } from 'react';
import maintenanceService, {
    type MaintenanceRequest,
} from '../../../../services/maintenance.service';
import socketService from '../../../../services/socket.service';
import authService from '../../../../services/auth.service';
import CompletionConfirmModal from './CompletionConfirmModal';

/**
 * A globally-mounted gate that, for tenants, fetches any AWAITING_CONFIRMATION
 * maintenance request. If one exists, the user is forced into the
 * <CompletionConfirmModal /> until they answer (confirm or dispute).
 */
const MaintenanceConfirmationGate: React.FC = () => {
    const [pending, setPending] = useState<MaintenanceRequest | null>(null);
    const [disabledByAuth, setDisabledByAuth] = useState(false);

    const cached = authService.getCurrentUser?.();
    const isTenant = cached?.user?.role === 'TENANT';

    const refresh = useCallback(async () => {
        if (!isTenant || disabledByAuth) return;
        try {
            const req = await maintenanceService.getAwaitingConfirmation();
            setPending(req);
        } catch (err: any) {
            if (err?.response?.status === 401) {
                setDisabledByAuth(true);
                socketService.disconnect();
            }
        }
    }, [isTenant, disabledByAuth]);

    useEffect(() => {
        if (!isTenant || disabledByAuth) return;
        refresh();
        const id = window.setInterval(refresh, 60_000);
        return () => window.clearInterval(id);
    }, [isTenant, disabledByAuth, refresh]);

    useEffect(() => {
        if (!isTenant || disabledByAuth) return;
        const sock = socketService.connect();
        if (!sock) return;
        const handler = () => {
            void refresh();
        };
        socketService.onMaintenanceAwaitingConfirmation(handler);
        return () => {
            socketService.offMaintenanceAwaitingConfirmation(handler);
        };
    }, [isTenant, disabledByAuth, refresh]);

    if (!isTenant || !pending) return null;

    return (
        <CompletionConfirmModal
            request={pending}
            onResolved={() => setPending(null)}
        />
    );
};

export default MaintenanceConfirmationGate;
