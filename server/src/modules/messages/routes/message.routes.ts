import { Router } from 'express';
import { protect, restrictTo } from '../../../shared/middleware/auth.middleware.js';
import { validate, validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { messageController } from '../controllers/message.controller.js';
import { supportController } from '../controllers/support.controller.js';
import { UserRole } from '../../auth/models/User.js';
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

router.get('/unread-badge', protect, messageController.getUnreadBadge.bind(messageController));

router.get(
    '/support',
    protect,
    restrictTo(UserRole.LANDLORD, UserRole.TENANT, UserRole.MAINTENANCE_PROVIDER),
    supportController.getSupportThread.bind(supportController)
);

router.post(
    '/support/messages',
    protect,
    restrictTo(UserRole.LANDLORD, UserRole.TENANT, UserRole.MAINTENANCE_PROVIDER),
    validate(SendMessageSchema),
    supportController.sendSupportMessage.bind(supportController)
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
