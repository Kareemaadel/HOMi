import { Router } from 'express';
import { protect } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { paymentMethodController } from '../controllers/payment-method.controller.js';
import { CreatePaymentMethodSchema } from '../schemas/payment-method.schemas.js';

const router = Router();

router.get('/my', protect, paymentMethodController.getMyMethods.bind(paymentMethodController));

router.post(
    '/',
    protect,
    validate(CreatePaymentMethodSchema),
    paymentMethodController.createMethod.bind(paymentMethodController)
);

router.patch('/:id/default', protect, paymentMethodController.setDefaultMethod.bind(paymentMethodController));

router.delete('/:id', protect, paymentMethodController.deleteMethod.bind(paymentMethodController));

export default router;
