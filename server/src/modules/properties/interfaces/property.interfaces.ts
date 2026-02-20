import type { PropertyStatusType, FurnishingStatusType } from '../models/Property.js';

/**
 * Property Image Input DTO
 */
export interface PropertyImageInput {
    image_url: string;
    is_main: boolean;
}

/**
 * Amenity Response DTO
 */
export interface AmenityResponse {
    id: string;
    name: string;
}

/**
 * Property Specifications Input DTO
 */
export interface PropertySpecificationsInput {
    bedrooms: number;
    bathrooms: number;
    floor: number;
    parking_spaces: number;
    area_sqft: number;
    detailed_location: string;
}

/**
 * Property Specifications Response DTO
 */
export interface PropertySpecificationsResponse {
    id: string;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    parkingSpaces: number;
    areaSqft: number;
    detailedLocation: string;
}

/**
 * Create Property Request DTO
 */
export interface CreatePropertyRequest {
    title: string;
    description: string;
    monthly_price: number;
    security_deposit: number;
    address: string;
    location_lat: number;
    location_long: number;
    furnishing: FurnishingStatusType;
    availability_date: string; // ISO date string (YYYY-MM-DD)
    images: PropertyImageInput[];
    amenity_names?: string[];
    specifications: PropertySpecificationsInput;
}

/**
 * Update Property Request DTO
 * All fields are optional
 */
export interface UpdatePropertyRequest {
    title?: string;
    description?: string;
    monthly_price?: number;
    security_deposit?: number;
    address?: string;
    location_lat?: number;
    location_long?: number;
    furnishing?: FurnishingStatusType;
    status?: PropertyStatusType;
    availability_date?: string;
    images?: PropertyImageInput[];
    amenity_names?: string[];
    specifications?: Partial<PropertySpecificationsInput>;
}

/**
 * Property Query/Filter Parameters
 */
export interface PropertyQuery {
    status?: PropertyStatusType;
    furnishing?: FurnishingStatusType;
    minPrice?: number;
    maxPrice?: number;
    landlordId?: string;
    availabilityDate?: string;
    page?: number;
    limit?: number;
}

/**
 * Property Image Response DTO
 */
export interface PropertyImageResponse {
    id: string;
    propertyId: string;
    imageUrl: string;
    isMain: boolean;
}

/**
 * Property Response DTO
 */
export interface PropertyResponse {
    id: string;
    landlordId: string;
    title: string;
    description: string;
    monthlyPrice: number;
    securityDeposit: number;
    address: string;
    locationLat: number;
    locationLong: number;
    furnishing: FurnishingStatusType;
    status: PropertyStatusType;
    availabilityDate: Date | string;
    createdAt: Date;
    images: PropertyImageResponse[];
    amenities: AmenityResponse[];
    specifications: PropertySpecificationsResponse | null;
}

/**
 * Property List Response DTO with pagination
 */
export interface PropertyListResponse {
    properties: PropertyResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Property Success Response
 */
export interface PropertySuccessResponse {
    success: boolean;
    message: string;
}
