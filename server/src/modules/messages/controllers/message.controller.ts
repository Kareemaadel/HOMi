import type { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';
import type {
    ConversationListQuery,
    ConversationMessagesQuery,
    SendMessageInput,
    StartConversationInput,
} from '../interfaces/message.interfaces.js';

class MessageController {
    async startConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const input = req.body as StartConversationInput;

            const conversation = await messageService.startConversation(userId, input);

            res.status(201).json({
                success: true,
                data: conversation,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadBadge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const summary = await messageService.getUnreadBadge(userId);

            res.status(200).json({
                success: true,
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }

    async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const query = ((req as any).validatedQuery || req.query) as ConversationListQuery;

            const result = await messageService.listConversations(userId, query);

            res.status(200).json({
                success: true,
                data: result.conversations,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { conversationId } = req.params;
            const query = ((req as any).validatedQuery || req.query) as ConversationMessagesQuery;

            const result = await messageService.getConversationMessages(userId, conversationId as string, query);

            res.status(200).json({
                success: true,
                data: result.messages,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { conversationId } = req.params;
            const input = req.body as SendMessageInput;

            const message = await messageService.sendMessage(userId, conversationId as string, input);

            res.status(201).json({
                success: true,
                data: {
                    id: message.id,
                    conversationId: message.conversation_id,
                    senderId: message.sender_id,
                    body: message.body,
                    createdAt: message.created_at,
                    readAt: message.read_at,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async markConversationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { conversationId } = req.params;

            const result = await messageService.markConversationRead(userId, conversationId as string);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const messageController = new MessageController();
export default messageController;
