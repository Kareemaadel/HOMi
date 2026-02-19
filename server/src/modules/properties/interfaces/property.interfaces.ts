import type { PropertyStatusType } from '../models/Property.js';

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
 * Create Property Request DTO
 */
export interface CreatePropertyRequest {
    title: string;
    description: string;
    price: number;
    address: string;
    location_lat: number;
    location_long: number;
    images: PropertyImageInput[];
    amenity_names?: string[];
}

/**
 * Update Property Request DTO
 * All fields are optional
 */
export interface UpdatePropertyRequest {
    title?: string;
    description?: string;
    price?: number;
    address?: string;
    location_lat?: number;
    location_long?: number;
    status?: PropertyStatusType;
    images?: PropertyImageInput[];
    amenity_names?: string[];
}

/**
 * Property Query/Filter Parameters
 */
export interface PropertyQuery {
    status?: PropertyStatusType;
    minPrice?: number;
    maxPrice?: number;
    landlordId?: string;
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
    price: number;
    address: string;
    locationLat: number;
    locationLong: number;
    status: PropertyStatusType;
    createdAt: Date;
    images: PropertyImageResponse[];
    amenities: AmenityResponse[];
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
