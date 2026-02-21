import { Op } from 'sequelize';
import {
    Property,
    PropertyImage,
    Amenity,
    PropertySpecifications,
    PropertyDetailedLocation,
    HouseRule,
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
    HouseRuleResponse,
    PropertySpecificationsResponse,
    PropertyDetailedLocationResponse,
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
     * Resolve house rule names → verified HouseRule records.
     * Throws if any name does not exist in the database.
     */
    private async resolveHouseRuleNames(names: string[]): Promise<HouseRule[]> {
        if (names.length === 0) return [];

        const found = await HouseRule.findAll({ where: { name: names } });

        if (found.length !== names.length) {
            const foundNames = found.map((h) => h.name);
            const invalid = names.filter((n) => !foundNames.includes(n));
            throw new PropertyError(
                `Invalid house rule name(s): ${invalid.join(', ')}. Please select from the available list.`,
                400,
                'INVALID_HOUSE_RULE_NAMES'
            );
        }

        return found;
    }

    /**
     * Create a new property with images, specifications, detailed location, and optional amenities/house rules
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

            // Resolve house rule names outside transaction so errors surface early
            const houseRuleNames = input.house_rule_names ?? [];
            const houseRules = await this.resolveHouseRuleNames(houseRuleNames);

            // Create property
            const property = await Property.create(
                {
                    landlord_id: landlordId,
                    title: input.title,
                    description: input.description,
                    monthly_price: input.monthly_price,
                    security_deposit: input.security_deposit,
                    address: input.address,
                    type: input.type ?? null,
                    furnishing: input.furnishing,
                    target_tenant: input.target_tenant ?? 'ANY',
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
                    area_sqft: input.specifications.area_sqft,
                },
                { transaction }
            );

            // Create detailed location
            const detailedLocation = await PropertyDetailedLocation.create(
                {
                    property_id: property.id,
                    floor: input.detailed_location.floor,
                    city: input.detailed_location.city,
                    area: input.detailed_location.area,
                    street_name: input.detailed_location.street_name,
                    building_number: input.detailed_location.building_number,
                    unit_apt: input.detailed_location.unit_apt,
                    location_lat: input.detailed_location.location_lat,
                    location_long: input.detailed_location.location_long,
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

            // Associate house rules (by their resolved IDs)
            if (houseRules.length > 0) {
                await (property as any).setHouseRules(
                    houseRules.map((h) => h.id),
                    { transaction }
                );
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images, amenities, houseRules, specifications, detailedLocation);
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
            type,
            furnishing,
            target_tenant,
            minPrice,
            maxPrice,
            landlordId,
            availabilityDate,
            page = 1,
            limit = 10,
        } = filters;

        const where: any = {};

        if (status) where.status = status;
        if (type) where.type = type;
        if (furnishing) where.furnishing = furnishing;
        if (target_tenant) where.target_tenant = target_tenant;
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
                    model: HouseRule,
                    as: 'houseRules',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
                {
                    model: PropertySpecifications,
                    as: 'specifications',
                },
                {
                    model: PropertyDetailedLocation,
                    as: 'detailedLocation',
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
                (property as any).houseRules || [],
                (property as any).specifications ?? null,
                (property as any).detailedLocation ?? null
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
     * Get a single property by ID (includes amenities, house rules, specifications, and detailed location)
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
                    model: HouseRule,
                    as: 'houseRules',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
                {
                    model: PropertySpecifications,
                    as: 'specifications',
                },
                {
                    model: PropertyDetailedLocation,
                    as: 'detailedLocation',
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
            (property as any).houseRules || [],
            (property as any).specifications ?? null,
            (property as any).detailedLocation ?? null
        );
    }

    /**
     * Update a property (including optional amenity/house-rule/specifications/detailed-location update)
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
            if (input.type !== undefined) updateData.type = input.type;
            if (input.furnishing !== undefined) updateData.furnishing = input.furnishing;
            if (input.status !== undefined) updateData.status = input.status;
            if (input.target_tenant !== undefined) updateData.target_tenant = input.target_tenant;
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
                        area_sqft: 0,
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

            // Update detailed location if provided (partial upsert)
            let detailedLocation: PropertyDetailedLocation | null = null;
            if (input.detailed_location !== undefined) {
                const [loc] = await PropertyDetailedLocation.findOrCreate({
                    where: { property_id: id },
                    defaults: {
                        property_id: id,
                        floor: 0,
                        city: '',
                        area: '',
                        street_name: '',
                        building_number: '',
                        unit_apt: '',
                        location_lat: 0,
                        location_long: 0,
                    },
                    transaction,
                });
                await loc.update(input.detailed_location, { transaction });
                detailedLocation = loc;
            } else {
                detailedLocation = await PropertyDetailedLocation.findOne({
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

            // Update house rules if provided (by name — replace strategy)
            let houseRules: HouseRule[] = [];
            if (input.house_rule_names !== undefined) {
                houseRules = await this.resolveHouseRuleNames(input.house_rule_names);
                await (property as any).setHouseRules(
                    houseRules.map((h) => h.id),
                    { transaction }
                );
            } else {
                houseRules = await (property as any).getHouseRules({ transaction });
            }

            await transaction.commit();

            return this.formatPropertyResponse(property, images, amenities, houseRules, specifications, detailedLocation);
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
        houseRules: HouseRule[] = [],
        spec: PropertySpecifications | null = null,
        loc: PropertyDetailedLocation | null = null
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

        const formattedHouseRules: HouseRuleResponse[] = houseRules.map((h) => ({
            id: h.id,
            name: h.name,
        }));

        const formattedSpec: PropertySpecificationsResponse | null = spec
            ? {
                id: spec.id,
                bedrooms: spec.bedrooms,
                bathrooms: spec.bathrooms,
                areaSqft: Number(spec.area_sqft),
            }
            : null;

        const formattedLocation: PropertyDetailedLocationResponse | null = loc
            ? {
                id: loc.id,
                floor: loc.floor,
                city: loc.city,
                area: loc.area,
                streetName: loc.street_name,
                buildingNumber: loc.building_number,
                unitApt: loc.unit_apt,
                locationLat: loc.location_lat,
                locationLong: loc.location_long,
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
            type: property.type ?? null,
            furnishing: property.furnishing,
            status: property.status,
            targetTenant: property.target_tenant ?? 'ANY',
            availabilityDate: property.availability_date,
            createdAt: property.created_at,
            images: formattedImages,
            amenities: formattedAmenities,
            houseRules: formattedHouseRules,
            specifications: formattedSpec,
            detailedLocation: formattedLocation,
        };
    }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
