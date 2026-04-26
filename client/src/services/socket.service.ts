import { io, type Socket } from 'socket.io-client';

export interface ConversationUpdatedEvent {
    conversationId: string;
    message: {
        id: string;
        conversationId: string;
        senderId: string;
        body: string;
        createdAt: string;
        readAt: string | null;
    };
    lastMessageAt: string;
}

export interface ConversationReadEvent {
    conversationId: string;
    readerUserId: string;
    markedCount: number;
}

class SocketService {
    private socket: Socket | null = null;
    private forcedDisabled = false;

    connect(): Socket | null {
        if (this.forcedDisabled) return null;
        const token = localStorage.getItem('accessToken');
        if (!token) {
            this.disconnect();
            return null;
        }

        if (this.socket) {
            this.socket.auth = { token };
            if (!this.socket.connected && !this.socket.active) {
                this.socket.connect();
            }
            return this.socket;
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

        this.socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1500,
        });

        this.socket.on('connect_error', (err: any) => {
            const message = String(err?.message ?? '').toLowerCase();
            if (message.includes('unauthorized') || message.includes('authentication')) {
                this.forcedDisabled = true;
                this.disconnect();
            }
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    resetAuthState(): void {
        this.forcedDisabled = false;
    }

    joinConversation(conversationId: string): void {
        this.socket?.emit('conversation:join', { conversationId });
    }

    leaveConversation(conversationId: string): void {
        this.socket?.emit('conversation:leave', { conversationId });
    }

    onConversationUpdated(handler: (payload: ConversationUpdatedEvent) => void): void {
        this.socket?.on('conversation:updated', handler);
    }

    offConversationUpdated(handler: (payload: ConversationUpdatedEvent) => void): void {
        this.socket?.off('conversation:updated', handler);
    }

    onMessageNew(handler: (payload: ConversationUpdatedEvent) => void): void {
        this.socket?.on('message:new', handler);
    }

    offMessageNew(handler: (payload: ConversationUpdatedEvent) => void): void {
        this.socket?.off('message:new', handler);
    }

    onConversationRead(handler: (payload: ConversationReadEvent) => void): void {
        this.socket?.on('conversation:read', handler);
    }

    offConversationRead(handler: (payload: ConversationReadEvent) => void): void {
        this.socket?.off('conversation:read', handler);
    }

    // ─── Maintenance ────────────────────────────────────────────────────────
    joinMaintenanceRequest(requestId: string): void {
        this.socket?.emit('maintenance:join', { requestId });
    }

    leaveMaintenanceRequest(requestId: string): void {
        this.socket?.emit('maintenance:leave', { requestId });
    }

    onMaintenanceLocation(
        handler: (payload: { requestId: string; lat: number; lng: number; reportedAt: string }) => void
    ): void {
        this.socket?.on('maintenance:location', handler);
    }

    offMaintenanceLocation(
        handler: (payload: { requestId: string; lat: number; lng: number; reportedAt: string }) => void
    ): void {
        this.socket?.off('maintenance:location', handler);
    }

    onMaintenanceStatus(
        handler: (payload: { requestId: string; status: string }) => void
    ): void {
        this.socket?.on('maintenance:status', handler);
    }

    offMaintenanceStatus(
        handler: (payload: { requestId: string; status: string }) => void
    ): void {
        this.socket?.off('maintenance:status', handler);
    }

    onMaintenanceAwaitingConfirmation(
        handler: (payload: { requestId: string }) => void
    ): void {
        this.socket?.on('maintenance:awaiting_confirmation', handler);
    }

    offMaintenanceAwaitingConfirmation(
        handler: (payload: { requestId: string }) => void
    ): void {
        this.socket?.off('maintenance:awaiting_confirmation', handler);
    }

    // ─── Notifications ──────────────────────────────────────────────────────
    onNotificationNew(handler: (payload: unknown) => void): void {
        this.socket?.on('notification:new', handler);
    }

    offNotificationNew(handler: (payload: unknown) => void): void {
        this.socket?.off('notification:new', handler);
    }
}

export const socketService = new SocketService();
export default socketService;
