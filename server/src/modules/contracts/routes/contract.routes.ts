import { Router } from 'express';
import { contractController } from '../controllers/contract.controller.js';
import { validate, validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { protect } from '../../../shared/middleware/auth.middleware.js';
import {
    LandlordLeaseTermsSchema,
    LandlordIdentitySchema,
    LandlordPropertyConfirmationSchema,
    LandlordSignSchema,
    TenantIdentitySchema,
    TenantSignSchema,
    ContractQuerySchema,
} from '../schemas/contract.schemas.js';

const router = Router();

/**
 * @swagger
 * /contracts/landlord:
 *   get:
 *     summary: Get landlord's contracts
 *     description: |
 *       Retrieve a paginated list of all contracts where the authenticated user
 *       is the landlord. Includes contracts in all statuses.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_LANDLORD, PENDING_TENANT, ACTIVE, TERMINATED, EXPIRED]
 *         description: Filter by contract status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Landlord's contracts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContractResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get(
    '/landlord',
    protect,
    validateQuery(ContractQuerySchema),
    contractController.getLandlordContracts.bind(contractController)
);

/**
 * @swagger
 * /contracts/tenant:
 *   get:
 *     summary: Get tenant's contracts
 *     description: |
 *       Retrieve a paginated list of contracts for the authenticated tenant.
 *       **Only contracts where the landlord has already signed** (status ≥ PENDING_TENANT)
 *       are visible to tenants.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_TENANT, ACTIVE, TERMINATED, EXPIRED]
 *         description: Filter by contract status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Tenant's contracts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContractResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get(
    '/tenant',
    protect,
    validateQuery(ContractQuerySchema),
    contractController.getTenantContracts.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get contract details
 *     description: |
 *       Retrieve full details of a specific contract including maintenance
 *       responsibilities, landlord/tenant info, and property details.
 *       Only the landlord or tenant on the contract can view it.
 *       Tenants cannot view contracts with PENDING_LANDLORD status.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the contract
 *     responses:
 *       200:
 *         description: Contract details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ContractResponse'
 *       403:
 *         description: Not authorized or contract not ready for tenant
 *       404:
 *         description: Contract not found
 */
router.get(
    '/:id',
    protect,
    contractController.getContractById.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/verification-summary:
 *   get:
 *     summary: Get platform verification summary
 *     description: |
 *       Auto-generated read-only summary containing platform metadata,
 *       verified property information, payment terms, and lease duration.
 *       Used as Step 4 for landlords and Step 3 for tenants.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Verification summary generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VerificationSummaryResponse'
 */
router.get(
    '/:id/verification-summary',
    protect,
    contractController.getVerificationSummary.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/landlord/lease-terms:
 *   put:
 *     summary: "Landlord Step 1: Lease Terms & Financials"
 *     description: |
 *       Configure the financial terms and occupancy rules for the contract.
 *       Only available when contract status is PENDING_LANDLORD.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rent_due_date, late_fee_amount, max_occupants]
 *             properties:
 *               rent_due_date:
 *                 type: string
 *                 enum: [1ST_OF_MONTH, 5TH_OF_MONTH, LAST_DAY_OF_MONTH]
 *               late_fee_amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 50
 *               max_occupants:
 *                 type: integer
 *                 minimum: 1
 *                 example: 4
 *     responses:
 *       200:
 *         description: Lease terms submitted
 *       400:
 *         description: Validation error or contract not in correct status
 *       403:
 *         description: Not the contract landlord
 */
router.put(
    '/:id/landlord/lease-terms',
    protect,
    validate(LandlordLeaseTermsSchema),
    contractController.submitLandlordLeaseTerms.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/landlord/identity:
 *   put:
 *     summary: "Landlord Step 2: Identity Details"
 *     description: |
 *       Submit identity verification details.
 *       National ID is encrypted before storage.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [national_id]
 *             properties:
 *               national_id:
 *                 type: string
 *                 description: National ID or Business Registration Number
 *                 example: "29901011234567"
 *     responses:
 *       200:
 *         description: Identity details submitted
 */
router.put(
    '/:id/landlord/identity',
    protect,
    validate(LandlordIdentitySchema),
    contractController.submitLandlordIdentity.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/landlord/property-confirmation:
 *   put:
 *     summary: "Landlord Step 3: Property Ownership & Maintenance"
 *     description: |
 *       Confirm property ownership and set maintenance responsibilities.
 *       Previous maintenance entries are replaced with the new list.
 *       Each maintenance area must be one of the predefined options.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_registration_number, maintenance_responsibilities]
 *             properties:
 *               property_registration_number:
 *                 type: string
 *                 description: Property deed or registration reference number
 *                 example: "REG-99210-XB"
 *               maintenance_responsibilities:
 *                 type: array
 *                 description: List of maintenance areas and who is responsible
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [area, responsible_party]
 *                   properties:
 *                     area:
 *                       type: string
 *                       description: Predefined maintenance area (selectable option)
 *                       enum:
 *                         - Structural Repairs
 *                         - Interior Appliances
 *                         - Utility Bills
 *                         - Plumbing
 *                         - Electrical
 *                         - HVAC / Air Conditioning
 *                         - Pest Control
 *                         - Exterior Maintenance
 *                         - Common Areas
 *                         - Security Systems
 *                     responsible_party:
 *                       type: string
 *                       description: Party responsible for this area
 *                       enum: [LANDLORD, TENANT]
 *           examples:
 *             full_split:
 *               summary: Full split — landlord handles structure, tenant handles interior
 *               value:
 *                 property_registration_number: "REG-99210-XB"
 *                 maintenance_responsibilities:
 *                   - area: "Structural Repairs"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Interior Appliances"
 *                     responsible_party: "TENANT"
 *                   - area: "Utility Bills"
 *                     responsible_party: "TENANT"
 *                   - area: "Plumbing"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Electrical"
 *                     responsible_party: "LANDLORD"
 *                   - area: "HVAC / Air Conditioning"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Pest Control"
 *                     responsible_party: "TENANT"
 *                   - area: "Exterior Maintenance"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Common Areas"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Security Systems"
 *                     responsible_party: "LANDLORD"
 *             landlord_covers_all:
 *               summary: Landlord covers everything
 *               value:
 *                 property_registration_number: "DEED-2024-44521"
 *                 maintenance_responsibilities:
 *                   - area: "Structural Repairs"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Interior Appliances"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Utility Bills"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Plumbing"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Electrical"
 *                     responsible_party: "LANDLORD"
 *                   - area: "HVAC / Air Conditioning"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Pest Control"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Exterior Maintenance"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Common Areas"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Security Systems"
 *                     responsible_party: "LANDLORD"
 *             minimal:
 *               summary: Only key areas specified
 *               value:
 *                 property_registration_number: "P-88012"
 *                 maintenance_responsibilities:
 *                   - area: "Structural Repairs"
 *                     responsible_party: "LANDLORD"
 *                   - area: "Utility Bills"
 *                     responsible_party: "TENANT"
 *                   - area: "Plumbing"
 *                     responsible_party: "LANDLORD"
 *     responses:
 *       200:
 *         description: Property confirmation submitted
 */
router.put(
    '/:id/landlord/property-confirmation',
    protect,
    validate(LandlordPropertyConfirmationSchema),
    contractController.submitLandlordPropertyConfirmation.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/landlord/sign:
 *   put:
 *     summary: "Landlord Step 5: Sign Contract"
 *     description: |
 *       Sign the contract as landlord. All previous steps (lease terms,
 *       identity, property confirmation) must be completed first.
 *       Moves the contract from PENDING_LANDLORD to PENDING_TENANT.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [signature_url, certify_ownership]
 *             properties:
 *               signature_url:
 *                 type: string
 *                 description: URL to uploaded or drawn digital signature
 *                 example: "https://storage.homi.com/signatures/landlord-123.png"
 *               certify_ownership:
 *                 type: boolean
 *                 description: Must be true — certifies legal property ownership
 *                 example: true
 *     responses:
 *       200:
 *         description: Contract signed by landlord, now awaiting tenant
 *       400:
 *         description: Previous steps not completed
 */
router.put(
    '/:id/landlord/sign',
    protect,
    validate(LandlordSignSchema),
    contractController.signContractLandlord.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/tenant/identity:
 *   put:
 *     summary: "Tenant Step 2: Identity Verification"
 *     description: |
 *       Submit tenant identity verification details.
 *       National ID is encrypted before storage.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [national_id]
 *             properties:
 *               national_id:
 *                 type: string
 *                 example: "29901011234567"
 *     responses:
 *       200:
 *         description: Identity verification submitted
 */
router.put(
    '/:id/tenant/identity',
    protect,
    validate(TenantIdentitySchema),
    contractController.submitTenantIdentity.bind(contractController)
);

/**
 * @swagger
 * /contracts/{id}/tenant/sign:
 *   put:
 *     summary: "Tenant Step 4: Sign Contract"
 *     description: |
 *       Sign the contract as tenant. Identity verification (Step 2) must be
 *       completed first. Moves the contract from PENDING_TENANT to ACTIVE.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [signature_url, agree_to_terms]
 *             properties:
 *               signature_url:
 *                 type: string
 *                 description: URL to uploaded or drawn digital signature
 *                 example: "https://storage.homi.com/signatures/tenant-456.png"
 *               agree_to_terms:
 *                 type: boolean
 *                 description: Must be true — agrees to HOMI terms and legally binding signature
 *                 example: true
 *     responses:
 *       200:
 *         description: Contract signed by tenant, contract is now ACTIVE
 *       400:
 *         description: Identity verification not completed
 */
router.put(
    '/:id/tenant/sign',
    protect,
    validate(TenantSignSchema),
    contractController.signContractTenant.bind(contractController)
);

export default router;
