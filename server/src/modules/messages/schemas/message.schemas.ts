import { z } from 'zod';

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const StartConversationSchema = z.object({
    participantId: z.string().regex(UUID_REGEX, 'participantId must be a valid UUID'),
    propertyId: z.string().regex(UUID_REGEX, 'propertyId must be a valid UUID').optional(),
    initialMessage: z
        .string()
        .trim()
        .min(1, 'initialMessage cannot be empty')
        .max(4000, 'initialMessage cannot exceed 4000 characters')
        .optional(),
});

export const SendMessageSchema = z.object({
    body: z
        .string()
        .trim()
        .min(1, 'Message cannot be empty')
        .max(4000, 'Message cannot exceed 4000 characters'),
});

export const ConversationListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ConversationMessagesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export default {
    StartConversationSchema,
    SendMessageSchema,
    ConversationListQuerySchema,
    ConversationMessagesQuerySchema,
};
