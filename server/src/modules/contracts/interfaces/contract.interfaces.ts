import type {
    ContractPaymentStatusType,
    ContractStatusType,
    PaymentScheduleType,
    RentDueDateType,
} from '../models/Contract.js';
import type { ResponsiblePartyType } from '../models/ContractMaintenanceResponsibility.js';

// ─── Maintenance Responsibility ───────────────────────────────────────────────

export interface MaintenanceResponsibilityInput {
    area: string;
    responsible_party: ResponsiblePartyType;
}

export interface MaintenanceResponsibilityResponse {
    id: string;
    area: string;
    responsibleParty: ResponsiblePartyType;
}

// ─── Landlord Step 1: Lease Terms & Financials ────────────────────────────────

export interface LandlordLeaseTermsInput {
    rent_due_date: RentDueDateType;
    late_fee_amount: number;
    max_occupants: number;
}

// ─── Landlord Step 2: Identity Details ────────────────────────────────────────

export interface LandlordIdentityInput {
    national_id: string;
}

// ─── Landlord Step 3: Property Ownership & Maintenance ────────────────────────

export interface LandlordPropertyConfirmationInput {
    property_registration_number: string;
    maintenance_responsibilities: MaintenanceResponsibilityInput[];
}

// ─── Landlord Step 5: Sign ────────────────────────────────────────────────────

export interface LandlordSignInput {
    signature_url: string;
    certify_ownership: boolean;
}

// ─── Tenant Step 2: Identity Verification ─────────────────────────────────────

export interface TenantIdentityInput {
    national_id: string;
}

// ─── Tenant Step 4: Sign ──────────────────────────────────────────────────────

export interface TenantSignInput {
    signature_url: string;
    agree_to_terms: boolean;
}

export interface VerifyPaymobPaymentInput {
    transaction_id: number;
}

export interface PaymobCheckoutResponse {
    checkoutUrl: string;
    amountCents: number;
    orderId: number;
    currency: string;
}

// ─── Contract Response ────────────────────────────────────────────────────────

export interface ContractResponse {
    id: string;
    contractId: string;
    leaseId: string | null;
    rentalRequestId: string;
    propertyId: string;
    landlordId: string;
    tenantId: string;
    status: ContractStatusType;
    rentAmount: number | null;
    securityDeposit: number | null;
    serviceFee: number;
    paymentSchedule: PaymentScheduleType;
    rentDueDate: RentDueDateType | null;
    lateFeeAmount: number | null;
    maxOccupants: number | null;
    moveInDate: Date | string;
    leaseDurationMonths: number;
    propertyRegistrationNumber: string | null;
    landlordSignedAt: Date | null;
    tenantSignedAt: Date | null;
    tenantAgreedTerms: boolean;
    paymentStatus: ContractPaymentStatusType;
    paymentVerifiedAt: Date | null;
    paymobOrderId: number | null;
    paymobTransactionId: number | null;
    createdAt: Date;
    updatedAt: Date;
    maintenanceResponsibilities?: MaintenanceResponsibilityResponse[];
    landlord?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    tenant?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    property?: {
        id: string;
        title: string;
        address: string;
        type: string | null;
        furnishing: string | null;
        monthlyPrice: number | null;
        securityDeposit: number | null;
    };
    propertySpecifications?: {
        bedrooms: number;
        bathrooms: number;
        areaSqft: number;
    } | null;
}

// ─── Contract List Response ───────────────────────────────────────────────────

export interface ContractListResponse {
    contracts: ContractResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ─── Verification Summary ─────────────────────────────────────────────────────

export interface VerificationSummaryResponse {
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
        schedule: PaymentScheduleType;
    };
    leaseDuration: {
        moveIn: string;
        durationMonths: number;
    };
}
