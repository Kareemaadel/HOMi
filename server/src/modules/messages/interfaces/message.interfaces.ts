export interface StartConversationInput {
    participantId: string;
    propertyId?: string;
    initialMessage?: string;
}

export interface SendMessageInput {
    body: string;
}

export interface ConversationListQuery {
    page?: number;
    limit?: number;
}

export interface ConversationMessagesQuery {
    page?: number;
    limit?: number;
}

export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date;
    readAt: Date | null;
}

export interface ConversationCounterpart {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface ConversationResponse {
    id: string;
    propertyId: string | null;
    counterpart: ConversationCounterpart;
    lastMessage: MessageResponse | null;
    unreadCount: number;
    lastMessageAt: Date | null;
    updatedAt: Date;
}

export interface PaginationResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ConversationListResponse {
    conversations: ConversationResponse[];
    pagination: PaginationResponse;
}

export interface ConversationMessagesResponse {
    messages: MessageResponse[];
    pagination: PaginationResponse;
}
