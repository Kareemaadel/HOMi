import { Op } from 'sequelize';
import {
    Contract,
    ContractPaymentStatus,
    ContractStatus,
    ContractMaintenanceResponsibility,
    User,
    Profile,
    Property,
    RentalRequest,
    PropertySpecifications,
    sequelize,
} from '../models/index.js';
import { paymobService } from '../../../shared/services/paymob.service.js';
import { env } from '../../../config/env.js';
import { decrypt, encrypt } from '../../../shared/utils/encryption.util.js';
import { testingClockService } from '../../../shared/services/testing-clock.service.js';
import { PaymentMethod, PaymentProvider } from '../../payment-methods/models/PaymentMethod.js';
import type {
    ContractResponse,
    ContractBalancePaymentResponse,
    ContractListResponse,
    VerificationSummaryResponse,
    MaintenanceResponsibilityResponse,
    LandlordLeaseTermsInput,
    LandlordIdentityInput,
    LandlordPropertyConfirmationInput,
    LandlordSignInput,
    TenantIdentityInput,
    TenantSignInput,
    VerifyPaymobPaymentInput,
    PaymobCheckoutResponse,
    WalletBalanceResponse,
    MonthlyRentPaymentResponse,
    WalletTopupCheckoutResponse,
    WalletTopupInitiateInput,
    WalletTopupVerifyInput,
    ContractInstallmentsResponse,
    RentInstallmentItem,
    RentInstallmentStatus,
    AutopayUpdateResponse,
} from '../interfaces/contract.interfaces.js';
import { activityLogService } from '../../../shared/services/activity-log.service.js';
import { ActivityLog } from '../../admin/models/ActivityLog.js';

// ─── Duration map ─────────────────────────────────────────────────────────────

const DURATION_TO_MONTHS: Record<string, number> = {
    '6_MONTHS': 6,
    '12_MONTHS': 12,
    '24_MONTHS': 24,
};

function parseDurationToMonths(duration: string): number {
    const mapped = DURATION_TO_MONTHS[duration];
    if (mapped) return mapped;

    const match = /^(\d+)_MONTHS$/.exec(duration);
    if (match) {
        const months = Number(match[1]);
        if (Number.isInteger(months) && months > 0) {
            return months;
        }
    }

    throw new ContractError(`Unsupported rental duration: ${duration}`, 400, 'INVALID_RENTAL_DURATION');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateContractId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `HOMI-${num}`;
}

function generateLeaseId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    const letter = String.fromCodePoint(65 + Math.floor(Math.random() * 26));
    return `L-${num}-${letter}`;
}

function safeDecrypt(value: string | null): string | null {
    if (!value) return null;
    try {
        return decrypt(value);
    } catch {
        // Keep backward compatibility for rows that may contain plaintext.
        return value;
    }
}

function isSameYearMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Custom error class for contract errors
 */
export class ContractError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code: string = 'CONTRACT_ERROR'
    ) {
        super(message);
        this.name = 'ContractError';
    }
}

/**
 * Contract Service
 * Handles all contract business logic
 */
class ContractService {
    getTestingClockState(): { enabled: boolean; offsetDays: number; now: string } {
        return testingClockService.getState();
    }

    advanceTestingClock(days: number): { enabled: boolean; offsetDays: number; now: string } {
        return testingClockService.advanceDays(days);
    }

    resetTestingClock(): { enabled: boolean; offsetDays: number; now: string } {
        return testingClockService.reset();
    }

    // ─── Contract Creation ────────────────────────────────────────────────────

