import { Property } from '../../properties/models/Property.js';
import { SavedProperty } from '../models/SavedProperty.js';
import { propertyService } from '../../properties/services/property.service.js';

export class SavedPropertiesError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code: string = 'SAVED_PROPERTIES_ERROR'
    ) {
        super(message);
        this.name = 'SavedPropertiesError';
    }
}

class SavedPropertiesService {
    private isUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    async getMySavedPropertyIds(userId: string): Promise<string[]> {
        const rows = await SavedProperty.findAll({
            where: { user_id: userId },
            attributes: ['property_id'],
            order: [['created_at', 'DESC']],
        });

        return rows.map((row) => row.property_id);
    }

    async getMySavedProperties(userId: string) {
        const rows = await SavedProperty.findAll({
            where: { user_id: userId },
            attributes: ['property_id'],
            order: [['created_at', 'DESC']],
        });

        if (rows.length === 0) return [];

        const propertyIds = rows.map((row) => row.property_id);

        const properties = await Promise.all(
            propertyIds.map(async (propertyId) => {
                try {
                    return await propertyService.getPropertyById(propertyId);
                } catch {
                    return null;
                }
            })
        );

        return properties.filter((property): property is NonNullable<typeof property> => property !== null);
    }

    async saveProperty(userId: string, propertyId: string): Promise<void> {
        if (!this.isUuid(propertyId)) {
            throw new SavedPropertiesError('Invalid property id', 400, 'INVALID_PROPERTY_ID');
        }

        const property = await Property.findByPk(propertyId);
        if (!property) {
            throw new SavedPropertiesError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        const existing = await SavedProperty.findOne({
            where: { user_id: userId, property_id: propertyId },
        });

        if (existing) return;

        await SavedProperty.create({
            user_id: userId,
            property_id: propertyId,
        });
    }

    async removeSavedProperty(userId: string, propertyId: string): Promise<void> {
        if (!this.isUuid(propertyId)) {
            throw new SavedPropertiesError('Invalid property id', 400, 'INVALID_PROPERTY_ID');
        }

        await SavedProperty.destroy({
            where: { user_id: userId, property_id: propertyId },
        });
    }

    async clearMySavedProperties(userId: string): Promise<void> {
        await SavedProperty.destroy({
            where: { user_id: userId },
        });
    }
}

export const savedPropertiesService = new SavedPropertiesService();
export default savedPropertiesService;
