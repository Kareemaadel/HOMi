import axios, { type AxiosInstance } from 'axios';
import { env } from '../../config/env.js';

interface PaymobBillingData {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
}

interface CreateCheckoutSessionInput {
    amountCents: number;
    merchantOrderId: string;
    billingData: PaymobBillingData;
    callbackUrl: string;
}

interface CreateCheckoutSessionResult {
    iframeUrl: string;
    orderId: number;
    amountCents: number;
}

interface VerifyTransactionResult {
    transactionId: number;
    success: boolean;
    pending: boolean;
    amountCents: number;
    currency: string;
    orderId: number;
    isVoided: boolean;
    isRefunded: boolean;
}

class PaymobService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: env.PAYMOB_BASE_URL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private ensureConfigured(): void {
        if (!env.PAYMOB_API_KEY || env.PAYMOB_INTEGRATION_ID <= 0 || env.PAYMOB_IFRAME_ID <= 0) {
            throw new Error('Paymob is not configured. Please set PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, and PAYMOB_IFRAME_ID.');
        }
    }

    private async authenticate(): Promise<string> {
        const response = await this.client.post<{ token: string }>('/api/auth/tokens', {
            api_key: env.PAYMOB_API_KEY,
        });

        return response.data.token;
    }

    private async createOrder(
        authToken: string,
        amountCents: number,
        merchantOrderId: string
    ): Promise<number> {
        const response = await this.client.post<{ id: number }>('/api/ecommerce/orders', {
            auth_token: authToken,
            delivery_needed: false,
            amount_cents: amountCents,
            currency: 'EGP',
            merchant_order_id: merchantOrderId,
            items: [],
        });

        return response.data.id;
    }

    private async createPaymentKey(
        authToken: string,
        orderId: number,
        amountCents: number,
        billingData: PaymobBillingData,
        callbackUrl: string
    ): Promise<string> {
        const response = await this.client.post<{ token: string }>('/api/acceptance/payment_keys', {
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                apartment: 'NA',
                email: billingData.email,
                floor: 'NA',
                first_name: billingData.first_name,
                street: 'NA',
                building: 'NA',
                phone_number: billingData.phone_number,
                shipping_method: 'NA',
                postal_code: 'NA',
                city: 'Cairo',
                country: 'EG',
                last_name: billingData.last_name,
                state: 'Cairo',
            },
            currency: 'EGP',
            integration_id: env.PAYMOB_INTEGRATION_ID,
            lock_order_when_paid: true,
            redirection_url: callbackUrl,
        });

        return response.data.token;
    }

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
        this.ensureConfigured();

        const authToken = await this.authenticate();
        const orderId = await this.createOrder(authToken, input.amountCents, input.merchantOrderId);
        const paymentToken = await this.createPaymentKey(
            authToken,
            orderId,
            input.amountCents,
            input.billingData,
            input.callbackUrl
        );

        const iframeUrl = `${env.PAYMOB_BASE_URL}/api/acceptance/iframes/${env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

        return {
            iframeUrl,
            orderId,
            amountCents: input.amountCents,
        };
    }

    async verifyTransaction(transactionId: number): Promise<VerifyTransactionResult> {
        this.ensureConfigured();

        const authToken = await this.authenticate();
        const response = await this.client.get<{
            id: number;
            success: boolean;
            pending: boolean;
            amount_cents: number;
            currency: string;
            is_voided: boolean;
            is_refunded: boolean;
            order?: {
                id: number;
            };
        }>(`/api/acceptance/transactions/${transactionId}`, {
            params: { auth_token: authToken },
        });

        const data = response.data;

        return {
            transactionId: data.id,
            success: data.success,
            pending: data.pending,
            amountCents: data.amount_cents,
            currency: data.currency,
            orderId: data.order?.id ?? 0,
            isVoided: data.is_voided,
            isRefunded: data.is_refunded,
        };
    }
}

export const paymobService = new PaymobService();
export default paymobService;
