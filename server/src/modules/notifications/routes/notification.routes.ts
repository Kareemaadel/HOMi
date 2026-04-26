import { Router } from 'express';
import { protect } from '../../../shared/middleware/auth.middleware.js';
import { notificationController } from '../controllers/notification.controller.js';

const router = Router();

router.use(protect);

router.get('/', notificationController.list.bind(notificationController));
router.get('/unread-count', notificationController.unreadCount.bind(notificationController));
router.patch('/read-all', notificationController.markAllRead.bind(notificationController));
router.patch('/:id/read', notificationController.markRead.bind(notificationController));
router.delete('/:id', notificationController.remove.bind(notificationController));

export default router;
