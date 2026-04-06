import apiClient from '../config/api';

export type PaymentProvider = 'PAYMOB' | 'STRIPE';

export interface SavedPaymentMethod {
    id: string;
    provider: PaymentProvider;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string;
    isDefault: boolean;
    createdAt: string;
}

export interface CreatePaymentMethodPayload {
    provider: PaymentProvider;
    provider_payment_token: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    cardholder_name: string;
    is_default?: boolean;
}

interface PaymentMethodsListResponse {
    success: boolean;
    data: SavedPaymentMethod[];
}

interface CreatePaymentMethodResponse {
    success: boolean;
    message: string;
    data: SavedPaymentMethod;
}

class PaymentMethodService {
    async getMyMethods(): Promise<SavedPaymentMethod[]> {
        const response = await apiClient.get<PaymentMethodsListResponse>('/payment-methods/my');
        return response.data.data;
    }

    async createMethod(payload: CreatePaymentMethodPayload): Promise<SavedPaymentMethod> {
        const response = await apiClient.post<CreatePaymentMethodResponse>('/payment-methods', payload);
        return response.data.data;
    }

    async setDefault(id: string): Promise<void> {
        await apiClient.patch(`/payment-methods/${id}/default`);
    }

    async deleteMethod(id: string): Promise<void> {
        await apiClient.delete(`/payment-methods/${id}`);
    }
}

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
