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

    const cached = authService.getCurrentUser?.();
    const isTenant = cached?.user?.role === 'TENANT';

    const refresh = useCallback(async () => {
        if (!isTenant) return;
        try {
            const req = await maintenanceService.getAwaitingConfirmation();
            setPending(req);
        } catch {
            /* ignore — likely 401 if not authed yet */
        }
    }, [isTenant]);

    useEffect(() => {
        if (!isTenant) return;
        refresh();
        const id = window.setInterval(refresh, 60_000);
        return () => window.clearInterval(id);
    }, [isTenant, refresh]);

    useEffect(() => {
        if (!isTenant) return;
        const sock = socketService.connect();
        if (!sock) return;
        const handler = () => {
            void refresh();
        };
        socketService.onMaintenanceAwaitingConfirmation(handler);
        return () => {
            socketService.offMaintenanceAwaitingConfirmation(handler);
        };
    }, [isTenant, refresh]);

    if (!isTenant || !pending) return null;

    return (
        <CompletionConfirmModal
            request={pending}
            onResolved={() => setPending(null)}
        />
    );
};

export default MaintenanceConfirmationGate;
