import { Router } from 'express';
import { propertyController } from '../controllers/property.controller.js';
import { validate, validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { protect, requireVerified } from '../../../shared/middleware/auth.middleware.js';
import {
    CreatePropertySchema,
    UpdatePropertySchema,
    PropertyQuerySchema,
} from '../schemas/property.schemas.js';

const router = Router();

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
*     description: Create a new property listing. Only landlords can create properties.  <br>
*       **Available amenity names for `amenity_names`:**  
*       - **Private Parking**  
*       - **Smart Home System**  
*       - **24/7 Concierge**  
*       - **Fitness Center**  
*       - **High-Speed Wi-Fi**  
*       - **Pet Friendly**  
*       - **EV Charging Station**  
*       - **Keyless / Biometric Entry**  
*       - **Rooftop Lounge**  
*       - **Spa and Sauna**  
*       - **Private Cinema / Theater Room**  
*       - **Valet Parking**  
*       - **Co-working Space / Business Center**  
*       - **24/7 Security System**  
*       - **Air Conditioning (AC)**  
*       - **Kids Play Area**  
*       - **Intercom System**  
*       - **24/7 Compound Security**
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *           example:
 *             title: "Beautiful 2BR Apartment"
 *             description: "Spacious apartment with modern amenities in downtown"
 *             monthly_price: 1500.00
 *             security_deposit: 3000.00
 *             address: "123 Main Street, Cairo, Egypt"
 *             location_lat: 30.0444
 *             location_long: 31.2357
 *             furnishing: "Fully"
 *             availability_date: "2026-03-01"
 *             images:
 *               - image_url: "https://example.com/image1.jpg"
 *                 is_main: true
 *               - image_url: "https://example.com/image2.jpg"
 *                 is_main: false
 *             amenity_names:
 *               - "Fitness Center"
 *               - "High-Speed Wi-Fi"
 *             specifications:
 *               bedrooms: 2
 *               bathrooms: 2
 *               floor: 5
 *               parking_spaces: 1
 *               area_sqft: 1200
 *               detailed_location: "Building 3, Floor 5, Apartment 12, Downtown Cairo"
 *     responses:
 *       201:
 *         description: Property created successfully
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
 *                   example: "Property created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PropertyResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden — only verified landlords can create properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notLandlord:
 *                 summary: User is not a landlord
 *                 value:
 *                   success: false
 *                   message: "Only landlords can create properties"
 *                   code: "FORBIDDEN"
 *               notVerified:
 *                 summary: Account not verified
 *                 value:
 *                   success: false
 *                   message: "Your account is not fully verified. Please complete verification at /complete-verification."
 *                   code: "ACCOUNT_NOT_VERIFIED"
 */
router.post(
    '/',
    protect,
    requireVerified,
    validate(CreatePropertySchema),
    propertyController.createProperty.bind(propertyController)
);

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties
 *     description: Retrieve a list of properties with optional filtering and pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Published, Rented]
 *         description: Filter by property status
 *       - in: query
 *         name: furnishing
 *         schema:
 *           type: string
 *           enum: [Fully, Semi, Unfurnished]
 *         description: Filter by furnishing status
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum monthly price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum monthly price filter
 *       - in: query
 *         name: landlordId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by landlord ID
 *       - in: query
 *         name: availabilityDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-03-01"
 *         description: Filter by availability date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
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
 *                     $ref: '#/components/schemas/PropertyResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.get(
    '/',
    validateQuery(PropertyQuerySchema),
    propertyController.getAllProperties.bind(propertyController)
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     description: Retrieve detailed information about a specific property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PropertyResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Property not found"
 *               code: "PROPERTY_NOT_FOUND"
 */
router.get(
    '/:id',
    propertyController.getPropertyById.bind(propertyController)
);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property
 *     description: Update property details. Only the property owner can update it.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePropertyRequest'
 *           example:
 *             title: "Updated Beautiful 2BR Apartment"
 *             monthly_price: 1600.00
 *             security_deposit: 3200.00
 *             furnishing: "Semi"
 *             status: "Published"
 *             availability_date: "2026-04-01"
 *             amenity_names:
 *               - "Rooftop Lounge"
 *     responses:
 *       200:
 *         description: Property updated successfully
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
 *                   example: "Property updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PropertyResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to update this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You do not have permission to update this property"
 *               code: "FORBIDDEN"
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    protect,
    validate(UpdatePropertySchema),
    propertyController.updateProperty.bind(propertyController)
);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     description: Delete a property listing. Only the property owner can delete it.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
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
 *                   example: "Property deleted successfully"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to delete this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You do not have permission to delete this property"
 *               code: "FORBIDDEN"
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    protect,
    propertyController.deleteProperty.bind(propertyController)
);

export default router;
