import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Op } from 'sequelize';
import {
    sequelize,
    Property,
    PropertyImage,
    Amenity,
    PropertySpecifications,
    PropertyDetailedLocation,
    HouseRule,
} from '../models/index.js';
import { User } from '../../auth/models/User.js';
import { propertyService, PropertyError } from './property.service.js';
import type {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyQuery,
} from '../interfaces/property.interfaces.js';

// ─── Helpers / shared mocks ─────────────────────────────────────────────────────

let mockTransaction: { commit: ReturnType<typeof vi.fn>; rollback: ReturnType<typeof vi.fn> };

function createMockProperty(overrides: Record<string, unknown> = {}) {
    return {
        id: 'property-1',
        landlord_id: 'landlord-1',
        title: 'Test Property',
        description: 'Nice place',
        monthly_price: 1500,
        security_deposit: 1500,
        address: '123 Test St',
        type: 'APARTMENT',
        furnishing: 'FURNISHED',
        status: 'Draft',
        target_tenant: 'ANY',
        availability_date: new Date('2025-01-01'),
        created_at: new Date('2025-01-01'),
        images: [],
        setAmenities: vi.fn(),
        setHouseRules: vi.fn(),
        getAmenities: vi.fn().mockResolvedValue([]),
        getHouseRules: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        destroy: vi.fn(),
        ...overrides,
    };
}

function createMockAmenity(id: string, name: string) {
    return { id, name };
}

function createMockHouseRule(id: string, name: string) {
    return { id, name };
}

