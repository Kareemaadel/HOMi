import { Op } from 'sequelize';
import {
    Contract,
    ContractStatus,
    ContractMaintenanceResponsibility,
    User,
    Profile,
    Property,
    RentalRequest,
    PropertySpecifications,
    sequelize,
} from '../models/index.js';
import { encrypt } from '../../../shared/utils/encryption.util.js';
import { PropertyImage } from '../../properties/models/PropertyImage.js';
import type {
    ContractResponse,
    ContractListResponse,
    VerificationSummaryResponse,
    MaintenanceResponsibilityResponse,
    LandlordLeaseTermsInput,
    LandlordIdentityInput,
    LandlordPropertyConfirmationInput,
    LandlordSignInput,
    TenantIdentityInput,
    TenantSignInput,
} from '../interfaces/contract.interfaces.js';

// ─── Duration map ─────────────────────────────────────────────────────────────

const DURATION_TO_MONTHS: Record<string, number> = {
    '6_MONTHS': 6,
    '12_MONTHS': 12,
    '24_MONTHS': 24,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateContractId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `HOMI-${num}`;
}

function generateLeaseId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `L-${num}-${letter}`;
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

        const durationMonths = DURATION_TO_MONTHS[rentalRequest.duration] || 12;

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
            service_fee: 10.00,
            move_in_date: rentalRequest.move_in_date,
            lease_duration_months: durationMonths,
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
        const { status, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const where: any = {
            tenant_id: tenantId,
            // Tenant can only see contracts after landlord has signed
            status: {
                [Op.in]: [
                    ContractStatus.PENDING_TENANT,
                    ContractStatus.ACTIVE,
                    ContractStatus.TERMINATED,
                    ContractStatus.EXPIRED,
                ],
            },
        };
        // If a specific status filter is provided and is valid for tenant view, use it
        if (status && [
            ContractStatus.PENDING_TENANT,
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

        const roomsLabel = specs
            ? `${specs.bedrooms} Bedroom${specs.bedrooms !== 1 ? 's' : ''}`
            : 'N/A';

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

        await sequelize.transaction(async (t) => {
            // Update property registration number
            await contract.update(
                { property_registration_number: input.property_registration_number },
                { transaction: t }
            );

            // Remove old maintenance responsibilities and create new ones
            await ContractMaintenanceResponsibility.destroy({
                where: { contract_id: contract.id },
                transaction: t,
            });

            if (input.maintenance_responsibilities.length > 0) {
                await ContractMaintenanceResponsibility.bulkCreate(
                    input.maintenance_responsibilities.map((mr) => ({
                        contract_id: contract.id,
                        area: mr.area as import('../models/ContractMaintenanceResponsibility.js').MaintenanceAreaType,
                        responsible_party: mr.responsible_party,
                    })),
                    { transaction: t }
                );
            }
        });

        // Reload with maintenance responsibilities
        const updated = await Contract.findByPk(contract.id, {
            include: [
                {
                    model: ContractMaintenanceResponsibility,
                    as: 'maintenanceResponsibilities',
                },
            ],
        });

        return this.formatContractResponse(updated!, false, true);
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
            landlord_signed_at: new Date(),
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
        });

        return this.formatContractResponse(contract);
    }

    /**
     * Tenant Step 4: Sign Contract
     * Moves status from PENDING_TENANT to ACTIVE
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
            tenant_signed_at: new Date(),
            tenant_agreed_terms: true,
            status: ContractStatus.ACTIVE,
        });

        return this.formatContractResponse(contract);
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
     * Include options for contract list queries
     */
    private getContractListIncludes() {
        return [
            {
                model: Property,
                as: 'property',
                attributes: ['id', 'title', 'address'],
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
                attributes: ['id', 'title', 'address', 'type', 'furnishing', 'monthly_price', 'security_deposit'],
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
            propertyRegistrationNumber: contract.property_registration_number ?? null,
            landlordSignedAt: contract.landlord_signed_at ?? null,
            tenantSignedAt: contract.tenant_signed_at ?? null,
            tenantAgreedTerms: contract.tenant_agreed_terms,
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
