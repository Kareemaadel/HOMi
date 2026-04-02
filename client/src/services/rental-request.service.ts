import apiClient from '../config/api';

export type RentalDuration = '6_MONTHS' | '12_MONTHS' | '24_MONTHS';
export type LivingSituation = 'SINGLE' | 'FAMILY' | 'MARRIED' | 'STUDENTS';

export interface SubmitRentalRequestPayload {
    property_id: string;
    move_in_date: string;          // YYYY-MM-DD
    duration: RentalDuration;
    occupants: number;
    living_situation: LivingSituation;
    message: string;
}

export interface RentalRequestResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        propertyId: string;
        tenantId: string;
        status: string;
        moveInDate: string;
        duration: RentalDuration;
        occupants: number;
        livingSituation: LivingSituation;
        message: string;
        createdAt: string;
    };
}

class RentalRequestService {
    async submitRentalRequest(payload: SubmitRentalRequestPayload): Promise<RentalRequestResponse> {
        const response = await apiClient.post<RentalRequestResponse>('/rental-requests', payload);
        return response.data;
    }
}

export const rentalRequestService = new RentalRequestService();
export default rentalRequestService;
