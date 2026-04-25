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
    integrationId?: number;
    iframeId?: number;
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
    cardToken?: string;
    cardBrand?: string;
    cardLast4?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    cardholderName?: string;
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
        callbackUrl: string,
        integrationId: number
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
            integration_id: integrationId,
            lock_order_when_paid: true,
            redirection_url: callbackUrl,
        });

        return response.data.token;
    }

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
        this.ensureConfigured();

        const selectedIntegrationId = input.integrationId ?? env.PAYMOB_INTEGRATION_ID;
        const selectedIframeId = input.iframeId ?? env.PAYMOB_IFRAME_ID;
        if (selectedIntegrationId <= 0) {
            throw new Error('Paymob integration ID is invalid. Please check your integration configuration.');
        }
        if (selectedIframeId <= 0) {
            throw new Error('Paymob iframe ID is invalid. Please check your iframe configuration.');
        }

        const authToken = await this.authenticate();
        const orderId = await this.createOrder(authToken, input.amountCents, input.merchantOrderId);
        const paymentToken = await this.createPaymentKey(
            authToken,
            orderId,
            input.amountCents,
            input.billingData,
            input.callbackUrl,
            selectedIntegrationId
        );

        const iframeUrl = `${env.PAYMOB_BASE_URL}/api/acceptance/iframes/${selectedIframeId}?payment_token=${paymentToken}`;

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
            source_data?: {
                pan?: string;
                sub_type?: string;
            };
            card?: {
                token?: string;
                last_four?: string;
                first_six?: string;
                expiry_month?: number;
                expiry_year?: number;
                owner?: string;
                subtype?: string;
            };
            payment_key_claims?: {
                billing_data?: {
                    first_name?: string;
                    last_name?: string;
                };
            };
        }>(`/api/acceptance/transactions/${transactionId}`, {
            // Paymob's GET transaction endpoint uses 'token', not 'auth_token'
            params: { token: authToken },
        });

        console.log('[PaymobService] verifyTransaction raw response:', {
            transactionId,
            id: response.data.id,
            success: response.data.success,
            pending: response.data.pending,
            amountCents: response.data.amount_cents,
            orderId: response.data.order?.id,
        });

        const data = response.data;

        const cardToken = data.card?.token;
        const cardBrand = data.card?.subtype || data.source_data?.sub_type;
        const cardLast4 = data.card?.last_four || data.source_data?.pan;
        const cardExpMonth = data.card?.expiry_month;
        const cardExpYear = data.card?.expiry_year;
        const cardholderName =
            data.card?.owner ||
            [data.payment_key_claims?.billing_data?.first_name, data.payment_key_claims?.billing_data?.last_name]
                .filter(Boolean)
                .join(' ') ||
            undefined;

        return {
            transactionId: data.id,
            success: data.success,
            pending: data.pending,
            amountCents: data.amount_cents,
            currency: data.currency,
            orderId: Number(data.order?.id ?? 0),
            isVoided: data.is_voided,
            isRefunded: data.is_refunded,
            ...(cardToken ? { cardToken } : {}),
            ...(cardBrand ? { cardBrand } : {}),
            ...(cardLast4 ? { cardLast4 } : {}),
            ...(cardExpMonth ? { cardExpMonth } : {}),
            ...(cardExpYear ? { cardExpYear } : {}),
            ...(cardholderName ? { cardholderName } : {}),
        };
    }
}

export const paymobService = new PaymobService();
export default paymobService;
