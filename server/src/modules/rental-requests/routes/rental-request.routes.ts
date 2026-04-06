import { Router } from 'express';
import { rentalRequestController } from '../controllers/rental-request.controller.js';
import { validate, validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { protect, requireVerified } from '../../../shared/middleware/auth.middleware.js';
import {
    CreateRentalRequestSchema,
    UpdateRentalRequestStatusSchema,
    RentalRequestQuerySchema,
} from '../schemas/rental-request.schemas.js';

const router = Router();

/**
 * @swagger
 * /rental-requests:
 *   post:
 *     summary: Submit a rental request
 *     description: |
 *       Submit a rental request on a published property. **Only verified tenants** can access this endpoint.
 *
 *       A tenant cannot submit multiple pending requests for the same property.
 *
 *       ### Duration Format
 *       - Use `N_MONTHS` where `N` is from 1 to 120
 *       - Examples: `6_MONTHS`, `14_MONTHS`, `24_MONTHS`
 *
 *       ### Living Situation Options
 *       - `SINGLE`
 *       - `FAMILY`
 *       - `MARRIED`
 *       - `STUDENTS`
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRentalRequestBody'
 *           example:
 *             property_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *             move_in_date: "2026-04-01"
 *             duration: "12_MONTHS"
 *             occupants: 2
 *             living_situation: "MARRIED"
 *             message: "We are a quiet couple looking for a long-term stay. We both work from home."
 *     responses:
 *       201:
 *         description: Rental request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rental request submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RentalRequestResponse'
 *       400:
 *         description: Validation error or property not published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated — JWT token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — user is not a verified tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate — tenant already has a pending request on this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You already have a pending rental request for this property"
 *               code: "DUPLICATE_REQUEST"
 */
router.post(
    '/',
    protect,
    requireVerified,
    validate(CreateRentalRequestSchema),
    rentalRequestController.createRentalRequest.bind(rentalRequestController)
);

/**
 * @swagger
 * /rental-requests/my-requests:
 *   get:
 *     summary: Get my rental requests (tenant)
 *     description: |
 *       Retrieve a paginated list of rental requests submitted by the
 *       authenticated tenant. Optionally filter by status.
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, DECLINED]
 *         description: Filter by request status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Tenant's rental requests retrieved successfully
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
 *                     $ref: '#/components/schemas/RentalRequestResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/my-requests',
    protect,
    validateQuery(RentalRequestQuerySchema),
    rentalRequestController.getMyRentalRequests.bind(rentalRequestController)
);

/**
 * @swagger
 * /rental-requests/landlord:
 *   get:
 *     summary: Get all rental requests on my properties (landlord)
 *     description: |
 *       Retrieve a paginated list of all rental requests submitted on the
 *       authenticated landlord's properties. Each request includes tenant
 *       summary information (photo, name, bio) and property details.
 *
 *       Use the `GET /rental-requests/{id}` endpoint to view full details
 *       when reviewing a single application.
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, DECLINED]
 *         description: Filter by request status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Landlord's rental requests retrieved successfully
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
 *                     $ref: '#/components/schemas/RentalRequestWithTenantResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — user is not a landlord
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/landlord',
    protect,
    validateQuery(RentalRequestQuerySchema),
    rentalRequestController.getLandlordRentalRequests.bind(rentalRequestController)
);

router.patch(
    '/:id/cancel',
    protect,
    rentalRequestController.cancelMyRentalRequest.bind(rentalRequestController)
);

/**
 * @swagger
 * /rental-requests/{id}:
 *   get:
 *     summary: Get rental request details
 *     description: |
 *       Retrieve full details of a specific rental request. Only the tenant
 *       who created the request or the landlord who owns the property can view it.
 *
 *       When the landlord clicks **Review Application**, use this endpoint
 *       to fetch the tenant's details (photo, name, bio) alongside the
 *       rental request form data.
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the rental request
 *     responses:
 *       200:
 *         description: Rental request details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RentalRequestWithTenantResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to view this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rental request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:id',
    protect,
    rentalRequestController.getRentalRequestById.bind(rentalRequestController)
);

/**
 * @swagger
 * /rental-requests/{id}/status:
 *   put:
 *     summary: Approve or decline a rental request (landlord)
 *     description: |
 *       Update the status of a rental request. **Only the landlord who owns
 *       the property** can approve or decline.
 *
 *       - Only requests in `PENDING` status can be updated.
 *       - Once set to `APPROVED` or `DECLINED`, the decision is final.
 *     tags: [Rental Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the rental request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRentalRequestStatusBody'
 *           examples:
 *             approve:
 *               summary: Approve the request
 *               value:
 *                 status: "APPROVED"
 *             decline:
 *               summary: Decline the request
 *               value:
 *                 status: "DECLINED"
 *     responses:
 *       200:
 *         description: Rental request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rental request approved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RentalRequestWithTenantResponse'
 *       400:
 *         description: Request already processed or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "This rental request has already been approved"
 *               code: "REQUEST_ALREADY_PROCESSED"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized — not the property owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rental request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id/status',
    protect,
    validate(UpdateRentalRequestStatusSchema),
    rentalRequestController.updateRentalRequestStatus.bind(rentalRequestController)
);

export default router;