    /**
     * Create a contract automatically when a rental request is approved
     */
    async createContractFromApproval(rentalRequestId: string): Promise<ContractResponse> {
        const rentalRequest = await RentalRequest.findByPk(rentalRequestId, {
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'landlord_id', 'monthly_price', 'security_deposit'],
                },
            ],
        });

        if (!rentalRequest) {
            throw new ContractError('Rental request not found', 404, 'RENTAL_REQUEST_NOT_FOUND');
        }

        const property = rentalRequest.property as any;
        if (!property) {
            throw new ContractError('Property not found for rental request', 404, 'PROPERTY_NOT_FOUND');
        }

        // Check if contract already exists for this rental request
        const existingContract = await Contract.findOne({
            where: { rental_request_id: rentalRequestId },
        });

        if (existingContract) {
            throw new ContractError(
                'A contract already exists for this rental request',
                409,
                'CONTRACT_ALREADY_EXISTS'
            );
        }

        const durationMonths = parseDurationToMonths(String(rentalRequest.duration));

        const contract = await Contract.create({
            contract_id: generateContractId(),
            lease_id: generateLeaseId(),
            rental_request_id: rentalRequestId,
            property_id: property.id,
            landlord_id: property.landlord_id,
            tenant_id: rentalRequest.tenant_id,
            status: ContractStatus.PENDING_LANDLORD,
            rent_amount: property.monthly_price,
            security_deposit: property.security_deposit,
            service_fee: 10,
            payment_status: ContractPaymentStatus.PENDING,
            move_in_date: rentalRequest.move_in_date,
            lease_duration_months: durationMonths,
        });

        await activityLogService.log({
            actor: { userId: property.landlord_id, role: 'LANDLORD' },
            action: 'CONTRACT_CREATED_FROM_APPROVAL',
            entityType: 'CONTRACT',
            entityId: contract.id,
            description: 'Contract auto-created after rental request approval.',
            metadata: {
                rentalRequestId,
                propertyId: property.id,
                tenantId: rentalRequest.tenant_id,
            },
        });

        return this.formatContractResponse(contract);
    }

    // ─── Contract Lists ───────────────────────────────────────────────────────

    /**
     * Get all contracts for a landlord
     */
    async getLandlordContracts(
        landlordId: string,
        filters: { status?: string; page?: number; limit?: number }
    ): Promise<ContractListResponse> {
        await this.expireCompletedLeases();
        const user = await User.findByPk(landlordId);
        if (!user) {
            throw new ContractError('User not found', 404, 'USER_NOT_FOUND');
        }
        if (user.role !== 'LANDLORD') {
            throw new ContractError(
                'Only landlords can view landlord contracts',
                403,
                'FORBIDDEN'
            );
        }

        const { status, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const where: any = { landlord_id: landlordId };
        if (status) where.status = status;

        const { count, rows: contracts } = await Contract.findAndCountAll({
            where,
            include: this.getContractListIncludes(),
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        const formattedContracts = contracts.map((c) => this.formatContractResponse(c, true));

        return {
            contracts: formattedContracts,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Get all contracts for a tenant (only PENDING_TENANT or later)
     */
    async getTenantContracts(
        tenantId: string,
        filters: { status?: string; page?: number; limit?: number }
    ): Promise<ContractListResponse> {
        await this.expireCompletedLeases();
        const { status, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const where: any = {
            tenant_id: tenantId,
            // Tenant can only see contracts after landlord has signed
            status: {
                [Op.in]: [
                    ContractStatus.PENDING_TENANT,
                    ContractStatus.PENDING_PAYMENT,
                    ContractStatus.ACTIVE,
                    ContractStatus.TERMINATED,
                    ContractStatus.EXPIRED,
                ],
            },
        };
        // If a specific status filter is provided and is valid for tenant view, use it
        if (status && [
            ContractStatus.PENDING_TENANT,
            ContractStatus.PENDING_PAYMENT,
            ContractStatus.ACTIVE,
            ContractStatus.TERMINATED,
            ContractStatus.EXPIRED,
        ].includes(status as any)) {
            where.status = status;
        }

        const { count, rows: contracts } = await Contract.findAndCountAll({
            where,
            include: this.getContractListIncludes(),
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        const formattedContracts = contracts.map((c) => this.formatContractResponse(c, true));

        return {
            contracts: formattedContracts,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    // ─── Get Contract Details ─────────────────────────────────────────────────

    /**
     * Get a single contract by ID (with full details)
     */
    async getContractById(contractId: string, userId: string): Promise<ContractResponse> {
        const contract = await Contract.findByPk(contractId, {
            include: [
                ...this.getContractDetailIncludes(),
                {
                    model: ContractMaintenanceResponsibility,
                    as: 'maintenanceResponsibilities',
                },
            ],
        });

        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }

        // Only landlord or tenant on the contract can view
        if (contract.landlord_id !== userId && contract.tenant_id !== userId) {
            throw new ContractError(
                'You do not have permission to view this contract',
                403,
                'FORBIDDEN'
            );
        }

        // Tenant cannot see PENDING_LANDLORD contracts
        if (contract.tenant_id === userId && contract.status === ContractStatus.PENDING_LANDLORD) {
            throw new ContractError(
                'This contract is not yet available for viewing',
                403,
                'CONTRACT_NOT_READY'
            );
        }

        return this.formatContractResponse(contract, true, true);
    }

    // ─── Verification Summary ─────────────────────────────────────────────────

    /**
     * Generate the platform verification summary (auto-generated, read-only)
     */
    async getVerificationSummary(contractId: string, userId: string): Promise<VerificationSummaryResponse> {
        const contract = await Contract.findByPk(contractId, {
            include: [
                {
                    model: Property,
                    as: 'property',
                    include: [
                        {
                            model: PropertySpecifications,
                            as: 'specifications',
                        },
                    ],
                },
            ],
        });

        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }

        if (contract.landlord_id !== userId && contract.tenant_id !== userId) {
            throw new ContractError(
                'You do not have permission to view this contract',
                403,
                'FORBIDDEN'
            );
        }

        const property = contract.property as any;
        const specs = property?.specifications;

        let roomsLabel = 'N/A';
        if (specs) {
            const bedroomSuffix = specs.bedrooms === 1 ? '' : 's';
            roomsLabel = `${specs.bedrooms} Bedroom${bedroomSuffix}`;
        }

        return {
            platformMetadata: {
                contractId: contract.contract_id,
                created: contract.created_at.toISOString(),
                leaseId: contract.lease_id,
            },
            verifiedPropertyInfo: {
                title: property?.title ?? 'N/A',
                type: property?.type ?? null,
                rooms: roomsLabel,
                furnishing: property?.furnishing ?? null,
                address: property?.address ?? 'N/A',
            },
            paymentTerms: {
                rent: contract.rent_amount ? Number(contract.rent_amount) : null,
                securityDeposit: contract.security_deposit ? Number(contract.security_deposit) : null,
                serviceFee: Number(contract.service_fee),
                schedule: contract.payment_schedule,
            },
            leaseDuration: {
                moveIn: contract.move_in_date as unknown as string,
                durationMonths: contract.lease_duration_months,
            },
        };
    }

    // ─── Landlord Steps ───────────────────────────────────────────────────────

    /**
     * Landlord Step 1: Submit Lease Terms & Financials
     */
    async submitLandlordLeaseTerms(
        contractId: string,
        landlordId: string,
        input: LandlordLeaseTermsInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateLandlordContract(contractId, landlordId);

        await contract.update({
            rent_due_date: input.rent_due_date,
            late_fee_amount: input.late_fee_amount,
            max_occupants: input.max_occupants,
        });

        await activityLogService.log({
            actor: { userId: landlordId, role: 'LANDLORD' },
            action: 'CONTRACT_SIGNED_BY_LANDLORD',
            entityType: 'CONTRACT',
            entityId: contract.id,
            description: 'Landlord signed contract.',
            metadata: { propertyId: contract.property_id, tenantId: contract.tenant_id },
        });

        return this.formatContractResponse(contract);
    }

    /**
     * Landlord Step 2: Submit Identity Details
     */
    async submitLandlordIdentity(
        contractId: string,
        landlordId: string,
        input: LandlordIdentityInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateLandlordContract(contractId, landlordId);

        await contract.update({
            landlord_national_id: encrypt(input.national_id),
        });

        await activityLogService.log({
            actor: { userId: landlordId, role: 'LANDLORD' },
            action: 'LANDLORD_IDENTITY_SUBMITTED',
            entityType: 'CONTRACT',
            entityId: contract.id,
            description: 'Landlord submitted identity verification details.',
            metadata: { propertyId: contract.property_id, tenantId: contract.tenant_id },
        });

        return this.formatContractResponse(contract);
    }

    /**
     * Landlord Step 3: Property Ownership Confirmation & Maintenance Responsibilities
     */
    async submitLandlordPropertyConfirmation(
        contractId: string,
        landlordId: string,
        input: LandlordPropertyConfirmationInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateLandlordContract(contractId, landlordId);

        await contract.update({
            property_registration_number: input.property_registration_number,
        });

        await activityLogService.log({
            actor: { userId: landlordId, role: 'LANDLORD' },
            action: 'LANDLORD_PROPERTY_CONFIRMED',
            entityType: 'CONTRACT',
            entityId: contract.id,
            description: 'Landlord confirmed property ownership and registration.',
            metadata: { propertyId: contract.property_id, tenantId: contract.tenant_id },
        });

        const updated = await Contract.findByPk(contract.id, {
            include: this.getContractDetailIncludes(),
        });

        return this.formatContractResponse(updated ?? contract, true, true);
    }

    /**
     * Landlord Step 5: Sign Contract
     * Moves status from PENDING_LANDLORD to PENDING_TENANT
     */
    async signContractLandlord(
        contractId: string,
        landlordId: string,
        input: LandlordSignInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateLandlordContract(contractId, landlordId);

        // Validate that all required landlord steps are completed
        if (!contract.rent_due_date) {
            throw new ContractError(
                'Please complete lease terms (Step 1) before signing',
                400,
                'INCOMPLETE_LEASE_TERMS'
            );
        }
        if (!contract.landlord_national_id) {
            throw new ContractError(
                'Please complete identity verification (Step 2) before signing',
                400,
                'INCOMPLETE_IDENTITY'
            );
        }
        if (!contract.property_registration_number) {
            throw new ContractError(
                'Please complete property ownership confirmation (Step 3) before signing',
                400,
                'INCOMPLETE_PROPERTY_CONFIRMATION'
            );
        }

        await contract.update({
            landlord_signature_url: input.signature_url,
            landlord_signed_at: testingClockService.getNow(),
            status: ContractStatus.PENDING_TENANT,
        });

        return this.formatContractResponse(contract);
    }

    // ─── Tenant Steps ─────────────────────────────────────────────────────────

    /**
     * Tenant Step 2: Submit Identity Verification
     */
    async submitTenantIdentity(
        contractId: string,
        tenantId: string,
        input: TenantIdentityInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateTenantContract(contractId, tenantId);

        await contract.update({
            tenant_national_id: encrypt(input.national_id),
            tenant_emergency_contact_name: input.emergency_contact_name,
            tenant_emergency_phone: input.emergency_phone,
        });

        return this.formatContractResponse(contract);
    }

    /**
     * Tenant Step 4: Sign Contract
     * Moves status from PENDING_TENANT to PENDING_PAYMENT
     */
    async signContractTenant(
        contractId: string,
        tenantId: string,
        input: TenantSignInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateTenantContract(contractId, tenantId);

        if (!contract.tenant_national_id) {
            throw new ContractError(
                'Please complete identity verification (Step 2) before signing',
                400,
                'INCOMPLETE_IDENTITY'
            );
        }

        await contract.update({
            tenant_signature_url: input.signature_url,
            tenant_signed_at: testingClockService.getNow(),
            tenant_agreed_terms: true,
            status: ContractStatus.PENDING_PAYMENT,
        });

        return this.formatContractResponse(contract);
    }

    /**
     * Tenant payment step: create Paymob checkout URL
     */
    async initiatePaymobPayment(contractId: string, tenantId: string): Promise<PaymobCheckoutResponse> {
        const contract = await this.findAndValidateTenantPaymentContract(contractId, tenantId);

        if (contract.payment_status === ContractPaymentStatus.PAID) {
            throw new ContractError('This contract payment is already verified', 400, 'PAYMENT_ALREADY_VERIFIED');
        }

        const amountCents = this.calculateContractTotalAmountCents(contract);
        const tenantUser = await User.findByPk(tenantId, {
            include: [{ model: Profile, as: 'profile', attributes: ['first_name', 'last_name', 'phone_number'] }],
            attributes: ['id', 'email'],
        });

        if (!tenantUser) {
            throw new ContractError('Tenant user not found', 404, 'USER_NOT_FOUND');
        }

        const profile = (tenantUser as any).profile;
        const callbackUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/payment/verify?contractId=${contract.id}`;
        const checkout = await paymobService.createCheckoutSession({
            amountCents,
            merchantOrderId: `${contract.contract_id}-${testingClockService.getNow().getTime()}`,
            billingData: {
                email: tenantUser.email,
                first_name: profile?.first_name || 'Tenant',
                last_name: profile?.last_name || 'User',
                phone_number: profile?.phone_number || '+201000000000',
            },
            callbackUrl,
        });

        await contract.update({
            paymob_order_id: checkout.orderId,
            payment_status: ContractPaymentStatus.PENDING,
        });

        return {
            checkoutUrl: checkout.iframeUrl,
            amountCents: checkout.amountCents,
            orderId: checkout.orderId,
            currency: 'EGP',
        };
    }

    /**
     * Tenant payment step: verify Paymob transaction and activate contract
     */
    async verifyPaymobPayment(
        contractId: string,
        tenantId: string,
        input: VerifyPaymobPaymentInput
    ): Promise<ContractResponse> {
        const contract = await this.findAndValidateTenantPaymentContract(contractId, tenantId);

        const verification = await paymobService.verifyTransaction(input.transaction_id);
        const expectedAmountCents = this.calculateContractTotalAmountCents(contract);

        // Normalize both sides to Number — Sequelize returns BIGINT as string
        const storedOrderId = Number(contract.paymob_order_id ?? 0);
        const paymobOrderId = Number(verification.orderId ?? 0);
        const isOrderMatched = storedOrderId > 0 && paymobOrderId === storedOrderId;
        const isAmountMatched = Number(verification.amountCents) === Number(expectedAmountCents);
        const isSuccess = verification.success && !verification.pending && !verification.isVoided && !verification.isRefunded;

        console.log('[PaymobVerify] Contract payment verification:', {
            transactionId: input.transaction_id,
            storedOrderId,
            paymobOrderId,
            isOrderMatched,
            expectedAmountCents,
            actualAmountCents: verification.amountCents,
            isAmountMatched,
            isSuccess,
            paymobSuccess: verification.success,
            paymobPending: verification.pending,
        });

        if (!isSuccess || !isOrderMatched || !isAmountMatched) {
            await contract.update({
                payment_status: ContractPaymentStatus.FAILED,
            });

            throw new ContractError(
                'Payment verification failed. Please retry payment from the checkout page.',
                400,
                'PAYMENT_VERIFICATION_FAILED'
            );
        }

        await contract.update({
            payment_status: ContractPaymentStatus.PAID,
            payment_verified_at: testingClockService.getNow(),
            paymob_transaction_id: verification.transactionId,
            status: ContractStatus.ACTIVE,
        });

        return this.formatContractResponse(contract);
    }

    async getWalletBalance(tenantId: string): Promise<WalletBalanceResponse> {
        const profile = await Profile.findOne({
            where: { user_id: tenantId },
            attributes: ['wallet_balance'],
        });

        if (!profile) {
            throw new ContractError('Tenant profile not found', 404, 'PROFILE_NOT_FOUND');
        }

        return {
            balance: Number((profile as any).wallet_balance ?? 0),
            currency: 'EGP',
        };
    }

    async payContractFromBalance(contractId: string, tenantId: string): Promise<ContractBalancePaymentResponse> {
        const transaction = await sequelize.transaction();

        try {
            const contract = await this.findAndValidateTenantPaymentContract(contractId, tenantId, transaction);

            if (contract.payment_status === ContractPaymentStatus.PAID) {
                throw new ContractError('This contract payment is already completed', 400, 'PAYMENT_ALREADY_COMPLETED');
            }

            const profile = await Profile.findOne({
                where: { user_id: tenantId },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!profile) {
                throw new ContractError('Tenant profile not found', 404, 'PROFILE_NOT_FOUND');
            }

            const requiredAmount = this.calculateContractTotalAmount(contract);
            const availableBalance = Number((profile as any).wallet_balance ?? 0);

            if (availableBalance < requiredAmount) {
                throw new ContractError('Insufficient wallet balance to complete this payment', 400, 'INSUFFICIENT_WALLET_BALANCE');
            }

            const remainingBalance = Math.max(availableBalance - requiredAmount, 0);

            await profile.update(
                {
                    wallet_balance: remainingBalance,
                },
                { transaction }
            );

            await contract.update(
                {
                    payment_status: ContractPaymentStatus.PAID,
                    payment_verified_at: testingClockService.getNow(),
                    status: ContractStatus.ACTIVE,
                    paymob_order_id: null,
                    paymob_transaction_id: null,
                },
                { transaction }
            );

            await activityLogService.log({
                actor: { userId: tenantId, role: 'TENANT' },
                action: 'CONTRACT_PAID_FROM_BALANCE',
                entityType: 'CONTRACT',
                entityId: contract.id,
                description: 'Contract paid from wallet balance and activated.',
                metadata: {
                    debitedAmount: requiredAmount,
                    remainingBalance,
                },
            });

            await transaction.commit();

            const refreshedContract = await Contract.findByPk(contract.id, {
                include: this.getContractDetailIncludes(),
            });

            return {
                contract: this.formatContractResponse(refreshedContract ?? contract, true, true),
                remainingBalance,
                debitedAmount: requiredAmount,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async payMonthlyRentFromBalance(contractId: string, tenantId: string): Promise<MonthlyRentPaymentResponse> {
        const transaction = await sequelize.transaction();

        try {
            const contract = await Contract.findByPk(contractId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!contract) {
                throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
            }

            if (contract.tenant_id !== tenantId) {
                throw new ContractError('You do not have permission to pay rent for this contract', 403, 'FORBIDDEN');
            }

            if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.EXPIRED) {
                throw new ContractError('Monthly rent can only be paid for active or expired contracts with pending dues', 400, 'CONTRACT_NOT_PAYABLE');
            }

            const profile = await Profile.findOne({
                where: { user_id: tenantId },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!profile) {
                throw new ContractError('Tenant profile not found', 404, 'PROFILE_NOT_FOUND');
            }

            const now = testingClockService.getNow();
            const payableInstallments = this.getPayableInstallmentDates(contract, now);

            if (payableInstallments.length === 0) {
                throw new ContractError('No rent installment is payable yet for this contract', 400, 'NO_INSTALLMENT_DUE');
            }

            const paidRows = await ActivityLog.findAll({
                where: {
                    actor_user_id: tenantId,
                    action: 'MONTHLY_RENT_PAID_FROM_BALANCE',
                    entity_type: 'CONTRACT',
                    entity_id: contract.id,
                },
                order: [['created_at', 'ASC']],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const paidInstallments = paidRows.reduce((sum, row) => {
                const meta = (row.metadata ?? {}) as Record<string, any>;
                const byInstallments = Number(meta.installmentsPaid ?? 0);
                if (Number.isFinite(byInstallments) && byInstallments > 0) return sum + byInstallments;
                return sum + 1;
            }, 0);

            const outstandingInstallments = Math.max(payableInstallments.length - paidInstallments, 0);
            if (outstandingInstallments <= 0) {
                throw new ContractError('All payable rent installments are already paid for this contract', 400, 'MONTHLY_RENT_ALREADY_PAID');
            }

            const rentAmount = Number(contract.rent_amount ?? 0);
            if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
                throw new ContractError('Monthly rent amount is not configured for this contract', 400, 'INVALID_RENT_AMOUNT');
            }

            // ─── Apply pending landlord-responsibility maintenance credits ──────
            // Maintenance jobs the landlord owed for in past months get deducted
            // from the next rent the tenant pays.
            const { LandlordMaintenanceCharge, LandlordMaintenanceChargeStatus } = await import(
                '../../maintenance/models/LandlordMaintenanceCharge.js'
            );
            const pendingCharges = await LandlordMaintenanceCharge.findAll({
                where: {
                    contract_id: contract.id,
                    status: LandlordMaintenanceChargeStatus.PENDING,
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            const pendingCreditTotal = pendingCharges.reduce(
                (sum, c) => sum + Number((c as any).amount ?? 0),
                0
            );
            const grossRentDue = rentAmount * outstandingInstallments;
            const netRentAmount = Math.max(grossRentDue - pendingCreditTotal, 0);
            const overdueInstallmentDates = payableInstallments.slice(paidInstallments);
            const lateInstallments = overdueInstallmentDates.filter((d) => d < now).length;
            const lateFeePerInstallment = Math.max(Number(contract.late_fee_amount ?? 0), 0);
            const lateFee = lateFeePerInstallment * lateInstallments;
            const totalToDebit = netRentAmount + lateFee;

            const availableBalance = Number((profile as any).wallet_balance ?? 0);
            if (availableBalance < totalToDebit) {
                throw new ContractError('Insufficient wallet balance to pay monthly rent (including late fee if applicable)', 400, 'INSUFFICIENT_WALLET_BALANCE');
            }

            const remainingBalance = Math.max(availableBalance - totalToDebit, 0);
            await profile.update({ wallet_balance: remainingBalance }, { transaction });

            for (const charge of pendingCharges) {
                await charge.update(
                    {
                        status: LandlordMaintenanceChargeStatus.APPLIED,
                        applied_at: testingClockService.getNow(),
                    },
                    { transaction }
                );
            }

            await contract.update(
                {
                    payment_verified_at: now,
                    payment_status: ContractPaymentStatus.PAID,
                },
                { transaction }
            );

            const coveredRange = overdueInstallmentDates.map((d) =>
                d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            );
            const paidForMonth = coveredRange.length > 1
                ? `${coveredRange[0]} - ${coveredRange[coveredRange.length - 1]}`
                : coveredRange[0] ?? 'Current cycle';

            await activityLogService.log({
                actor: { userId: tenantId, role: 'TENANT' },
                action: 'MONTHLY_RENT_PAID_FROM_BALANCE',
                entityType: 'CONTRACT',
                entityId: contract.id,
                description: `Monthly rent paid from wallet balance for ${paidForMonth}.`,
                metadata: {
                    contractId: contract.id,
                    paidForMonth,
                    debitedAmount: totalToDebit,
                    lateFeeApplied: lateFee,
                    wasLate: lateFee > 0,
                    installmentsPaid: outstandingInstallments,
                    landlordMaintenanceCredit: pendingCreditTotal,
                    rentAmount,
                    grossRentDue,
                    remainingBalance,
                },
            });

            await transaction.commit();

            const refreshedContract = await Contract.findByPk(contract.id, {
                include: this.getContractDetailIncludes(),
            });

            return {
                contract: this.formatContractResponse(refreshedContract ?? contract, true, true),
                remainingBalance,
                debitedAmount: totalToDebit,
                paidForMonth,
                lateFeeApplied: lateFee,
                wasLate: lateFee > 0,
                installmentsPaid: outstandingInstallments,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async initiateWalletTopup(
        tenantId: string,
        input: WalletTopupInitiateInput
    ): Promise<WalletTopupCheckoutResponse> {
        const amount = Number(input.amount ?? 0);
        const amountCents = Math.round(amount * 100);
        const paymentMethod = input.payment_method ?? 'CARD';
        const shouldSaveCard = Boolean(input.save_card) && paymentMethod === 'CARD';

        if (!Number.isFinite(amount) || amount <= 0 || amountCents <= 0) {
            throw new ContractError('Top-up amount must be greater than zero', 400, 'INVALID_TOPUP_AMOUNT');
        }

        const integrationId = paymentMethod === 'WALLET'
            ? env.PAYMOB_WALLET_INTEGRATION_ID
            : env.PAYMOB_INTEGRATION_ID;
        const iframeId = paymentMethod === 'WALLET'
            ? env.PAYMOB_WALLET_IFRAME_ID
            : env.PAYMOB_IFRAME_ID;

        if (integrationId <= 0) {
            throw new ContractError('Selected Paymob integration is not configured', 500, 'PAYMOB_INTEGRATION_NOT_CONFIGURED');
        }
        if (iframeId <= 0) {
            throw new ContractError('Selected Paymob iframe is not configured', 500, 'PAYMOB_IFRAME_NOT_CONFIGURED');
        }

        const tenantUser = await User.findByPk(tenantId, {
            include: [{ model: Profile, as: 'profile', attributes: ['first_name', 'last_name', 'phone_number'] }],
            attributes: ['id', 'email'],
        });

        if (!tenantUser) {
            throw new ContractError('Tenant user not found', 404, 'USER_NOT_FOUND');
        }

        const callbackUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/tenant-payment?walletTopup=1`;
        const profile = (tenantUser as any).profile;
        const checkout = await paymobService.createCheckoutSession({
            amountCents,
            merchantOrderId: `WALLET-${tenantId}-${testingClockService.getNow().getTime()}`,
            billingData: {
                email: tenantUser.email,
                first_name: profile?.first_name || 'Tenant',
                last_name: profile?.last_name || 'User',
                phone_number: profile?.phone_number || '+201000000000',
            },
            callbackUrl,
            integrationId,
            iframeId,
        });

        await Profile.update(
            {
                wallet_pending_order_id: checkout.orderId,
                wallet_pending_amount_cents: amountCents,
                wallet_pending_save_card: shouldSaveCard,
            },
            {
                where: { user_id: tenantId },
            }
        );

        return {
            checkoutUrl: checkout.iframeUrl,
            amountCents: checkout.amountCents,
            orderId: checkout.orderId,
            currency: 'EGP',
        };
    }

    async verifyWalletTopup(tenantId: string, input: WalletTopupVerifyInput): Promise<WalletBalanceResponse> {
        // ── Idempotency guard ─────────────────────────────────────────────
        // Frontend may retry verify after a transient network/Paymob timeout.
        // If we already credited this transaction earlier, simply return the
        // current balance instead of failing with NO_PENDING_TOPUP.
        const targetTxId = Number(input.transaction_id);
        const verifiedRows = await ActivityLog.findAll({
            where: {
                actor_user_id: tenantId,
                action: 'WALLET_TOPUP_VERIFIED',
            },
            order: [['created_at', 'DESC']],
            limit: 25,
        });

        const alreadyVerified = verifiedRows.some((row) => {
            const meta = (row.metadata ?? {}) as Record<string, any>;
            return Number(meta.transactionId) === targetTxId;
        });

        if (alreadyVerified) {
            const currentProfile = await Profile.findOne({ where: { user_id: tenantId } });
            return {
                balance: Number((currentProfile as any)?.wallet_balance ?? 0),
                currency: 'EGP',
            };
        }

        const transaction = await sequelize.transaction();

        try {
            const profile = await Profile.findOne({
                where: { user_id: tenantId },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!profile) {
                throw new ContractError('Tenant profile not found', 404, 'PROFILE_NOT_FOUND');
            }

            const pendingOrderId = Number((profile as any).wallet_pending_order_id ?? 0);
            const pendingAmountCents = Number((profile as any).wallet_pending_amount_cents ?? 0);
            const shouldSaveCard = Boolean((profile as any).wallet_pending_save_card);

            if (!pendingOrderId || !pendingAmountCents) {
                throw new ContractError('No pending wallet top-up found for verification', 400, 'NO_PENDING_TOPUP');
            }

            const verification = await paymobService.verifyTransaction(input.transaction_id);
            // Normalize both sides to Number — Sequelize returns BIGINT as string
            const paymobOrderId = Number(verification.orderId ?? 0);
            const isOrderMatched = paymobOrderId > 0 && paymobOrderId === pendingOrderId;
            const isAmountMatched = Number(verification.amountCents) === Number(pendingAmountCents);
            const isSuccess = verification.success && !verification.pending && !verification.isVoided && !verification.isRefunded;

            console.log('[WalletTopup] Verification details:', {
                transactionId: input.transaction_id,
                pendingOrderId,
                paymobOrderId,
                isOrderMatched,
                pendingAmountCents,
                actualAmountCents: verification.amountCents,
                isAmountMatched,
                isSuccess,
                paymobSuccess: verification.success,
                paymobPending: verification.pending,
                rawOrderId: (profile as any).wallet_pending_order_id,
                rawOrderIdType: typeof (profile as any).wallet_pending_order_id,
            });

            if (!isSuccess || !isOrderMatched || !isAmountMatched) {
                await profile.update(
                    {
                        wallet_pending_order_id: null,
                        wallet_pending_amount_cents: null,
                        wallet_pending_save_card: false,
                    },
                    { transaction }
                );

                const failReason = !isSuccess ? 'Transaction not successful' : !isOrderMatched ? 'Order ID mismatch' : 'Amount mismatch';
                throw new ContractError(`Wallet top-up verification failed: ${failReason}. Please retry top-up.`, 400, 'TOPUP_VERIFICATION_FAILED');
            }

            const currentBalance = Number((profile as any).wallet_balance ?? 0);
            const updatedBalance = currentBalance + pendingAmountCents / 100;

            await profile.update(
                {
                    wallet_balance: updatedBalance,
                    wallet_pending_order_id: null,
                    wallet_pending_amount_cents: null,
                    wallet_pending_save_card: false,
                },
                { transaction }
            );

            if (shouldSaveCard && verification.cardToken && verification.cardLast4 && verification.cardExpMonth && verification.cardExpYear) {
                const existing = await PaymentMethod.findOne({
                    where: {
                        user_id: tenantId,
                        provider: PaymentProvider.PAYMOB,
                        provider_payment_token: verification.cardToken,
                    },
                    transaction,
                });

                if (!existing) {
                    const safeBrand = (verification.cardBrand || 'CARD').toUpperCase().slice(0, 40);
                    const safeLast4 = verification.cardLast4.slice(-4).padStart(4, '0');
                    const safeHolder = (verification.cardholderName || 'Card Holder').trim().slice(0, 120) || 'Card Holder';

                    await PaymentMethod.create(
                        {
                            user_id: tenantId,
                            provider: PaymentProvider.PAYMOB,
                            provider_payment_token: verification.cardToken,
                            brand: safeBrand,
                            last4: safeLast4,
                            exp_month: verification.cardExpMonth,
                            exp_year: verification.cardExpYear,
                            cardholder_name: safeHolder,
                            is_default: false,
                        },
                        { transaction }
                    );
                }
            }

            await transaction.commit();

            // Record verification so retries are idempotent and history is auditable.
            await activityLogService.log({
                actor: { userId: tenantId, role: 'TENANT' },
                action: 'WALLET_TOPUP_VERIFIED',
                entityType: 'PROFILE',
                entityId: tenantId,
                description: `Wallet top-up of ${(pendingAmountCents / 100).toFixed(2)} EGP verified.`,
                metadata: {
                    transactionId: Number(input.transaction_id),
                    orderId: pendingOrderId,
                    amountCents: pendingAmountCents,
                    creditedAmount: pendingAmountCents / 100,
                    newBalance: updatedBalance,
                },
            });

            return {
                balance: updatedBalance,
                currency: 'EGP',
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getTenantPaymentHistory(
        tenantId: string,
        opts: { limit?: number } = {}
    ): Promise<import('../interfaces/contract.interfaces.js').TenantPaymentHistoryItem[]> {
        const limit = Math.min(Math.max(opts.limit ?? 100, 1), 300);
        const actions = [
            'CONTRACT_PAID_FROM_BALANCE',
            'MONTHLY_RENT_PAID_FROM_BALANCE',
            'MAINTENANCE_ESCROW_DEBIT',
            'MAINTENANCE_DISPUTE_CHARGED_TENANT',
            'MAINTENANCE_DISPUTE_REFUNDED_TENANT',
            'MAINTENANCE_DIRECT_SETTLEMENT_DEBIT',
        ];

        const rows = await ActivityLog.findAll({
            where: {
                actor_user_id: tenantId,
                action: { [Op.in]: actions },
            },
            order: [['created_at', 'DESC']],
            limit,
        });

        return rows.map((row) => {
            const metadata = (row.metadata ?? {}) as Record<string, any>;
            const action = row.action;
            const amountRaw =
                metadata.amount ??
                metadata.debitedAmount ??
                metadata.refundedAmount ??
                metadata.netAmount ??
                0;
            const amount = Number(amountRaw ?? 0);

            const isCredit = action === 'MAINTENANCE_DISPUTE_REFUNDED_TENANT';
            const type =
                action === 'CONTRACT_PAID_FROM_BALANCE'
                    ? 'CONTRACT_INITIAL'
                    : action === 'MONTHLY_RENT_PAID_FROM_BALANCE'
                        ? 'RENT_MONTHLY'
                        : action === 'MAINTENANCE_DISPUTE_REFUNDED_TENANT'
                            ? 'MAINTENANCE_REFUND'
                            : 'MAINTENANCE';

            const installmentsCount =
                action === 'MONTHLY_RENT_PAID_FROM_BALANCE'
                    ? Math.max(Number(metadata.installmentsPaid ?? 1), 1)
                    : null;

            return {
                id: row.id,
                createdAt: row.created_at,
                type,
                direction: isCredit ? 'CREDIT' : 'DEBIT',
                amount: Math.abs(Number.isFinite(amount) ? amount : 0),
                currency: 'EGP',
                status: 'SUCCESS',
                reference: row.entity_id ?? row.id,
                description: row.description,
                entityType: row.entity_type ?? null,
                entityId: row.entity_id ?? null,
                ...(installmentsCount ? { installmentsCount } : {}),
            };
        });
    }

    /**
     * Build a per-installment view of a contract's monthly rent schedule.
     * Each installment carries a status (PAID / DUE / OVERDUE / UPCOMING),
     * the late-fee that applies (if any) and whether it has been settled.
     */
    async getContractInstallments(
        contractId: string,
        tenantId: string
    ): Promise<ContractInstallmentsResponse> {
        const contract = await Contract.findByPk(contractId);
        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }
        if (contract.tenant_id !== tenantId) {
            throw new ContractError('You do not have permission to view this contract', 403, 'FORBIDDEN');
        }
        if (
            contract.status !== ContractStatus.ACTIVE &&
            contract.status !== ContractStatus.EXPIRED
        ) {
            throw new ContractError(
                'Installments are only available for active or expired contracts',
                400,
                'CONTRACT_NOT_PAYABLE'
            );
        }

        const profile = await Profile.findOne({ where: { user_id: tenantId } });
        const walletBalance = Number((profile as any)?.wallet_balance ?? 0);

        const now = testingClockService.getNow();
        const dueDates = this.getContractDueDates(contract);
        const payableInstallments = this.getPayableInstallmentDates(contract, now);

        const paidRows = await ActivityLog.findAll({
            where: {
                actor_user_id: tenantId,
                action: 'MONTHLY_RENT_PAID_FROM_BALANCE',
                entity_type: 'CONTRACT',
                entity_id: contract.id,
            },
            order: [['created_at', 'ASC']],
        });

        const paidInstallments = paidRows.reduce((sum, row) => {
            const meta = (row.metadata ?? {}) as Record<string, any>;
            const byInstallments = Number(meta.installmentsPaid ?? 0);
            if (Number.isFinite(byInstallments) && byInstallments > 0) return sum + byInstallments;
            return sum + 1;
        }, 0);

        const flatPaidDates: Array<{ paidAt: Date }> = [];
        paidRows.forEach((row) => {
            const meta = (row.metadata ?? {}) as Record<string, any>;
            const count = Math.max(Number(meta.installmentsPaid ?? 1), 1);
            for (let i = 0; i < count; i += 1) {
                flatPaidDates.push({ paidAt: new Date(row.created_at) });
            }
        });

        const { LandlordMaintenanceCharge, LandlordMaintenanceChargeStatus } = await import(
            '../../maintenance/models/LandlordMaintenanceCharge.js'
        );
        const pendingCharges = await LandlordMaintenanceCharge.findAll({
            where: {
                contract_id: contract.id,
                status: LandlordMaintenanceChargeStatus.PENDING,
            },
        });
        const pendingCreditTotal = pendingCharges.reduce(
            (sum, c) => sum + Number((c as any).amount ?? 0),
            0
        );

        const rentAmount = Number(contract.rent_amount ?? 0);
        const lateFeeAmount = Math.max(Number(contract.late_fee_amount ?? 0), 0);

        const items: RentInstallmentItem[] = dueDates.map((dueDate, idx) => {
            const isPaidIdx = idx < paidInstallments;
            const isDue = dueDate <= now || isSameYearMonth(dueDate, now);
            const isOverdue = dueDate < now && !isPaidIdx;
            let status: RentInstallmentStatus = 'UPCOMING';
            if (isPaidIdx) status = 'PAID';
            else if (isOverdue) status = 'OVERDUE';
            else if (isDue) status = 'DUE';

            const installmentLateFee = status === 'OVERDUE' ? lateFeeAmount : 0;

            return {
                index: idx,
                label: dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                dueDate: dueDate.toISOString(),
                rentAmount,
                lateFeeAmount: installmentLateFee,
                totalAmount: rentAmount + installmentLateFee,
                status,
                isPaid: isPaidIdx,
                paidAt: flatPaidDates[idx]?.paidAt
                    ? (flatPaidDates[idx]!.paidAt as Date).toISOString()
                    : null,
            };
        });

        const overdueInstallments = items.filter((i) => i.status === 'OVERDUE').length;
        const outstandingInstallments = Math.max(payableInstallments.length - paidInstallments, 0);

        // Compute net amount that would be debited for "Pay Now" (settles all currently-due)
        const grossRentDue = rentAmount * outstandingInstallments;
        const netRentAmount = Math.max(grossRentDue - pendingCreditTotal, 0);
        const lateFee = lateFeeAmount * overdueInstallments;
        const nextPayableTotal = netRentAmount + lateFee;
        const nextPayableIndex = paidInstallments < dueDates.length ? paidInstallments : null;

        return {
            contractId: contract.id,
            rentAmount,
            lateFeeAmount,
            rentDueDate: contract.rent_due_date ?? null,
            leaseDurationMonths: contract.lease_duration_months,
            autopayEnabled: Boolean((contract as any).autopay_enabled),
            walletBalance,
            pendingLandlordCredit: pendingCreditTotal,
            paidInstallments,
            dueInstallments: payableInstallments.length,
            overdueInstallments,
            outstandingInstallments,
            nextPayableIndex,
            nextPayableTotal,
            items,
            now: now.toISOString(),
        };
    }

    /**
     * Toggle autopay for a contract. When enabled, due installments are
     * automatically settled from the wallet balance whenever
     * `runAutopaySweepForTenant` runs (e.g., on testing-clock advance).
     */
    async setContractAutopay(
        contractId: string,
        tenantId: string,
        enabled: boolean
    ): Promise<AutopayUpdateResponse> {
        const contract = await Contract.findByPk(contractId);
        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }
        if (contract.tenant_id !== tenantId) {
            throw new ContractError('You do not have permission to modify this contract', 403, 'FORBIDDEN');
        }
        if (
            contract.status !== ContractStatus.ACTIVE &&
            contract.status !== ContractStatus.EXPIRED
        ) {
            throw new ContractError(
                'Autopay can only be configured for active or expired contracts',
                400,
                'CONTRACT_NOT_PAYABLE'
            );
        }

        await contract.update({ autopay_enabled: Boolean(enabled) });

        await activityLogService.log({
            actor: { userId: tenantId, role: 'TENANT' },
            action: enabled ? 'CONTRACT_AUTOPAY_ENABLED' : 'CONTRACT_AUTOPAY_DISABLED',
            entityType: 'CONTRACT',
            entityId: contract.id,
            description: `Tenant ${enabled ? 'enabled' : 'disabled'} autopay for contract ${contract.contract_id}.`,
            metadata: { contractId: contract.id },
        });

        return {
            contractId: contract.id,
            autopayEnabled: Boolean((contract as any).autopay_enabled),
        };
    }

    /**
     * Settle all autopay-eligible contracts for a tenant.
     * - Walks through every ACTIVE/EXPIRED contract with autopay enabled.
     * - Skips contracts that have no outstanding installments or insufficient balance.
     * - Each contract is settled in its own transaction (atomic per-contract).
     * Used after the testing clock advances so simulated months actually
     * collect payment without manual interaction.
     */
    async runAutopaySweepForTenant(tenantId: string): Promise<{ contractsSettled: number }> {
        const contracts = await Contract.findAll({
            where: {
                tenant_id: tenantId,
                autopay_enabled: true,
                status: { [Op.in]: [ContractStatus.ACTIVE, ContractStatus.EXPIRED] },
            },
        });

        let contractsSettled = 0;
        for (const contract of contracts) {
            try {
                await this.payMonthlyRentFromBalance(contract.id, tenantId);
                contractsSettled += 1;
            } catch {
                // Insufficient balance / no dues / etc. — skip silently for sweep.
            }
        }

        return { contractsSettled };
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Find and validate a contract for landlord operations
     */
    private async findAndValidateLandlordContract(
        contractId: string,
        landlordId: string
    ): Promise<Contract> {
        const contract = await Contract.findByPk(contractId);

        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }

        if (contract.landlord_id !== landlordId) {
            throw new ContractError(
                'You do not have permission to modify this contract',
                403,
                'FORBIDDEN'
            );
        }

        if (contract.status !== ContractStatus.PENDING_LANDLORD) {
            throw new ContractError(
                'This contract can no longer be modified by the landlord',
                400,
                'CONTRACT_NOT_PENDING_LANDLORD'
            );
        }

        return contract;
    }

    /**
     * Find and validate a contract for tenant operations
     */
    private async findAndValidateTenantContract(
        contractId: string,
        tenantId: string
    ): Promise<Contract> {
        const contract = await Contract.findByPk(contractId);

        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }

        if (contract.tenant_id !== tenantId) {
            throw new ContractError(
                'You do not have permission to modify this contract',
                403,
                'FORBIDDEN'
            );
        }

        if (contract.status !== ContractStatus.PENDING_TENANT) {
            throw new ContractError(
                'This contract is not currently awaiting tenant action',
                400,
                'CONTRACT_NOT_PENDING_TENANT'
            );
        }

        return contract;
    }

    /**
     * Find and validate a contract for tenant payment operations
     */
    private async findAndValidateTenantPaymentContract(
        contractId: string,
        tenantId: string,
        transaction?: any
    ): Promise<Contract> {
        const contract = await Contract.findByPk(contractId, { transaction });

        if (!contract) {
            throw new ContractError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
        }

        if (contract.tenant_id !== tenantId) {
            throw new ContractError(
                'You do not have permission to make payment for this contract',
                403,
                'FORBIDDEN'
            );
        }

        if (contract.status !== ContractStatus.PENDING_PAYMENT && contract.status !== ContractStatus.ACTIVE) {
            throw new ContractError(
                'This contract is not currently in payment stage',
                400,
                'CONTRACT_NOT_PENDING_PAYMENT'
            );
        }

        return contract;
    }

    private calculateContractTotalAmountCents(contract: Contract): number {
        const total = this.calculateContractTotalAmount(contract);
        return Math.round(total * 100);
    }

    private calculateContractTotalAmount(contract: Contract): number {
        const rent = Number(contract.rent_amount ?? 0);
        const deposit = Number(contract.security_deposit ?? 0);
        const fee = Number(contract.service_fee ?? 0);
        return rent + deposit + fee;
    }

    private async expireCompletedLeases(): Promise<void> {
        const now = testingClockService.getNow();
        const activeContracts = await Contract.findAll({
            where: { status: ContractStatus.ACTIVE },
            attributes: ['id', 'move_in_date', 'lease_duration_months'],
        });

        for (const contract of activeContracts) {
            const moveIn = new Date(contract.move_in_date as any);
            if (Number.isNaN(moveIn.getTime())) continue;
            const leaseEnd = new Date(moveIn);
            leaseEnd.setMonth(leaseEnd.getMonth() + Number(contract.lease_duration_months ?? 0));
            if (now >= leaseEnd) {
                await contract.update({ status: ContractStatus.EXPIRED });
            }
        }
    }

    private getCycleDueDate(contract: Contract, referenceDate: Date): Date {
        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();

        if (contract.rent_due_date === '5TH_OF_MONTH') {
            return new Date(year, month, 5);
        }

        if (contract.rent_due_date === 'LAST_DAY_OF_MONTH') {
            return new Date(year, month + 1, 0);
        }

        return new Date(year, month, 1);
    }

    private getContractDueDates(contract: Contract): Date[] {
        const moveIn = new Date(contract.move_in_date as any);
        if (Number.isNaN(moveIn.getTime())) return [];

        const leaseMonths = Math.max(Number(contract.lease_duration_months ?? 0), 0);
        if (leaseMonths <= 0) return [];

        // First installment must fall on/after move-in (e.g., move-in Apr 15 +
        // 1ST_OF_MONTH ⇒ first due is May 1, not Apr 1).
        let firstRef = new Date(moveIn.getFullYear(), moveIn.getMonth(), 1);
        let firstDue = this.getCycleDueDate(contract, firstRef);
        if (firstDue < moveIn) {
            firstRef = new Date(firstRef.getFullYear(), firstRef.getMonth() + 1, 1);
            firstDue = this.getCycleDueDate(contract, firstRef);
        }

        const dueDates: Date[] = [];
        for (let i = 0; i < leaseMonths; i += 1) {
            const ref = new Date(firstRef.getFullYear(), firstRef.getMonth() + i, 1);
            dueDates.push(this.getCycleDueDate(contract, ref));
        }
        return dueDates;
    }

    private getPayableInstallmentDates(contract: Contract, now: Date): Date[] {
        const dueDates = this.getContractDueDates(contract);
        return dueDates.filter((d) => d <= now || isSameYearMonth(d, now));
    }

    /**
     * Include options for contract list queries
     */
    private getContractListIncludes() {
        return [
            {
                model: Property,
                as: 'property',
                attributes: ['id', 'title', 'address', 'maintenance_responsibilities'],
            },
            {
                model: User,
                as: 'tenant',
                attributes: ['id'],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: ['first_name', 'last_name'],
                    },
                ],
            },
            {
                model: User,
                as: 'landlord',
                attributes: ['id', 'email'],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: ['first_name', 'last_name'],
                    },
                ],
            },
        ];
    }

    /**
     * Include options for contract detail queries
     */
    private getContractDetailIncludes() {
        return [
            {
                model: Property,
                as: 'property',
                attributes: ['id', 'title', 'address', 'type', 'furnishing', 'monthly_price', 'security_deposit', 'maintenance_responsibilities'],
                include: [
                    {
                        model: PropertySpecifications,
                        as: 'specifications',
                        attributes: ['bedrooms', 'bathrooms', 'area_sqft'],
                    },
                ],
            },
            {
                model: User,
                as: 'tenant',
                attributes: ['id', 'email'],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: ['first_name', 'last_name'],
                    },
                ],
            },
            {
                model: User,
                as: 'landlord',
                attributes: ['id', 'email'],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: ['first_name', 'last_name'],
                    },
                ],
            },
        ];
    }

    /**
     * Format a Contract model instance into a response DTO
     */
    private formatContractResponse(
        contract: Contract,
        includeRelations: boolean = false,
        includeMaintenanceResponsibilities: boolean = false
    ): ContractResponse {
        const response: ContractResponse = {
            id: contract.id,
            contractId: contract.contract_id,
            leaseId: contract.lease_id ?? null,
            rentalRequestId: contract.rental_request_id,
            propertyId: contract.property_id,
            landlordId: contract.landlord_id,
            tenantId: contract.tenant_id,
            status: contract.status,
            rentAmount: contract.rent_amount ? Number(contract.rent_amount) : null,
            securityDeposit: contract.security_deposit ? Number(contract.security_deposit) : null,
            serviceFee: Number(contract.service_fee),
            paymentSchedule: contract.payment_schedule,
            rentDueDate: contract.rent_due_date ?? null,
            lateFeeAmount: contract.late_fee_amount ? Number(contract.late_fee_amount) : null,
            maxOccupants: contract.max_occupants ?? null,
            moveInDate: contract.move_in_date,
            leaseDurationMonths: contract.lease_duration_months,
            landlordNationalId: safeDecrypt(contract.landlord_national_id),
            propertyRegistrationNumber: contract.property_registration_number ?? null,
            landlordSignedAt: contract.landlord_signed_at ?? null,
            tenantSignedAt: contract.tenant_signed_at ?? null,
            tenantAgreedTerms: contract.tenant_agreed_terms,
            paymentStatus: contract.payment_status,
            paymentVerifiedAt: contract.payment_verified_at ?? null,
            paymobOrderId: contract.paymob_order_id ?? null,
            paymobTransactionId: contract.paymob_transaction_id ?? null,
            tenantNationalId: safeDecrypt(contract.tenant_national_id),
            tenantEmergencyContactName: contract.tenant_emergency_contact_name ?? null,
            tenantEmergencyPhone: contract.tenant_emergency_phone ?? null,
            createdAt: contract.created_at,
            updatedAt: contract.updated_at,
        };

        if (includeRelations) {
            if (contract.landlord) {
                const landlordProfile = (contract.landlord as any).profile;
                response.landlord = {
                    id: contract.landlord.id,
                    firstName: landlordProfile?.first_name ?? '',
                    lastName: landlordProfile?.last_name ?? '',
                    email: contract.landlord.email,
                };
            }

            if (contract.tenant) {
                const tenantProfile = (contract.tenant as any).profile;
                response.tenant = {
                    id: contract.tenant.id,
                    firstName: tenantProfile?.first_name ?? '',
                    lastName: tenantProfile?.last_name ?? '',
                    email: contract.tenant.email,
                };
            }

            if (contract.property) {
                const prop = contract.property as any;
                response.property = {
                    id: prop.id,
                    title: prop.title,
                    address: prop.address,
                    type: prop.type ?? null,
                    furnishing: prop.furnishing ?? null,
                    monthlyPrice: prop.monthly_price ? Number(prop.monthly_price) : null,
                    securityDeposit: prop.security_deposit ? Number(prop.security_deposit) : null,
                    maintenanceResponsibilities: (prop.maintenance_responsibilities ?? []).map((item: any) => ({
                        area: item.area,
                        responsible_party: item.responsible_party,
                    })),
                };

                if (prop.specifications) {
                    response.propertySpecifications = {
                        bedrooms: prop.specifications.bedrooms,
                        bathrooms: prop.specifications.bathrooms,
                        areaSqft: Number(prop.specifications.area_sqft),
                    };
                }
            }
        }

        if (includeMaintenanceResponsibilities && contract.maintenanceResponsibilities) {
            response.maintenanceResponsibilities = contract.maintenanceResponsibilities.map(
                (mr): MaintenanceResponsibilityResponse => ({
                    id: mr.id,
                    area: mr.area,
                    responsibleParty: mr.responsible_party,
                })
            );
        }

        return response;
    }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;