function createMockImage(id: string, propertyId: string, url: string, isMain = false) {
    return {
        id,
        property_id: propertyId,
        image_url: url,
        is_main: isMain,
    };
}

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('PropertyService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Fresh transaction mock for each test
        mockTransaction = {
            commit: vi.fn(),
            rollback: vi.fn(),
        };

        // Stub out all DB-touching methods
        (sequelize as any).transaction = vi.fn().mockResolvedValue(mockTransaction);

        (User as any).findByPk = vi.fn();

        (Property as any).create = vi.fn();
        (Property as any).findByPk = vi.fn();
        (Property as any).findAndCountAll = vi.fn();

        (Amenity as any).findAll = vi.fn();
        (HouseRule as any).findAll = vi.fn();

        (PropertySpecifications as any).create = vi.fn();
        (PropertySpecifications as any).findOrCreate = vi.fn();
        (PropertySpecifications as any).findOne = vi.fn();

        (PropertyDetailedLocation as any).create = vi.fn();
        (PropertyDetailedLocation as any).findOrCreate = vi.fn();
        (PropertyDetailedLocation as any).findOne = vi.fn();

        (PropertyImage as any).bulkCreate = vi.fn();
        (PropertyImage as any).destroy = vi.fn();
        (PropertyImage as any).findAll = vi.fn();
    });

    it('should be defined', () => {
        expect(propertyService).toBeDefined();
    });

    // ── createProperty ─────────────────────────────────────────────────────────
    describe('createProperty', () => {
        it('throws when user is not found', async () => {
            (User as any).findByPk.mockResolvedValue(null);

            const input: CreatePropertyRequest = {
                title: 'Test',
                description: 'Test',
                monthly_price: 1000,
                security_deposit: 500,
                address: '123 St',
                furnishing: 'Fully',
                availability_date: '2025-01-01',
                amenity_names: [],
                house_rule_names: [],
                specifications: {
                    bedrooms: 1,
                    bathrooms: 1,
                    area_sqft: 500,
                },
                detailed_location: {
                    floor: 1,
                    city: 'City',
                    area: 'Area',
                    street_name: 'Street',
                    building_number: '1A',
                    unit_apt: '1',
                    location_lat: 0,
                    location_long: 0,
                },
                images: [
                    {
                        image_url: 'http://example.com/image.jpg',
                        is_main: true,
                    },
                ],
            };

            await expect(
                propertyService.createProperty('missing-user', input),
            ).rejects.toBeInstanceOf(PropertyError);

            await expect(
                propertyService.createProperty('missing-user', input),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
            });

            expect(sequelize.transaction).toHaveBeenCalled();
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(Property.create).not.toHaveBeenCalled();
        });

        it('throws when user is not a landlord', async () => {
            (User as any).findByPk.mockResolvedValue({
                id: 'user-1',
                role: 'TENANT',
            });

            const input: CreatePropertyRequest = {
                title: 'Test',
                description: 'Test',
                monthly_price: 1000,
                security_deposit: 500,
                address: '123 St',
                furnishing: 'Fully',
                availability_date: '2025-01-01',
                amenity_names: [],
                house_rule_names: [],
                specifications: {
                    bedrooms: 1,
                    bathrooms: 1,
                    area_sqft: 500,
                },
                detailed_location: {
                    floor: 1,
                    city: 'City',
                    area: 'Area',
                    street_name: 'Street',
                    building_number: '1A',
                    unit_apt: '1',
                    location_lat: 0,
                    location_long: 0,
                },
                images: [],
            };

            await expect(
                propertyService.createProperty('user-1', input),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: 'FORBIDDEN',
            });

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(Property.create).not.toHaveBeenCalled();
        });

        it('throws when amenity names are invalid', async () => {
            (User as any).findByPk.mockResolvedValue({
                id: 'landlord-1',
                role: 'LANDLORD',
            });

            // Two requested names but only one returned → triggers INVALID_AMENITY_NAMES
            (Amenity as any).findAll.mockResolvedValue([createMockAmenity('a1', 'Wifi')]);

            const input: CreatePropertyRequest = {
                title: 'Test',
                description: 'Test',
                monthly_price: 1000,
                security_deposit: 500,
                address: '123 St',
                furnishing: 'Fully',
                availability_date: '2025-01-01',
                amenity_names: ['Wifi', 'Parking'],
                house_rule_names: [],
                specifications: {
                    bedrooms: 1,
                    bathrooms: 1,
                    area_sqft: 500,
                },
                detailed_location: {
                    floor: 1,
                    city: 'City',
                    area: 'Area',
                    street_name: 'Street',
                    building_number: '1A',
                    unit_apt: '1',
                    location_lat: 0,
                    location_long: 0,
                },
                images: [],
            };

            await expect(
                propertyService.createProperty('landlord-1', input),
            ).rejects.toMatchObject({
                statusCode: 400,
                code: 'INVALID_AMENITY_NAMES',
            });

            expect(Property.create).not.toHaveBeenCalled();
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('succeeds and returns formatted response', async () => {
            const landlordId = 'landlord-1';

            (User as any).findByPk.mockResolvedValue({
                id: landlordId,
                role: 'LANDLORD',
            });

            const amenities = [
                createMockAmenity('a1', 'Wifi'),
                createMockAmenity('a2', 'Parking'),
            ];
            const houseRules = [
                createMockHouseRule('h1', 'No smoking'),
            ];

            (Amenity as any).findAll.mockResolvedValue(amenities);
            (HouseRule as any).findAll.mockResolvedValue(houseRules);

            const mockProperty = createMockProperty({
                landlord_id: landlordId,
            });

            const images = [
                createMockImage('img-1', mockProperty.id, 'http://example.com/1.jpg', true),
            ];

            (Property as any).create.mockResolvedValue(mockProperty);
            (PropertySpecifications as any).create.mockResolvedValue({
                id: 'spec-1',
                bedrooms: 2,
                bathrooms: 1,
                area_sqft: 800,
            });
            (PropertyDetailedLocation as any).create.mockResolvedValue({
                id: 'loc-1',
                floor: 1,
                city: 'City',
                area: 'Area',
                street_name: 'Street',
                building_number: '1A',
                unit_apt: '1',
                location_lat: 0,
                location_long: 0,
            });
            (PropertyImage as any).bulkCreate.mockResolvedValue(images);

            const input: CreatePropertyRequest = {
                title: 'Test Property',
                description: 'Nice place',
                monthly_price: 1500,
                security_deposit: 1500,
                address: '123 Test St',
                type: 'APARTMENT',
                furnishing: 'Fully',
                target_tenant: 'ANY',
                availability_date: '2025-01-01',
                amenity_names: amenities.map((a) => a.name),
                house_rule_names: houseRules.map((h) => h.name),
                specifications: {
                    bedrooms: 2,
                    bathrooms: 1,
                    area_sqft: 800,
                },
                detailed_location: {
                    floor: 1,
                    city: 'City',
                    area: 'Area',
                    street_name: 'Street',
                    building_number: '1A',
                    unit_apt: '1',
                    location_lat: 0,
                    location_long: 0,
                },
                images: [
                    {
                        image_url: 'http://example.com/1.jpg',
                        is_main: true,
                    },
                ],
            };

            const result = await propertyService.createProperty(landlordId, input);

            expect(sequelize.transaction).toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(mockTransaction.rollback).not.toHaveBeenCalled();

            expect(Property.create).toHaveBeenCalled();
            expect(mockProperty.setAmenities).toHaveBeenCalledWith(
                amenities.map((a) => a.id),
                expect.any(Object),
            );
            expect(mockProperty.setHouseRules).toHaveBeenCalledWith(
                houseRules.map((h) => h.id),
                expect.any(Object),
            );

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockProperty.id,
                    landlordId,
                    title: input.title,
                    images: [
                        expect.objectContaining({
                            imageUrl: 'http://example.com/1.jpg',
                            isMain: true,
                        }),
                    ],
                    amenities: amenities.map((a) =>
                        expect.objectContaining({ id: a.id, name: a.name }),
                    ),
                    houseRules: houseRules.map((h) =>
                        expect.objectContaining({ id: h.id, name: h.name }),
                    ),
                }),
            );
        });
    });

    // ── getPropertyById ─────────────────────────────────────────────────────────
    describe('getPropertyById', () => {
        it('throws when property is not found', async () => {
            (Property as any).findByPk.mockResolvedValue(null);

            await expect(
                propertyService.getPropertyById('missing-id'),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: 'PROPERTY_NOT_FOUND',
            });
        });

        it('returns formatted property when found', async () => {
            const property = createMockProperty({
                images: [createMockImage('img-1', 'property-1', 'http://example.com/1.jpg', true)],
                amenities: [createMockAmenity('a1', 'Wifi')],
                houseRules: [createMockHouseRule('h1', 'No pets')],
                specifications: {
                    id: 'spec-1',
                    bedrooms: 2,
                    bathrooms: 1,
                    area_sqft: 800,
                },
                detailedLocation: {
                    id: 'loc-1',
                    floor: 1,
                    city: 'City',
                    area: 'Area',
                    street_name: 'Street',
                    building_number: '1A',
                    unit_apt: '1',
                    location_lat: 0,
                    location_long: 0,
                },
            });

            (Property as any).findByPk.mockResolvedValue(property as any);

            const result = await propertyService.getPropertyById('property-1');

            expect(result).toEqual(
                expect.objectContaining({
                    id: property.id,
                    landlordId: property.landlord_id,
                    images: [
                        expect.objectContaining({
                            imageUrl: 'http://example.com/1.jpg',
                            isMain: true,
                        }),
                    ],
                    amenities: [
                        expect.objectContaining({ id: 'a1', name: 'Wifi' }),
                    ],
                    houseRules: [
                        expect.objectContaining({ id: 'h1', name: 'No pets' }),
                    ],
                    specifications: expect.objectContaining({
                        bedrooms: 2,
                        bathrooms: 1,
                        areaSqft: 800,
                    }),
                    detailedLocation: expect.objectContaining({
                        city: 'City',
                        streetName: 'Street',
                    }),
                }),
            );
        });

    });

    // ── getAllProperties ────────────────────────────────────────────────────────
    describe('getAllProperties', () => {
        it('applies filters and pagination', async () => {
            const property = createMockProperty();

            (Property as any).findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [
                    {
                        ...property,
                        images: [createMockImage('img-1', property.id, 'http://example.com/1.jpg', true)],
                        amenities: [createMockAmenity('a1', 'Wifi')],
                        houseRules: [createMockHouseRule('h1', 'No pets')],
                        specifications: {
                            id: 'spec-1',
                            bedrooms: 2,
                            bathrooms: 1,
                            area_sqft: 800,
                        },
                        detailedLocation: {
                            id: 'loc-1',
                            floor: 1,
                            city: 'City',
                            area: 'Area',
                            street_name: 'Street',
                            building_number: '1A',
                            unit_apt: '1',
                            location_lat: 0,
                            location_long: 0,
                        },
                    },
                ],
            });

            const filters: any = {
                status: 'ACTIVE',
                type: 'APARTMENT',
                furnishing: 'FURNISHED',
                target_tenant: 'ANY',
                landlordId: 'landlord-1',
                minPrice: 1000,
                maxPrice: 2000,
                availabilityDate: '2025-01-01',
                page: 2,
                limit: 5,
            };

            const result = await propertyService.getAllProperties(filters as PropertyQuery);

            expect(Property.findAndCountAll).toHaveBeenCalled();
            const args = (Property.findAndCountAll as any).mock.calls[0][0];

            expect(args.limit).toBe(5);
            expect(args.offset).toBe(5); // (page - 1) * limit
            expect(args.where.status).toBe(filters.status);
            expect(args.where.type).toBe(filters.type);
            expect(args.where.furnishing).toBe(filters.furnishing);
            expect(args.where.target_tenant).toBe(filters.target_tenant);
            expect(args.where.landlord_id).toBe(filters.landlordId);
            expect(args.where.availability_date).toBe(filters.availabilityDate);
            expect(args.where.monthly_price[Op.gte]).toBe(filters.minPrice);
            expect(args.where.monthly_price[Op.lte]).toBe(filters.maxPrice);

            expect(result.pagination).toEqual(
                expect.objectContaining({
                    total: 1,
                    page: 2,
                    limit: 5,
                    totalPages: 1,
                }),
            );

            expect(result.properties[0]).toEqual(
                expect.objectContaining({
                    id: property.id,
                }),
            );
        });
    });

    // ── updateProperty ─────────────────────────────────────────────────────────
    describe('updateProperty', () => {
        it('throws when property is not found', async () => {
            (Property as any).findByPk.mockResolvedValue(null);

            await expect(
                propertyService.updateProperty('missing-id', 'landlord-1', {} as UpdatePropertyRequest),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: 'PROPERTY_NOT_FOUND',
            });
        });

        it('throws when landlord does not own property', async () => {
            const property = createMockProperty({ landlord_id: 'another-landlord' });
            (Property as any).findByPk.mockResolvedValue(property as any);

            await expect(
                propertyService.updateProperty('property-1', 'landlord-1', {} as UpdatePropertyRequest),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: 'FORBIDDEN',
            });
        });

        it('updates fields and commits transaction', async () => {
            const property = createMockProperty({ landlord_id: 'landlord-1' });
            (Property as any).findByPk.mockResolvedValue(property as any);

            (PropertySpecifications as any).findOne.mockResolvedValue(null);
            (PropertyDetailedLocation as any).findOne.mockResolvedValue(null);
            (PropertyImage as any).findAll.mockResolvedValue([]);

            const input: UpdatePropertyRequest = {
                title: 'Updated Title',
                description: 'Updated desc',
            };

            const result = await propertyService.updateProperty(
                'property-1',
                'landlord-1',
                input,
            );

            expect(property.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Updated Title',
                    description: 'Updated desc',
                }),
                expect.any(Object),
            );

            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(result.title).toBe('Updated Title');
        });
    });

    // ── deleteProperty ─────────────────────────────────────────────────────────
    describe('deleteProperty', () => {
        it('throws when property is not found', async () => {
            (Property as any).findByPk.mockResolvedValue(null);

            await expect(
                propertyService.deleteProperty('missing-id', 'landlord-1'),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: 'PROPERTY_NOT_FOUND',
            });
        });

        it('throws when landlord does not own property', async () => {
            const property = createMockProperty({ landlord_id: 'another-landlord' });
            (Property as any).findByPk.mockResolvedValue(property as any);

            await expect(
                propertyService.deleteProperty('property-1', 'landlord-1'),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: 'FORBIDDEN',
            });

            expect(property.destroy).not.toHaveBeenCalled();
        });

        it('destroys property and returns success', async () => {
            const property = createMockProperty({ landlord_id: 'landlord-1' });
            (Property as any).findByPk.mockResolvedValue(property as any);

            const result = await propertyService.deleteProperty('property-1', 'landlord-1');

            expect(property.destroy).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                message: 'Property deleted successfully',
            });
        });
    });
});