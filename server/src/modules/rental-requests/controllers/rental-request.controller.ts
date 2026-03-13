import type { Request, Response, NextFunction } from 'express';
import { rentalRequestService, RentalRequestError } from '../services/rental-request.service.js';
import type {
    CreateRentalRequestInput,
    UpdateRentalRequestStatusInput,
} from '../interfaces/rental-request.interfaces.js';

/**
 * Rental Request Controller
 * Handles HTTP request/response for rental request endpoints
 */
class RentalRequestController {
    /**
     * POST /api/rental-requests
     * Create a new rental request (tenant only)
     */
    async createRentalRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = (req as any).user.userId;
            const input: CreateRentalRequestInput = req.body;

            const rentalRequest = await rentalRequestService.createRentalRequest(tenantId, input);

            res.status(201).json({
                success: true,
                message: 'Rental request submitted successfully',
                data: rentalRequest,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rental-requests/my-requests
     * Get tenant's own rental requests
     */
    async getMyRentalRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tenantId = (req as any).user.userId;
            const filters = (req as any).validatedQuery || req.query;

            const result = await rentalRequestService.getTenantRentalRequests(tenantId, filters);

            res.status(200).json({
                success: true,
                data: result.rentalRequests,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rental-requests/landlord
     * Get all rental requests for landlord's properties
     */
    async getLandlordRentalRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const landlordId = (req as any).user.userId;
            const filters = (req as any).validatedQuery || req.query;

            const result = await rentalRequestService.getLandlordRentalRequests(landlordId, filters);

            res.status(200).json({
                success: true,
                data: result.rentalRequests,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rental-requests/:id
     * Get a single rental request by ID
     */
    async getRentalRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;

            const rentalRequest = await rentalRequestService.getRentalRequestById(id as string, userId);

            res.status(200).json({
                success: true,
                data: rentalRequest,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/rental-requests/:id/status
     * Update rental request status (landlord only — approve or decline)
     */
    async updateRentalRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const landlordId = (req as any).user.userId;
            const input: UpdateRentalRequestStatusInput = req.body;

            const rentalRequest = await rentalRequestService.updateRentalRequestStatus(
                id as string,
                landlordId,
                input
            );

            res.status(200).json({
                success: true,
                message: `Rental request ${input.status.toLowerCase()} successfully`,
                data: rentalRequest,
            });
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const rentalRequestController = new RentalRequestController();
export default rentalRequestController;
