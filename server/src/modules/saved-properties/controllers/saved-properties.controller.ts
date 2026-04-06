import type { Request, Response, NextFunction } from 'express';
import { savedPropertiesService } from '../services/saved-properties.service.js';

class SavedPropertiesController {
    async getMySavedPropertyIds(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const ids = await savedPropertiesService.getMySavedPropertyIds(userId);

            res.status(200).json({
                success: true,
                data: ids,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMySavedProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const properties = await savedPropertiesService.getMySavedProperties(userId);

            res.status(200).json({
                success: true,
                data: properties,
            });
        } catch (error) {
            next(error);
        }
    }

    async saveProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { propertyId } = req.params;

            await savedPropertiesService.saveProperty(userId, propertyId as string);

            res.status(201).json({
                success: true,
                message: 'Property saved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async removeSavedProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            const { propertyId } = req.params;

            await savedPropertiesService.removeSavedProperty(userId, propertyId as string);

            res.status(200).json({
                success: true,
                message: 'Property removed from saved list',
            });
        } catch (error) {
            next(error);
        }
    }

    async clearSavedProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.userId as string;
            await savedPropertiesService.clearMySavedProperties(userId);

            res.status(200).json({
                success: true,
                message: 'Saved properties cleared',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const savedPropertiesController = new SavedPropertiesController();
export default savedPropertiesController;
