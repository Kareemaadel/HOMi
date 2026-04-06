import type { Request, Response, NextFunction } from 'express';
import { paymentMethodService } from '../services/payment-method.service.js';
import type { CreatePaymentMethodInput } from '../interfaces/payment-method.interfaces.js';

class PaymentMethodController {
    async getMyMethods(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const methods = await paymentMethodService.listMyMethods(userId);

            res.status(200).json({
                success: true,
                data: methods,
            });
        } catch (error) {
            next(error);
        }
    }

    async createMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const input = req.body as CreatePaymentMethodInput;
            const created = await paymentMethodService.createMethod(userId, input);

            res.status(201).json({
                success: true,
                message: 'Payment method saved successfully',
                data: created,
            });
        } catch (error) {
            next(error);
        }
    }

    async setDefaultMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { id } = req.params;
            await paymentMethodService.setDefaultMethod(userId, id as string);

            res.status(200).json({
                success: true,
                message: 'Default payment method updated',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { id } = req.params;
            await paymentMethodService.deleteMethod(userId, id as string);

            res.status(200).json({
                success: true,
                message: 'Payment method deleted',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const paymentMethodController = new PaymentMethodController();
export default paymentMethodController;
