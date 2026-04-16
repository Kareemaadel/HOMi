import { Router } from 'express';
import { protect } from '../../../shared/middleware/auth.middleware.js';
import { validate, validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { messageController } from '../controllers/message.controller.js';
import {
    ConversationListQuerySchema,
    ConversationMessagesQuerySchema,
    SendMessageSchema,
    StartConversationSchema,
} from '../schemas/message.schemas.js';

const router = Router();

router.post(
    '/conversations',
    protect,
    validate(StartConversationSchema),
    messageController.startConversation.bind(messageController)
);

router.get(
    '/conversations',
    protect,
    validateQuery(ConversationListQuerySchema),
    messageController.listConversations.bind(messageController)
);

router.get(
    '/conversations/:conversationId/messages',
    protect,
    validateQuery(ConversationMessagesQuerySchema),
    messageController.getConversationMessages.bind(messageController)
);

router.post(
    '/conversations/:conversationId/messages',
    protect,
    validate(SendMessageSchema),
    messageController.sendMessage.bind(messageController)
);

router.patch(
    '/conversations/:conversationId/read',
    protect,
    messageController.markConversationRead.bind(messageController)
);

export default router;
