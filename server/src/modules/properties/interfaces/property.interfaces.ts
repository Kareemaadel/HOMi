import type { PropertyStatusType, FurnishingStatusType, PropertyTypeType, TargetTenantType } from '../models/Property.js';

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
 * House Rule Response DTO
 */
export interface HouseRuleResponse {
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
    type?: PropertyTypeType;
    furnishing: FurnishingStatusType;
    target_tenant?: TargetTenantType;
    availability_date: string; // ISO date string (YYYY-MM-DD)
    images: PropertyImageInput[];
    amenity_names?: string[];
    house_rule_names?: string[];
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
    type?: PropertyTypeType;
    furnishing?: FurnishingStatusType;
    status?: PropertyStatusType;
    target_tenant?: TargetTenantType;
    availability_date?: string;
    images?: PropertyImageInput[];
    amenity_names?: string[];
    house_rule_names?: string[];
    specifications?: Partial<PropertySpecificationsInput>;
}

/**
 * Property Query/Filter Parameters
 */
export interface PropertyQuery {
    status?: PropertyStatusType;
    type?: PropertyTypeType;
    furnishing?: FurnishingStatusType;
    target_tenant?: TargetTenantType;
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
    type: PropertyTypeType | null;
    furnishing: FurnishingStatusType | null;
    status: PropertyStatusType;
    targetTenant: TargetTenantType;
    availabilityDate: Date | string | null;
    createdAt: Date;
    images: PropertyImageResponse[];
    amenities: AmenityResponse[];
    houseRules: HouseRuleResponse[];
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
