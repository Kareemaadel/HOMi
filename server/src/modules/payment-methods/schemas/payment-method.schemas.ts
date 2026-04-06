import { z } from 'zod';
import { PaymentProvider } from '../models/PaymentMethod.js';

export const CreatePaymentMethodSchema = z.object({
    provider: z.enum([PaymentProvider.PAYMOB, PaymentProvider.STRIPE]).default(PaymentProvider.PAYMOB),
    provider_payment_token: z.string().min(8).max(255),
    brand: z.string().min(2).max(40),
    last4: z.string().regex(/^\d{4}$/),
    exp_month: z.number().int().min(1).max(12),
    exp_year: z.number().int().min(new Date().getFullYear()).max(2100),
    cardholder_name: z.string().min(2).max(120),
    is_default: z.boolean().optional(),
});

export default {
    CreatePaymentMethodSchema,
};
