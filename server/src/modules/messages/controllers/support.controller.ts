import type { Request, Response, NextFunction } from 'express';
import type { Message } from '../models/Message.js';
import type { UserRoleType } from '../../auth/models/User.js';
import { messageService } from '../services/message.service.js';
import { getOrCreateSupportConversation, sendSupportUserMessage } from '../services/support.service.js';
import type { MessageResponse } from '../interfaces/message.interfaces.js';

function toMessageResponse(message: Message): MessageResponse {
    return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        body: message.body,
        createdAt: message.created_at!,
        readAt: message.read_at ?? null,
    };
}

class SupportController {
    async getSupportThread(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const role = (req as any).user.role as UserRoleType;
            const conversation = await getOrCreateSupportConversation(userId);
            const [detail, messagesResult] = await Promise.all([
                messageService.getConversationWithUnreadForUser(userId, conversation.id, role),
                messageService.getConversationMessages(userId, conversation.id, { page: 1, limit: 100 }, role),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    conversation: detail,
                    messages: messagesResult.messages,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async sendSupportMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const input = req.body as { body: string };
            const { userMessage, autoReply } = await sendSupportUserMessage(userId, input.body);

            res.status(201).json({
                success: true,
                data: {
                    userMessage: toMessageResponse(userMessage),
                    autoReply: toMessageResponse(autoReply),
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const supportController = new SupportController();
export default supportController;
