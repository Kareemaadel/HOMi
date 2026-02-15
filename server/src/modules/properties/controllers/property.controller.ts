import type { Request, Response, NextFunction } from 'express';
import { propertyService, PropertyError } from '../services/property.service.js';
import type {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyQuery,
} from '../interfaces/property.interfaces.js';

/**
 * Property Controller
 * Handles HTTP request/response for property endpoints
 */
class PropertyController {
    /**
     * POST /api/properties
     * Create a new property
     * Requires authentication (LANDLORD only)
     */
    async createProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const landlordId = (req as any).user.userId;
            const input: CreatePropertyRequest = req.body;

            const property = await propertyService.createProperty(landlordId, input);

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: property,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/properties
     * Get all properties with optional filters
     * Public endpoint
     */
    async getAllProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Get validated query from middleware (fallback to req.query for safety)
            const filters: PropertyQuery = (req as any).validatedQuery || req.query;

            const result = await propertyService.getAllProperties(filters);

            res.status(200).json({
                success: true,
                data: result.properties,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/properties/:id
     * Get a single property by ID
     * Public endpoint
     */
    async getPropertyById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const property = await propertyService.getPropertyById(id as string);

            res.status(200).json({
                success: true,
                data: property,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/properties/:id
     * Update a property
     * Requires authentication (owner only)
     */
    async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const landlordId = (req as any).user.userId;
            const input: UpdatePropertyRequest = req.body;

            const property = await propertyService.updateProperty(id as string, landlordId, input);

            res.status(200).json({
                success: true,
                message: 'Property updated successfully',
                data: property,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/properties/:id
     * Delete a property
     * Requires authentication (owner only)
     */
    async deleteProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const landlordId = (req as any).user.userId;

            const result = await propertyService.deleteProperty(id as string, landlordId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const propertyController = new PropertyController();
export default propertyController;
