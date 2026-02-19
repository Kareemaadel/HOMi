import { Op } from 'sequelize';
import { Property, PropertyImage, Amenity, sequelize } from '../models/index.js';
import { User } from '../../auth/models/User.js';
import type {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyQuery,
    PropertyResponse,
    PropertyListResponse,
    PropertySuccessResponse,
    PropertyImageResponse,
    AmenityResponse,
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
     * Resolve amenity names → verified Amenity records.
     * Throws if any name does not exist in the database.
     */
    private async resolveAmenityNames(names: string[]): Promise<Amenity[]> {
        if (names.length === 0) return [];

        const found = await Amenity.findAll({ where: { name: names } });

        if (found.length !== names.length) {
            const foundNames = found.map((a) => a.name);
            const invalid = names.filter((n) => !foundNames.includes(n));
            throw new PropertyError(
                `Invalid amenity name(s): ${invalid.join(', ')}. Please select from the available list.`,
                400,
                'INVALID_AMENITY_NAMES'
            );
        }

        return found;
    }

    /**
     * Create a new property with images and optional amenities
     */
    async createProperty(
        landlordId: string,
        input: CreatePropertyRequest
    ): Promise<PropertyResponse> {
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

            // Resolve amenity names outside transaction so errors surface early
            const amenityNames = input.amenity_names ?? [];
            const amenities = await this.resolveAmenityNames(amenityNames);

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

            // Associate amenities (by their resolved IDs)
            if (amenities.length > 0) {
                await (property as any).setAmenities(
                    amenities.map((a) => a.id),
                    { transaction }
                );
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images, amenities);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get all properties with optional filters, pagination, and amenities
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

        const where: any = {};

        if (status) where.status = status;

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price[Op.gte] = minPrice;
            if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
        }

        if (landlordId) where.landlord_id = landlordId;

        const offset = (page - 1) * limit;

        const { count, rows: properties } = await Property.findAndCountAll({
            where,
            include: [
                {
                    model: PropertyImage,
                    as: 'images',
                    attributes: ['id', 'property_id', 'image_url', 'is_main'],
                },
                {
                    model: Amenity,
                    as: 'amenities',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
            distinct: true,
        });

        const formattedProperties = properties.map((property) =>
            this.formatPropertyResponse(
                property,
                property.images || [],
                (property as any).amenities || []
            )
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
     * Get a single property by ID (includes amenities)
     */
    async getPropertyById(id: string): Promise<PropertyResponse> {
        const property = await Property.findByPk(id, {
            include: [
                {
                    model: PropertyImage,
                    as: 'images',
                    attributes: ['id', 'property_id', 'image_url', 'is_main'],
                },
                {
                    model: Amenity,
                    as: 'amenities',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!property) {
            throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        return this.formatPropertyResponse(
            property,
            property.images || [],
            (property as any).amenities || []
        );
    }

    /**
     * Update a property (including optional amenity update using names)
     * Verifies ownership before updating
     */
    async updateProperty(
        id: string,
        landlordId: string,
        input: UpdatePropertyRequest
    ): Promise<PropertyResponse> {
        const transaction = await sequelize.transaction();

        try {
            const property = await Property.findByPk(id, { transaction });

            if (!property) {
                throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
            }

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
                await PropertyImage.destroy({ where: { property_id: id }, transaction });
                images = await PropertyImage.bulkCreate(
                    input.images.map((img) => ({
                        property_id: id,
                        image_url: img.image_url,
                        is_main: img.is_main,
                    })),
                    { transaction }
                );
            } else {
                images = await PropertyImage.findAll({ where: { property_id: id }, transaction });
            }

            // Update amenities if provided (by name — replace strategy)
            let amenities: Amenity[] = [];
            if (input.amenity_names !== undefined) {
                // Validates names exist; throws on invalid
                amenities = await this.resolveAmenityNames(input.amenity_names);
                await (property as any).setAmenities(
                    amenities.map((a) => a.id),
                    { transaction }
                );
            } else {
                // Keep existing amenities
                amenities = await (property as any).getAmenities({ transaction });
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images, amenities);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a property (soft delete)
     */
    async deleteProperty(
        id: string,
        landlordId: string
    ): Promise<PropertySuccessResponse> {
        const property = await Property.findByPk(id);

        if (!property) {
            throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        if (property.landlord_id !== landlordId) {
            throw new PropertyError(
                'You do not have permission to delete this property',
                403,
                'FORBIDDEN'
            );
        }

        await property.destroy();

        return { success: true, message: 'Property deleted successfully' };
    }

    /**
     * Helper method to format property response
     */
    private formatPropertyResponse(
        property: Property,
        images: PropertyImage[],
        amenities: Amenity[] = []
    ): PropertyResponse {
        const formattedImages: PropertyImageResponse[] = images.map((img) => ({
            id: img.id,
            propertyId: img.property_id,
            imageUrl: img.image_url,
            isMain: img.is_main,
        }));

        const formattedAmenities: AmenityResponse[] = amenities.map((a) => ({
            id: a.id,
            name: a.name,
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
            amenities: formattedAmenities,
        };
    }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
