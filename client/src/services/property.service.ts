import apiClient from '../config/api';

export interface PropertyImageResponse {
    id: string;
    propertyId: string;
    imageUrl: string;
    isMain: boolean;
}

export interface AmenityResponse {
    id: string;
    name: string;
}

export interface HouseRuleResponse {
    id: string;
    name: string;
}

export interface PropertySpecificationsResponse {
    id: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
}

export interface PropertyLandlordResponse {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
}

export interface PropertyResponse {
    id: string;
    landlordId: string;
    title: string;
    description: string;
    monthlyPrice: number;
    securityDeposit: number;
    address: string;
    type: string | null;
    furnishing: string | null;
    status: string;
    targetTenant: string;
    availabilityDate: string | null;
    createdAt: string;
    images: PropertyImageResponse[];
    amenities: AmenityResponse[];
    houseRules: HouseRuleResponse[];
    specifications: PropertySpecificationsResponse | null;
    landlord: PropertyLandlordResponse | null;
}

export interface PropertyQueryParams {
    status?: 'Draft' | 'Published' | 'Rented';
    type?: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'CHALET';
    furnishing?: 'Fully' | 'Semi' | 'Unfurnished';
    target_tenant?: 'ANY' | 'STUDENTS' | 'FAMILIES' | 'TOURISTS';
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

interface GetPropertiesApiResponse {
    success: boolean;
    data: PropertyResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class PropertyService {
    async getAllProperties(params?: PropertyQueryParams): Promise<GetPropertiesApiResponse> {
        const response = await apiClient.get<GetPropertiesApiResponse>('/properties', { params });
        return response.data;
    }
}

export const propertyService = new PropertyService();
export default propertyService;
