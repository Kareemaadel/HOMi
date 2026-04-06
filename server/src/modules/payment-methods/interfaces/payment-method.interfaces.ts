import type { PaymentProviderType } from '../models/PaymentMethod.js';

export interface CreatePaymentMethodInput {
    provider: PaymentProviderType;
    provider_payment_token: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    cardholder_name: string;
    is_default?: boolean;
}

export interface PaymentMethodResponse {
    id: string;
    provider: PaymentProviderType;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string;
    isDefault: boolean;
    createdAt: string;
}
