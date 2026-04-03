import apiClient from '../config/api';

export type LandlordContractStatus = 'PENDING_LANDLORD' | 'PENDING_TENANT' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
export type RentDueDate = '1ST_OF_MONTH' | '5TH_OF_MONTH' | 'LAST_DAY_OF_MONTH';

export interface ContractParty {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface ContractProperty {
    id: string;
    title: string;
    address: string;
    type: string | null;
    furnishing: string | null;
    monthlyPrice: number | null;
    securityDeposit: number | null;
    maintenanceResponsibilities?: Array<{
        area: string;
        responsible_party: 'LANDLORD' | 'TENANT';
    }>;
}

export interface ContractMaintenanceResponsibility {
    id: string;
    area: string;
    responsibleParty: 'LANDLORD' | 'TENANT';
}

export interface LandlordContract {
    id: string;
    contractId: string;
    leaseId: string | null;
    status: LandlordContractStatus;
    rentAmount: number | null;
    securityDeposit: number | null;
    rentDueDate: RentDueDate | null;
    lateFeeAmount: number | null;
    maxOccupants: number | null;
    moveInDate: string;
    leaseDurationMonths: number;
    landlordNationalId: string | null;
    tenantNationalId?: string | null;
    tenantEmergencyContactName?: string | null;
    tenantEmergencyPhone?: string | null;
    propertyRegistrationNumber: string | null;
    landlordSignedAt: string | null;
    createdAt: string;
    landlord?: ContractParty;
    tenant?: ContractParty;
    property?: ContractProperty;
    maintenanceResponsibilities?: ContractMaintenanceResponsibility[];
}

export interface VerificationSummary {
    platformMetadata: {
        contractId: string;
        created: string;
        leaseId: string | null;
    };
    verifiedPropertyInfo: {
        title: string;
        type: string | null;
        rooms: string;
        furnishing: string | null;
        address: string;
    };
    paymentTerms: {
        rent: number | null;
        securityDeposit: number | null;
        serviceFee: number;
        schedule: string;
    };
    leaseDuration: {
        moveIn: string;
        durationMonths: number;
    };
}

interface ContractListResponse {
    success: boolean;
    data: LandlordContract[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class ContractService {
    async getLandlordContracts(params?: {
        status?: LandlordContractStatus;
        page?: number;
        limit?: number;
    }): Promise<ContractListResponse> {
        const response = await apiClient.get<ContractListResponse>('/contracts/landlord', { params });
        return response.data;
    }

    async getTenantContracts(params?: {
        status?: Exclude<LandlordContractStatus, 'PENDING_LANDLORD'>;
        page?: number;
        limit?: number;
    }): Promise<ContractListResponse> {
        const response = await apiClient.get<ContractListResponse>('/contracts/tenant', { params });
        return response.data;
    }

    async getContractById(id: string): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.get<{ success: boolean; data: LandlordContract }>(`/contracts/${id}`);
        return response.data;
    }

    async updateLeaseTerms(id: string, payload: {
        rent_due_date: RentDueDate;
        late_fee_amount: number;
        max_occupants: number;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/landlord/lease-terms`,
            payload
        );
        return response.data;
    }

    async updateLandlordIdentity(id: string, payload: {
        national_id: string;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/landlord/identity`,
            payload
        );
        return response.data;
    }

    async updatePropertyConfirmation(id: string, payload: {
        property_registration_number: string;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/landlord/property-confirmation`,
            payload
        );
        return response.data;
    }

    async getVerificationSummary(id: string): Promise<{ success: boolean; data: VerificationSummary }> {
        const response = await apiClient.get<{ success: boolean; data: VerificationSummary }>(
            `/contracts/${id}/verification-summary`
        );
        return response.data;
    }

    async signLandlordContract(id: string, payload: {
        signature_url: string;
        certify_ownership: boolean;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/landlord/sign`,
            payload
        );
        return response.data;
    }

    async updateTenantIdentity(id: string, payload: {
        national_id: string;
        emergency_contact_name: string;
        emergency_phone: string;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/tenant/identity`,
            payload
        );
        return response.data;
    }

    async signTenantContract(id: string, payload: {
        signature_url: string;
        agree_to_terms: boolean;
    }): Promise<{ success: boolean; data: LandlordContract }> {
        const response = await apiClient.put<{ success: boolean; data: LandlordContract }>(
            `/contracts/${id}/tenant/sign`,
            payload
        );
        return response.data;
    }
}

export const contractService = new ContractService();
export default contractService;
