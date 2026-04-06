import { PaymentMethod } from '../models/PaymentMethod.js';
import type {
    CreatePaymentMethodInput,
    PaymentMethodResponse,
} from '../interfaces/payment-method.interfaces.js';

export class PaymentMethodError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code: string = 'PAYMENT_METHOD_ERROR'
    ) {
        super(message);
        this.name = 'PaymentMethodError';
    }
}

class PaymentMethodService {
    async listMyMethods(userId: string): Promise<PaymentMethodResponse[]> {
        const methods = await PaymentMethod.findAll({
            where: { user_id: userId },
            order: [
                ['is_default', 'DESC'],
                ['created_at', 'DESC'],
            ],
        });

        return methods.map((method) => this.toResponse(method));
    }

    async createMethod(userId: string, input: CreatePaymentMethodInput): Promise<PaymentMethodResponse> {
        const existingCount = await PaymentMethod.count({ where: { user_id: userId } });
        const shouldBeDefault = existingCount === 0 || Boolean(input.is_default);

        if (shouldBeDefault) {
            await PaymentMethod.update(
                { is_default: false },
                { where: { user_id: userId } }
            );
        }

        const created = await PaymentMethod.create({
            user_id: userId,
            provider: input.provider,
            provider_payment_token: input.provider_payment_token,
            brand: input.brand,
            last4: input.last4,
            exp_month: input.exp_month,
            exp_year: input.exp_year,
            cardholder_name: input.cardholder_name,
            is_default: shouldBeDefault,
        });

        return this.toResponse(created);
    }

    async setDefaultMethod(userId: string, paymentMethodId: string): Promise<void> {
        const method = await PaymentMethod.findOne({
            where: { id: paymentMethodId, user_id: userId },
        });

        if (!method) {
            throw new PaymentMethodError('Payment method not found', 404, 'PAYMENT_METHOD_NOT_FOUND');
        }

        await PaymentMethod.update(
            { is_default: false },
            { where: { user_id: userId } }
        );
        await method.update({ is_default: true });
    }

    async deleteMethod(userId: string, paymentMethodId: string): Promise<void> {
        const method = await PaymentMethod.findOne({
            where: { id: paymentMethodId, user_id: userId },
        });

        if (!method) {
            throw new PaymentMethodError('Payment method not found', 404, 'PAYMENT_METHOD_NOT_FOUND');
        }

        const wasDefault = method.is_default;
        await method.destroy();

        if (!wasDefault) return;

        const nextMethod = await PaymentMethod.findOne({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
        });

        if (nextMethod) {
            await nextMethod.update({ is_default: true });
        }
    }

    private toResponse(method: PaymentMethod): PaymentMethodResponse {
        return {
            id: method.id,
            provider: method.provider,
            brand: method.brand,
            last4: method.last4,
            expMonth: method.exp_month,
            expYear: method.exp_year,
            cardholderName: method.cardholder_name,
            isDefault: method.is_default,
            createdAt: method.created_at.toISOString(),
        };
    }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
