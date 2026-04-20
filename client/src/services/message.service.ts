import apiClient from '../config/api';

export interface MessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: string;
    readAt: string | null;
}

export interface ConversationCounterpart {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface ConversationDto {
    id: string;
    propertyId: string | null;
    /** True for Help Center / admin support threads */
    isSupport?: boolean;
    counterpart: ConversationCounterpart;
    lastMessage: MessageDto | null;
    unreadCount: number;
    lastMessageAt: string | null;
    updatedAt: string;
}

export interface PaginationDto {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ConversationsApiResponse {
    success: boolean;
    data: ConversationDto[];
    pagination: PaginationDto;
}

interface MessagesApiResponse {
    success: boolean;
    data: MessageDto[];
    pagination: PaginationDto;
}

interface SendMessageApiResponse {
    success: boolean;
    data: MessageDto;
}

interface MarkReadApiResponse {
    success: boolean;
    data: { markedCount: number };
}

interface SupportThreadApiResponse {
    success: boolean;
    data: {
        conversation: ConversationDto;
        messages: MessageDto[];
    };
}

interface SupportSendApiResponse {
    success: boolean;
    data: {
        userMessage: MessageDto;
        autoReply: MessageDto | null;
    };
}

interface UnreadBadgeApiResponse {
    success: boolean;
    data: { hasUnread: boolean; unreadCount: number };
}

class MessageService {
    async getUnreadBadge() {
        const response = await apiClient.get<UnreadBadgeApiResponse>('/messages/unread-badge');
        return response.data;
    }

    async listConversations(params?: { page?: number; limit?: number }) {
        const response = await apiClient.get<ConversationsApiResponse>('/messages/conversations', { params });
        return response.data;
    }

    async getConversationMessages(conversationId: string, params?: { page?: number; limit?: number }) {
        const response = await apiClient.get<MessagesApiResponse>(`/messages/conversations/${conversationId}/messages`, {
            params,
        });
        return response.data;
    }

    async sendMessage(conversationId: string, body: string) {
        const response = await apiClient.post<SendMessageApiResponse>(`/messages/conversations/${conversationId}/messages`, {
            body,
        });
        return response.data;
    }

    async markConversationRead(conversationId: string) {
        const response = await apiClient.patch<MarkReadApiResponse>(`/messages/conversations/${conversationId}/read`);
        return response.data;
    }

    async startConversation(payload: { participantId: string; propertyId?: string; initialMessage?: string }) {
        const response = await apiClient.post<{ success: boolean; data: ConversationDto }>('/messages/conversations', payload);
        return response.data;
    }

    async getSupportThread() {
        const response = await apiClient.get<SupportThreadApiResponse>('/messages/support');
        return response.data.data;
    }

    async sendSupportMessage(body: string) {
        const response = await apiClient.post<SupportSendApiResponse>('/messages/support/messages', { body });
        return response.data.data;
    }
}

export const messageService = new MessageService();
export default messageService;
