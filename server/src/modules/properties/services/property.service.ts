import { Op } from 'sequelize';
import { Property, PropertyImage, sequelize } from '../models/index.js';
import { User } from '../../auth/models/User.js';
import type {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyQuery,
    PropertyResponse,
    PropertyListResponse,
    PropertySuccessResponse,
    PropertyImageResponse,
} from '../interfaces/property.interfaces.js';

/**
 * Custom error class for property errors
 */
export class PropertyError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code: string = 'PROPERTY_ERROR'
    ) {
        super(message);
        this.name = 'PropertyError';
    }
}

/**
 * Property Service
 * Handles all property business logic
 */
class PropertyService {
    /**
     * Create a new property with images
     */
    async createProperty(
        landlordId: string,
        input: CreatePropertyRequest
    ): Promise<PropertyResponse> {
        // Use transaction to ensure atomic creation
        const transaction = await sequelize.transaction();

        try {
            // Verify user exists and is a landlord
            const user = await User.findByPk(landlordId);
            if (!user) {
                throw new PropertyError('User not found', 404, 'USER_NOT_FOUND');
            }

            if (user.role !== 'LANDLORD') {
                throw new PropertyError(
                    'Only landlords can create properties',
                    403,
                    'FORBIDDEN'
                );
            }

            // Create property
            const property = await Property.create(
                {
                    landlord_id: landlordId,
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    address: input.address,
                    location_lat: input.location_lat,
                    location_long: input.location_long,
                    status: 'AVAILABLE',
                },
                { transaction }
            );

            // Create images
            const images = await PropertyImage.bulkCreate(
                input.images.map((img) => ({
                    property_id: property.id,
                    image_url: img.image_url,
                    is_main: img.is_main,
                })),
                { transaction }
            );

            await transaction.commit();

            // Return formatted response
            return this.formatPropertyResponse(property, images);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get all properties with optional filters and pagination
     */
    async getAllProperties(filters: PropertyQuery): Promise<PropertyListResponse> {
        const {
            status,
            minPrice,
            maxPrice,
            landlordId,
            page = 1,
            limit = 10,
        } = filters;

        // Build where clause
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price[Op.gte] = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price[Op.lte] = maxPrice;
            }
        }

        if (landlordId) {
            where.landlord_id = landlordId;
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Fetch properties with images
        const { count, rows: properties } = await Property.findAndCountAll({
            where,
            include: [
                {
                    model: PropertyImage,
                    as: 'images',
                    attributes: ['id', 'property_id', 'image_url', 'is_main'],
                },
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        // Format responses
        const formattedProperties = properties.map((property) =>
            this.formatPropertyResponse(property, property.images || [])
        );

        return {
            properties: formattedProperties,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Get a single property by ID
     */
    async getPropertyById(id: string): Promise<PropertyResponse> {
        const property = await Property.findByPk(id, {
            include: [
                {
                    model: PropertyImage,
                    as: 'images',
                    attributes: ['id', 'property_id', 'image_url', 'is_main'],
                },
            ],
        });

        if (!property) {
            throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        return this.formatPropertyResponse(property, property.images || []);
    }

    /**
     * Update a property
     * Verifies ownership before updating
     */
    async updateProperty(
        id: string,
        landlordId: string,
        input: UpdatePropertyRequest
    ): Promise<PropertyResponse> {
        const transaction = await sequelize.transaction();

        try {
            // Find property
            const property = await Property.findByPk(id, { transaction });

            if (!property) {
                throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
            }

            // Verify ownership
            if (property.landlord_id !== landlordId) {
                throw new PropertyError(
                    'You do not have permission to update this property',
                    403,
                    'FORBIDDEN'
                );
            }

            // Update property fields
            const updateData: any = {};
            if (input.title !== undefined) updateData.title = input.title;
            if (input.description !== undefined) updateData.description = input.description;
            if (input.price !== undefined) updateData.price = input.price;
            if (input.address !== undefined) updateData.address = input.address;
            if (input.location_lat !== undefined) updateData.location_lat = input.location_lat;
            if (input.location_long !== undefined) updateData.location_long = input.location_long;
            if (input.status !== undefined) updateData.status = input.status;

            await property.update(updateData, { transaction });

            // Update images if provided
            let images = property.images || [];
            if (input.images !== undefined) {
                // Delete existing images
                await PropertyImage.destroy({
                    where: { property_id: id },
                    transaction,
                });

                // Create new images
                images = await PropertyImage.bulkCreate(
                    input.images.map((img) => ({
                        property_id: id,
                        image_url: img.image_url,
                        is_main: img.is_main,
                    })),
                    { transaction }
                );
            } else {
                // Fetch existing images if not updating
                images = await PropertyImage.findAll({
                    where: { property_id: id },
                    transaction,
                });
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a property (soft delete)
     * Verifies ownership before deleting
     */
    async deleteProperty(
        id: string,
        landlordId: string
    ): Promise<PropertySuccessResponse> {
        // Find property
        const property = await Property.findByPk(id);

        if (!property) {
            throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        // Verify ownership
        if (property.landlord_id !== landlordId) {
            throw new PropertyError(
                'You do not have permission to delete this property',
                403,
                'FORBIDDEN'
            );
        }

        // Soft delete (paranoid mode)
        await property.destroy();

        return {
            success: true,
            message: 'Property deleted successfully',
        };
    }

    /**
     * Helper method to format property response
     */
    private formatPropertyResponse(
        property: Property,
        images: PropertyImage[]
    ): PropertyResponse {
        const formattedImages: PropertyImageResponse[] = images.map((img) => ({
            id: img.id,
            propertyId: img.property_id,
            imageUrl: img.image_url,
            isMain: img.is_main,
        }));

        return {
            id: property.id,
            landlordId: property.landlord_id,
            title: property.title,
            description: property.description,
            price: Number(property.price),
            address: property.address,
            locationLat: property.location_lat,
            locationLong: property.location_long,
            status: property.status,
            createdAt: property.created_at,
            images: formattedImages,
        };
    }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
