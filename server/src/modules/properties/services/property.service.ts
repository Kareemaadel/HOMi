import { Op } from 'sequelize';
import {
    Property,
    PropertyImage,
    Amenity,
    PropertySpecifications,
    sequelize,
} from '../models/index.js';
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
    PropertySpecificationsResponse,
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
     * Create a new property with images, specifications, and optional amenities
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
                    monthly_price: input.monthly_price,
                    security_deposit: input.security_deposit,
                    address: input.address,
                    location_lat: input.location_lat,
                    location_long: input.location_long,
                    furnishing: input.furnishing,
                    availability_date: new Date(input.availability_date),
                    status: 'Draft',
                },
                { transaction }
            );

            // Create specifications
            const specifications = await PropertySpecifications.create(
                {
                    property_id: property.id,
                    bedrooms: input.specifications.bedrooms,
                    bathrooms: input.specifications.bathrooms,
                    floor: input.specifications.floor,
                    parking_spaces: input.specifications.parking_spaces,
                    area_sqft: input.specifications.area_sqft,
                    detailed_location: input.specifications.detailed_location,
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

            return this.formatPropertyResponse(property, images, amenities, specifications);
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
            furnishing,
            minPrice,
            maxPrice,
            landlordId,
            availabilityDate,
            page = 1,
            limit = 10,
        } = filters;

        const where: any = {};

        if (status) where.status = status;
        if (furnishing) where.furnishing = furnishing;
        if (landlordId) where.landlord_id = landlordId;
        if (availabilityDate) where.availability_date = availabilityDate;

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.monthly_price = {};
            if (minPrice !== undefined) where.monthly_price[Op.gte] = minPrice;
            if (maxPrice !== undefined) where.monthly_price[Op.lte] = maxPrice;
        }

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
                {
                    model: PropertySpecifications,
                    as: 'specifications',
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
                (property as any).amenities || [],
                (property as any).specifications ?? null
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
     * Get a single property by ID (includes amenities and specifications)
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
                {
                    model: PropertySpecifications,
                    as: 'specifications',
                },
            ],
        });

        if (!property) {
            throw new PropertyError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        return this.formatPropertyResponse(
            property,
            property.images || [],
            (property as any).amenities || [],
            (property as any).specifications ?? null
        );
    }

    /**
     * Update a property (including optional amenity/specifications update)
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
            if (input.monthly_price !== undefined) updateData.monthly_price = input.monthly_price;
            if (input.security_deposit !== undefined) updateData.security_deposit = input.security_deposit;
            if (input.address !== undefined) updateData.address = input.address;
            if (input.location_lat !== undefined) updateData.location_lat = input.location_lat;
            if (input.location_long !== undefined) updateData.location_long = input.location_long;
            if (input.furnishing !== undefined) updateData.furnishing = input.furnishing;
            if (input.status !== undefined) updateData.status = input.status;
            if (input.availability_date !== undefined)
                updateData.availability_date = new Date(input.availability_date);

            await property.update(updateData, { transaction });

            // Update specifications if provided (partial upsert)
            let specifications: PropertySpecifications | null = null;
            if (input.specifications !== undefined) {
                const [spec] = await PropertySpecifications.findOrCreate({
                    where: { property_id: id },
                    defaults: {
                        property_id: id,
                        bedrooms: 0,
                        bathrooms: 0,
                        floor: 0,
                        parking_spaces: 0,
                        area_sqft: 0,
                        detailed_location: '',
                    },
                    transaction,
                });
                await spec.update(input.specifications, { transaction });
                specifications = spec;
            } else {
                specifications = await PropertySpecifications.findOne({
                    where: { property_id: id },
                    transaction,
                });
            }

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
                amenities = await this.resolveAmenityNames(input.amenity_names);
                await (property as any).setAmenities(
                    amenities.map((a) => a.id),
                    { transaction }
                );
            } else {
                amenities = await (property as any).getAmenities({ transaction });
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images, amenities, specifications);
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
        amenities: Amenity[] = [],
        spec: PropertySpecifications | null = null
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

        const formattedSpec: PropertySpecificationsResponse | null = spec
            ? {
                id: spec.id,
                bedrooms: spec.bedrooms,
                bathrooms: spec.bathrooms,
                floor: spec.floor,
                parkingSpaces: spec.parking_spaces,
                areaSqft: Number(spec.area_sqft),
                detailedLocation: spec.detailed_location,
            }
            : null;

        return {
            id: property.id,
            landlordId: property.landlord_id,
            title: property.title,
            description: property.description,
            monthlyPrice: Number(property.monthly_price),
            securityDeposit: Number(property.security_deposit),
            address: property.address,
            locationLat: property.location_lat,
            locationLong: property.location_long,
            furnishing: property.furnishing,
            status: property.status,
            availabilityDate: property.availability_date,
            createdAt: property.created_at,
            images: formattedImages,
            amenities: formattedAmenities,
            specifications: formattedSpec,
        };
    }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
