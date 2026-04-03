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
    maintenanceResponsibilities?: Array<{
        area: string;
        responsible_party: 'LANDLORD' | 'TENANT';
    }>;
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
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
    landlordId?: string;
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

export interface CreatePropertyPayload {
    title: string;
    description: string;
    monthly_price: number;
    security_deposit: number;
    address: string;
    type: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'CHALET';
    furnishing: 'Fully' | 'Semi' | 'Unfurnished';
    target_tenant: 'ANY' | 'STUDENTS' | 'FAMILIES' | 'TOURISTS';
    availability_date: string;
    images: Array<{
        image_url: string;
        is_main: boolean;
    }>;
    specifications: {
        bedrooms: number;
        bathrooms: number;
        area_sqft: number;
    };
    maintenance_responsibilities?: Array<{
        area: string;
        responsible_party: 'LANDLORD' | 'TENANT';
    }>;
    detailed_location: {
        floor: number;
        city: string;
        area: string;
        street_name: string;
        building_number: string;
        unit_apt: string;
        location_lat: number;
        location_long: number;
    };
}

interface PropertyMutationResponse {
    success: boolean;
    message: string;
    data: PropertyResponse;
}

class PropertyService {
    async getAllProperties(params?: PropertyQueryParams): Promise<GetPropertiesApiResponse> {
        const response = await apiClient.get<GetPropertiesApiResponse>('/properties', { params });
        return response.data;
    }

    async createProperty(payload: CreatePropertyPayload): Promise<PropertyMutationResponse> {
        const response = await apiClient.post<PropertyMutationResponse>('/properties', payload);
        return response.data;
    }

    async publishProperty(propertyId: string): Promise<PropertyMutationResponse> {
        const response = await apiClient.put<PropertyMutationResponse>(`/properties/${propertyId}`, {
            status: 'Published',
        });
        return response.data;
    }

    async updateProperty(propertyId: string, payload: any): Promise<PropertyMutationResponse> {
        const response = await apiClient.put<PropertyMutationResponse>(`/properties/${propertyId}`, payload);
        return response.data;
    }
}

export const propertyService = new PropertyService();
export default propertyService;
