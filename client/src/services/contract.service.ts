import apiClient from '../config/api';

export interface ContractPaymentTerms {
    rentAmount: number | null;
    securityDeposit: number | null;
    serviceFee: number;
}

export interface ContractDetails {
    id: string;
    contractId: string;
    status: string;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    paymentTerms: ContractPaymentTerms;
}

interface ContractApiResponse {
    success: boolean;
    data: {
        id: string;
        contractId: string;
        status: string;
        paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
        rentAmount: number | null;
        securityDeposit: number | null;
        serviceFee: number;
    };
}

interface InitiatePaymobResponse {
    success: boolean;
    data: {
        checkoutUrl: string;
        amountCents: number;
        orderId: number;
        currency: string;
    };
}

class ContractService {
    async getContractById(contractId: string): Promise<ContractDetails> {
        const response = await apiClient.get<ContractApiResponse>(`/contracts/${contractId}`);
        const c = response.data.data;

        return {
            id: c.id,
            contractId: c.contractId,
            status: c.status,
            paymentStatus: c.paymentStatus,
            paymentTerms: {
                rentAmount: c.rentAmount,
                securityDeposit: c.securityDeposit,
                serviceFee: c.serviceFee,
            },
        };
    }

    async initiatePaymobPayment(contractId: string): Promise<InitiatePaymobResponse['data']> {
        const response = await apiClient.post<InitiatePaymobResponse>(`/contracts/${contractId}/payments/paymob/initiate`);
        return response.data.data;
    }

    async verifyPaymobPayment(contractId: string, transactionId: number): Promise<void> {
        await apiClient.post(`/contracts/${contractId}/payments/paymob/verify`, {
            transaction_id: transactionId,
        });
    }
}

export const contractService = new ContractService();
export default contractService;
