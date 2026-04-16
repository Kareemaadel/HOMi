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

    connect(): Socket | null {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            return null;
        }

        if (this.socket?.connected) {
            return this.socket;
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

        this.socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
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
}

export const socketService = new SocketService();
export default socketService;
